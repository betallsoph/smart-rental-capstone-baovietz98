import { PrismaClient, RoomStatus, ServiceType, CalculationType, InvoiceStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING COMPREHENSIVE SEED (ALL CASES) ---');

    // 1. CLEANUP
    console.log('1. Cleaning up database...');
    // Delete in order to avoid Foreign Key constraints
    console.log('   Deleting data...');
    // Manual deletion order to be safe
    await prisma.notification.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.serviceReading.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.guestRequest.deleteMany();
    await prisma.issue.deleteMany(); 
    await prisma.tenant.deleteMany();
    await prisma.room.deleteMany();
    await prisma.service.deleteMany();
    await prisma.building.deleteMany();
    await prisma.user.deleteMany();

    console.log('   Data cleared.');

    // 2. PASSWORD HASH
    const password = await bcrypt.hash('123456', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // 3. CREATE ADMIN
    console.log('2. Creating Admin...');
    await prisma.user.create({
        data: {
            email: 'admin@demo.com',
            password: adminPassword,
            name: 'Super Admin',
            role: UserRole.ADMIN,
        }
    });

    // 4. INFRASTRUCTURE (Building, Services, Rooms)
    console.log('3. Creating Infrastructure...');
    const sunrise = await prisma.building.create({
        data: { name: 'Sunrise Apartment', address: '123 Le Van Sy, Q3, HCMC' }
    });

    const services = await Promise.all([
        prisma.service.create({ data: { name: 'Điện', price: 3500, unit: 'kWh', type: ServiceType.INDEX, calculationType: CalculationType.PER_USAGE } }),
        prisma.service.create({ data: { name: 'Nước', price: 20000, unit: 'm3', type: ServiceType.INDEX, calculationType: CalculationType.PER_USAGE } }),
        prisma.service.create({ data: { name: 'Internet', price: 100000, unit: 'tháng', type: ServiceType.FIXED, calculationType: CalculationType.PER_ROOM } }),
        prisma.service.create({ data: { name: 'Rác', price: 20000, unit: 'tháng', type: ServiceType.FIXED, calculationType: CalculationType.PER_ROOM } }),
        prisma.service.create({ data: { name: 'Gửi xe', price: 100000, unit: 'chiếc', type: ServiceType.FIXED, calculationType: CalculationType.PER_PERSON } }),
    ]);
    const [elec, water, net, trash, parking] = services;

    const rooms = await Promise.all([
        prisma.room.create({ data: { name: '101', price: 5000000, floor: 1, buildingId: sunrise.id, status: RoomStatus.RENTED, assets: ['Điều hòa', 'Tủ lạnh', 'Giường', 'Tủ quần áo'] } }),
        prisma.room.create({ data: { name: '102', price: 5500000, floor: 1, buildingId: sunrise.id, status: RoomStatus.RENTED, assets: ['Điều hòa', 'Nóng lạnh', 'Giường đôi'] } }),
        prisma.room.create({ data: { name: '103', price: 4500000, floor: 1, buildingId: sunrise.id, status: RoomStatus.RENTED, assets: ['Điều hòa', 'Tủ lạnh'] } }), // Expiring
        prisma.room.create({ data: { name: '104', price: 4000000, floor: 1, buildingId: sunrise.id, status: RoomStatus.AVAILABLE, assets: ['Điều hòa'] } }), // Empty
    ]);
    const [r101, r102, r103, r104] = rooms;

    // 5. TENANT 1: HAPPY PATH (Paid, No Issues)
    console.log('4. Creating Tenant 1 (Happy)...');
    const u1 = await prisma.user.create({
        data: { email: 'tenant1@demo.com', password, name: 'Nguyen Van Happy', role: UserRole.TENANT, phoneNumber: '0901111111' }
    });
    const t1 = await prisma.tenant.create({
        data: { fullName: 'Nguyen Van Happy', phone: '0901111111', cccd: '001', userId: u1.id }
    });
    const c1 = await prisma.contract.create({
        data: {
            roomId: r101.id, tenantId: t1.id, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'),
            price: r101.price, deposit: r101.price, isActive: true,
            initialIndexes: { [elec.id]: 100, [water.id]: 10 }
        }
    });
    // Invoice 1 (Paid)
    await prisma.invoice.create({
        data: {
            contractId: c1.id, month: '01-2026', status: InvoiceStatus.PAID,
            totalAmount: 5500000, paidAmount: 5500000, debtAmount: 0,
            roomCharge: 5000000, serviceCharge: 500000,
            lineItems: []
        }
    });

    // 6. TENANT 2: ISSUES & OVERDUE (The Problem Tenant)
    console.log('5. Creating Tenant 2 (Issues)...');
    const u2 = await prisma.user.create({
        data: { email: 'tenant2@demo.com', password, name: 'Tran Van Issue', role: UserRole.TENANT, phoneNumber: '0902222222' }
    });
    const t2 = await prisma.tenant.create({
        data: { fullName: 'Tran Van Issue', phone: '0902222222', cccd: '002', userId: u2.id }
    });
    const c2 = await prisma.contract.create({
        data: {
            roomId: r102.id, tenantId: t2.id, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'),
            price: r102.price, deposit: r102.price, isActive: true,
            initialIndexes: { [elec.id]: 500, [water.id]: 50 }
        }
    });
    // Invoice 1 (Overdue)
    await prisma.invoice.create({
        data: {
            contractId: c2.id, month: '01-2026', status: InvoiceStatus.OVERDUE,
            totalAmount: 6000000, paidAmount: 0, debtAmount: 6000000,
            roomCharge: 5500000, serviceCharge: 500000,
            lineItems: [], dueDate: new Date('2026-01-10')
        }
    });
    // Open Issue
    await prisma.issue.create({
        data: {
            roomId: r102.id, title: 'Hỏng máy lạnh', description: 'Máy lạnh chảy nước', status: 'OPEN', priority: 'HIGH',
            createdAt: new Date()
        }
    });
    // Notification for Tenant 2
    await prisma.notification.create({
        data: {
            title: 'Nhắc nhở đóng tiền', content: 'Bạn có hóa đơn quá hạn T1/2026. Vui lòng thanh toán gấp.', type: 'PAYMENT', tenantId: t2.id
        }
    });

    // 7. TENANT 3: EXPIRING / EDGE CASE
    console.log('6. Creating Tenant 3 (Expiring)...');
    const u3 = await prisma.user.create({
        data: { email: 'tenant3@demo.com', password, name: 'Le Thi Edge', role: UserRole.TENANT, phoneNumber: '0903333333' }
    });
    const t3 = await prisma.tenant.create({
        data: { fullName: 'Le Thi Edge', phone: '0903333333', cccd: '003', userId: u3.id }
    });
    const c3 = await prisma.contract.create({
        data: {
            roomId: r103.id, tenantId: t3.id, startDate: new Date('2025-08-01'), 
            endDate: new Date('2026-02-10'), // Expiring in a few days relative to "Now" (Assuming Feb 2026 context)
            price: r103.price, deposit: r103.price, isActive: true,
            initialIndexes: { [elec.id]: 1000, [water.id]: 100 }
        }
    });
    // Invoice (Just published/Unpaid)
    await prisma.invoice.create({
        data: {
            contractId: c3.id, month: '02-2026', status: InvoiceStatus.PUBLISHED,
            totalAmount: 4800000, paidAmount: 0, debtAmount: 4800000,
            roomCharge: 4500000, serviceCharge: 300000,
            lineItems: [], dueDate: new Date('2026-02-15')
        }
    });

    // 8. GENERAL NOTIFICATIONS
    await prisma.notification.createMany({
        data: [
            { title: 'Bảo trì thang máy', content: 'Thang máy sẽ bảo trì từ 8h-12h ngày 05/02.', type: 'GENERAL' },
            { title: 'Chúc mừng năm mới', content: 'Ban quản lý chúc mừng năm mới 2026!', type: 'GENERAL' }
        ]
    });

    console.log('--- SEEDING COMPLETED ---');
    console.log('Admin:    admin@demo.com / admin123');
    console.log('Tenant 1: tenant1@demo.com / 123456 (Happy)');
    console.log('Tenant 2: tenant2@demo.com / 123456 (Issues/Overdue)');
    console.log('Tenant 3: tenant3@demo.com / 123456 (Expiring/Pending)');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
