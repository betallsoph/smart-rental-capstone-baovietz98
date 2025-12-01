import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';
import { Service } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo dịch vụ mới
   */
  async create(dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: dto,
    });
  }

  /**
   * Lấy tất cả dịch vụ
   */
  async findAll(includeInactive: boolean = false) {
    return this.prisma.service.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Lấy dịch vụ theo loại (INDEX hoặc FIXED)
   */
  async findByType(type: 'INDEX' | 'FIXED') {
    return this.prisma.service.findMany({
      where: {
        type,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Lấy chi tiết dịch vụ
   */
  async findOne(id: number) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Không tìm thấy dịch vụ với ID: ${id}`);
    }

    return service;
  }

  /**
   * Cập nhật dịch vụ
   */
  async update(id: number, dto: UpdateServiceDto) {
    await this.findOne(id); // Check exists

    return this.prisma.service.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Xóa mềm dịch vụ (set isActive = false)
   */
  async remove(id: number) {
    await this.findOne(id); // Check exists

    return this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Khởi tạo dữ liệu mẫu (Điện, Nước, Wifi...)
   */
  async seedDefaultServices(): Promise<Service[]> {
    const defaultServices = [
      {
        name: 'Điện',
        price: 3500,
        unit: 'kWh',
        type: 'INDEX' as const,
        calculationType: 'PER_USAGE' as const,
      },
      {
        name: 'Nước',
        price: 15000,
        unit: 'm³',
        type: 'INDEX' as const,
        calculationType: 'PER_USAGE' as const,
      },
      {
        name: 'Internet',
        price: 100000,
        unit: 'tháng',
        type: 'FIXED' as const,
        calculationType: 'PER_ROOM' as const,
      },
      {
        name: 'Rác',
        price: 20000,
        unit: 'tháng',
        type: 'FIXED' as const,
        calculationType: 'PER_ROOM' as const,
      },
      {
        name: 'Gửi xe máy',
        price: 100000,
        unit: 'người',
        type: 'FIXED' as const,
        calculationType: 'PER_PERSON' as const,
      },
    ];

    const results: Service[] = [];
    for (const service of defaultServices) {
      // Upsert: Tạo mới nếu chưa có, không làm gì nếu đã có
      const existing = await this.prisma.service.findFirst({
        where: { name: service.name },
      });

      if (!existing) {
        const created = await this.prisma.service.create({ data: service });
        results.push(created);
      } else {
        results.push(existing);
      }
    }

    return results;
  }
}
