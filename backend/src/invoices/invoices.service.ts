import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus, CalculationType, Prisma } from '@prisma/client';
import {
  GenerateInvoiceDto,
  UpdateInvoiceDto,
  RecordPaymentDto,
  InvoiceLineItem,
  PaymentRecord,
} from './dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * BƯỚC 1: Tạo hóa đơn nháp (Draft Invoice)
   * Tự động tính toán tất cả các khoản
   */
  async generateDraft(dto: GenerateInvoiceDto) {
    // 1. Validate format tháng
    if (!/^\d{2}-\d{4}$/.test(dto.month)) {
      throw new BadRequestException(
        'Format tháng không hợp lệ. Phải là MM-YYYY',
      );
    }

    // 2. Kiểm tra đã có hóa đơn tháng này chưa
    const existing = await this.prisma.invoice.findFirst({
      where: {
        contractId: dto.contractId,
        month: dto.month,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Đã có hóa đơn tháng ${dto.month}. Vui lòng sử dụng API update hoặc xóa hóa đơn cũ.`,
      );
    }

    // 3. Lấy thông tin hợp đồng
    const contract = await this.prisma.contract.findUnique({
      where: { id: dto.contractId },
      include: {
        room: { include: { building: true } },
        tenant: true,
      },
    });

    if (!contract) {
      throw new NotFoundException(
        `Không tìm thấy hợp đồng ID: ${dto.contractId}`,
      );
    }

    if (!contract.isActive) {
      throw new BadRequestException(
        'Hợp đồng đã kết thúc, không thể tạo hóa đơn',
      );
    }

    // 4. Khởi tạo line items
    const lineItems: InvoiceLineItem[] = [];

    // ===== TÍNH TIỀN PHÒNG (RENT) =====
    let roomCharge = contract.price;
    let rentNote: string | undefined;

    if (dto.proratedRent) {
      // Tính tiền phòng theo ngày
      const [monthStr, yearStr] = dto.month.split('-');
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);
      const daysInMonth = new Date(year, month, 0).getDate();

      // Ngày bắt đầu tính
      let startDay = dto.startDay ?? contract.startDate.getDate();
      if (startDay > daysInMonth) startDay = daysInMonth;

      const daysStayed = daysInMonth - startDay + 1;
      roomCharge = Math.round((contract.price / daysInMonth) * daysStayed);
      rentNote = `Tính từ ngày ${startDay} (${daysStayed}/${daysInMonth} ngày)`;
    }

    lineItems.push({
      type: 'RENT',
      name: 'Tiền phòng',
      quantity: 1,
      unit: 'tháng',
      unitPrice: contract.price,
      amount: roomCharge,
      note: rentNote,
    });

    // ===== TÍNH DỊCH VỤ BIẾN ĐỔI (ĐIỆN/NƯỚC) =====
    const readings = await this.prisma.serviceReading.findMany({
      where: {
        contractId: dto.contractId,
        month: dto.month,
        isBilled: false, // Chưa lên hóa đơn
      },
      include: { service: true },
    });

    let serviceCharge = 0;

    for (const reading of readings) {
      const amount = reading.totalCost;
      serviceCharge += amount;

      lineItems.push({
        type: reading.service.name.toLowerCase().includes('điện')
          ? 'ELECTRIC'
          : 'WATER',
        name: reading.service.name,
        quantity: reading.usage,
        unit: reading.service.unit,
        unitPrice: reading.unitPrice,
        amount,
        readingId: reading.id,
        serviceId: reading.serviceId,
        note: `Số cũ: ${reading.oldIndex}, Số mới: ${reading.newIndex}`,
      });
    }

    // ===== TÍNH DỊCH VỤ CỐ ĐỊNH (WIFI, RÁC, GỬI XE...) =====
    const fixedServices = await this.prisma.service.findMany({
      where: {
        type: 'FIXED',
        isActive: true,
      },
    });

    for (const service of fixedServices) {
      let quantity = 1;
      let amount = service.price;

      // Tính theo đầu người nếu calculationType = PER_PERSON
      if (service.calculationType === CalculationType.PER_PERSON) {
        quantity = contract.numTenants;
        amount = service.price * quantity;
      }

      serviceCharge += amount;

      lineItems.push({
        type: 'FIXED',
        name: service.name,
        quantity,
        unit: service.unit,
        unitPrice: service.price,
        amount,
        serviceId: service.id,
      });
    }

    // ===== TÍNH NỢ CŨ (PREVIOUS DEBT) =====
    const previousDebt = await this.getUnpaidDebtBefore(
      dto.contractId,
      dto.month,
    );

    if (previousDebt > 0) {
      lineItems.push({
        type: 'DEBT',
        name: 'Nợ tháng trước',
        quantity: 1,
        unitPrice: previousDebt,
        amount: previousDebt,
      });
    }

    // ===== TÍNH TỔNG =====
    const totalAmount = roomCharge + serviceCharge + previousDebt;

    // 5. Tạo hóa đơn nháp
    const invoice = await this.prisma.invoice.create({
      data: {
        contractId: dto.contractId,
        month: dto.month,
        roomCharge,
        serviceCharge,
        extraCharge: 0,
        previousDebt,
        discount: 0,
        totalAmount,
        paidAmount: 0,
        debtAmount: totalAmount,
        status: InvoiceStatus.DRAFT,
        lineItems: lineItems as unknown as Prisma.JsonArray,
        paymentHistory: [],
      },
      include: {
        contract: {
          include: {
            room: { include: { building: true } },
            tenant: true,
          },
        },
      },
    });

    return invoice;
  }

  /**
   * Lấy tổng nợ chưa trả của các tháng TRƯỚC tháng hiện tại
   */
  async getUnpaidDebtBefore(
    contractId: number,
    currentMonth: string,
  ): Promise<number> {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        contractId,
        status: {
          in: [
            InvoiceStatus.PUBLISHED,
            InvoiceStatus.PARTIAL,
            InvoiceStatus.OVERDUE,
          ],
        },
      },
    });

    let totalDebt = 0;
    for (const inv of invoices) {
      // Chỉ tính các tháng TRƯỚC tháng hiện tại
      if (this.compareMonths(inv.month, currentMonth) < 0) {
        totalDebt += inv.debtAmount;
      }
    }

    return totalDebt;
  }

  /**
   * So sánh 2 tháng (MM-YYYY format)
   */
  private compareMonths(a: string, b: string): number {
    const [monthA, yearA] = a.split('-').map(Number);
    const [monthB, yearB] = b.split('-').map(Number);
    if (yearA !== yearB) return yearA - yearB;
    return monthA - monthB;
  }

  /**
   * BƯỚC 2: Thêm khoản phát sinh / giảm giá vào hóa đơn (draft)
   */
  async updateDraft(id: number, dto: UpdateInvoiceDto) {
    const invoice = await this.findOne(id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Chỉ có thể sửa hóa đơn ở trạng thái DRAFT. Vui lòng hủy phát hành trước.',
      );
    }

    const lineItems = invoice.lineItems as unknown as InvoiceLineItem[];

    // Xóa các khoản EXTRA và DISCOUNT cũ
    const filteredItems = lineItems.filter(
      (item) => item.type !== 'EXTRA' && item.type !== 'DISCOUNT',
    );

    // Thêm các khoản phát sinh mới
    let extraCharge = 0;
    if (dto.extraCharges && dto.extraCharges.length > 0) {
      for (const extra of dto.extraCharges) {
        extraCharge += extra.amount;
        filteredItems.push({
          type: 'EXTRA',
          name: extra.name,
          quantity: 1,
          unitPrice: extra.amount,
          amount: extra.amount,
          note: extra.note,
        });
      }
    }

    // Thêm giảm giá nếu có
    const discount = dto.discount ?? invoice.discount;
    if (discount > 0) {
      filteredItems.push({
        type: 'DISCOUNT',
        name: 'Giảm giá',
        quantity: 1,
        unitPrice: -discount,
        amount: -discount,
      });
    }

    // Tính lại tổng
    const totalAmount =
      invoice.roomCharge +
      invoice.serviceCharge +
      extraCharge +
      invoice.previousDebt -
      discount;

    const debtAmount = totalAmount - invoice.paidAmount;

    return this.prisma.invoice.update({
      where: { id },
      data: {
        extraCharge,
        discount,
        totalAmount,
        debtAmount,
        lineItems: filteredItems as unknown as Prisma.JsonArray,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : invoice.dueDate,
        note: dto.note ?? invoice.note,
      },
      include: {
        contract: {
          include: {
            room: { include: { building: true } },
            tenant: true,
          },
        },
      },
    });
  }

  /**
   * BƯỚC 3: Phát hành hóa đơn (Publish)
   * - Chuyển trạng thái từ DRAFT -> PUBLISHED
   * - Đánh dấu các readings đã được bill
   * - Snapshot dữ liệu (đã làm khi generate)
   */
  async publish(id: number) {
    const invoice = await this.findOne(id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Chỉ có thể phát hành hóa đơn ở trạng thái DRAFT',
      );
    }

    // Đánh dấu các readings đã bill
    const lineItems = invoice.lineItems as unknown as InvoiceLineItem[];
    const readingIds = lineItems
      .filter((item) => item.readingId)
      .map((item) => item.readingId as number);

    await this.prisma.$transaction([
      // Cập nhật invoice
      this.prisma.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      }),
      // Đánh dấu readings đã bill
      this.prisma.serviceReading.updateMany({
        where: { id: { in: readingIds } },
        data: { isBilled: true, invoiceId: id },
      }),
    ]);

    return this.findOne(id);
  }

  /**
   * Hủy phát hành (Unpublish) - Chuyển về DRAFT
   */
  async unpublish(id: number) {
    const invoice = await this.findOne(id);

    if (invoice.status !== InvoiceStatus.PUBLISHED) {
      throw new BadRequestException(
        'Chỉ có thể hủy phát hành hóa đơn ở trạng thái PUBLISHED',
      );
    }

    // Bỏ đánh dấu các readings
    const lineItems = invoice.lineItems as unknown as InvoiceLineItem[];
    const readingIds = lineItems
      .filter((item) => item.readingId)
      .map((item) => item.readingId as number);

    await this.prisma.$transaction([
      this.prisma.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.DRAFT,
          publishedAt: null,
        },
      }),
      this.prisma.serviceReading.updateMany({
        where: { id: { in: readingIds } },
        data: { isBilled: false, invoiceId: null },
      }),
    ]);

    return this.findOne(id);
  }

  /**
   * BƯỚC 5: Ghi nhận thanh toán (Record Payment)
   */
  async recordPayment(id: number, dto: RecordPaymentDto) {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Không thể ghi nhận thanh toán cho hóa đơn DRAFT. Vui lòng phát hành trước.',
      );
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Hóa đơn đã được thanh toán đầy đủ');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Không thể thanh toán hóa đơn đã hủy');
    }

    // Tính toán
    const newPaidAmount = invoice.paidAmount + dto.amount;
    const newDebtAmount = invoice.totalAmount - newPaidAmount;

    // Xác định trạng thái mới
    let newStatus: InvoiceStatus = invoice.status;
    if (newDebtAmount <= 0) {
      newStatus = InvoiceStatus.PAID;
    } else if (newPaidAmount > 0) {
      newStatus = InvoiceStatus.PARTIAL;
    }

    // Thêm vào payment history
    const paymentHistory =
      (invoice.paymentHistory as unknown as PaymentRecord[]) || [];
    paymentHistory.push({
      date: dto.paymentDate || new Date().toISOString(),
      amount: dto.amount,
      method: dto.method,
      note: dto.note,
      receivedBy: dto.receivedBy,
    });

    return this.prisma.invoice.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        debtAmount: Math.max(0, newDebtAmount),
        status: newStatus,
        paymentHistory: paymentHistory as unknown as Prisma.JsonArray,
      },
      include: {
        contract: {
          include: {
            room: { include: { building: true } },
            tenant: true,
          },
        },
      },
    });
  }

  /**
   * Hủy hóa đơn
   */
  async cancel(id: number) {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Không thể hủy hóa đơn đã thanh toán');
    }

    // Bỏ đánh dấu các readings nếu đã publish
    if (invoice.status !== InvoiceStatus.DRAFT) {
      const lineItems = invoice.lineItems as unknown as InvoiceLineItem[];
      const readingIds = lineItems
        .filter((item) => item.readingId)
        .map((item) => item.readingId as number);

      await this.prisma.serviceReading.updateMany({
        where: { id: { in: readingIds } },
        data: { isBilled: false, invoiceId: null },
      });
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.CANCELLED },
      include: {
        contract: {
          include: {
            room: { include: { building: true } },
            tenant: true,
          },
        },
      },
    });
  }

  /**
   * Lấy chi tiết hóa đơn
   */
  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            room: { include: { building: true } },
            tenant: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Không tìm thấy hóa đơn ID: ${id}`);
    }

    return invoice;
  }

  /**
   * Lấy hóa đơn theo hợp đồng
   */
  async findByContract(contractId: number) {
    return this.prisma.invoice.findMany({
      where: { contractId },
      orderBy: { month: 'desc' },
      include: {
        contract: {
          include: {
            room: { include: { building: true } },
            tenant: true,
          },
        },
      },
    });
  }

  /**
   * Lấy hóa đơn theo tháng (tất cả hợp đồng)
   */
  async findByMonth(month: string) {
    return this.prisma.invoice.findMany({
      where: { month },
      orderBy: { createdAt: 'desc' },
      include: {
        contract: {
          include: {
            room: { include: { building: true } },
            tenant: true,
          },
        },
      },
    });
  }

  /**
   * Lấy tất cả hóa đơn (có filter)
   */
  async findAll(filters?: {
    status?: InvoiceStatus;
    month?: string;
    buildingId?: number;
  }) {
    const where: Prisma.InvoiceWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.month) {
      where.month = filters.month;
    }

    if (filters?.buildingId) {
      where.contract = {
        room: {
          buildingId: filters.buildingId,
        },
      };
    }

    return this.prisma.invoice.findMany({
      where,
      orderBy: [{ month: 'desc' }, { createdAt: 'desc' }],
      include: {
        contract: {
          include: {
            room: { include: { building: true } },
            tenant: true,
          },
        },
      },
    });
  }

  /**
   * Xóa hóa đơn (chỉ DRAFT hoặc CANCELLED)
   */
  async remove(id: number) {
    const invoice = await this.findOne(id);

    if (
      invoice.status !== InvoiceStatus.DRAFT &&
      invoice.status !== InvoiceStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Chỉ có thể xóa hóa đơn ở trạng thái DRAFT hoặc CANCELLED',
      );
    }

    return this.prisma.invoice.delete({ where: { id } });
  }

  /**
   * Thống kê hóa đơn theo tháng
   */
  async getMonthlyStats(month: string) {
    const invoices = await this.findByMonth(month);

    const stats = {
      month,
      totalInvoices: invoices.length,
      byStatus: {
        draft: 0,
        published: 0,
        partial: 0,
        paid: 0,
        overdue: 0,
        cancelled: 0,
      },
      totalAmount: 0,
      totalPaid: 0,
      totalDebt: 0,
    };

    for (const inv of invoices) {
      const statusKey = inv.status.toLowerCase() as keyof typeof stats.byStatus;
      if (stats.byStatus[statusKey] !== undefined) {
        stats.byStatus[statusKey]++;
      }
      stats.totalAmount += inv.totalAmount;
      stats.totalPaid += inv.paidAmount;
      stats.totalDebt += inv.debtAmount;
    }

    return stats;
  }

  /**
   * Tạo hóa đơn hàng loạt cho tất cả hợp đồng active
   */
  async generateBulkDrafts(month: string) {
    const activeContracts = await this.prisma.contract.findMany({
      where: { isActive: true },
    });

    const results: Array<
      | { success: true; contractId: number; invoiceId: number }
      | { success: false; contractId: number; error: string }
    > = [];

    for (const contract of activeContracts) {
      try {
        const invoice = await this.generateDraft({
          contractId: contract.id,
          month,
        });
        results.push({
          success: true,
          contractId: contract.id,
          invoiceId: invoice.id,
        });
      } catch (error) {
        results.push({
          success: false,
          contractId: contract.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      month,
      total: activeContracts.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      details: results,
    };
  }
}
