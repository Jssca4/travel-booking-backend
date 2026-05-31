import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async createPayment(
    dto: {
      bookingId: number;
      amount: number;
      paymentMethod: string;
      paymentProof: string;
    },
    userId: number,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Bukan booking kamu');
    }

    if (dto.amount < booking.totalPrice) {
      throw new BadRequestException(
        `Pembayaran kurang. Total yang harus dibayar: ${booking.totalPrice}`,
      );
    }

    if (dto.amount > booking.totalPrice) {
      throw new BadRequestException(
        `Pembayaran melebihi tagihan. Total yang harus dibayar: ${booking.totalPrice}`,
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        bookingId: dto.bookingId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        status: 'PENDING',
      },
    });

    return { message: 'Payment submitted', data: payment };
  }

  async getAllPayments() {
    return this.prisma.payment.findMany({
      include: {
        booking: {
          include: {
            user: true,
            destination: true,
          },
        },
      },
    });
  }

  async confirmPayment(id: number, status: 'CONFIRMED' | 'REJECTED') {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data: { status },
    });

    if (status === 'CONFIRMED') {
      await this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'PAID' },
      });
    }

    return { message: `Payment ${status}`, data: updated };
  }
}