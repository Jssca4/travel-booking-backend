import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';

import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/common/guards/roles.guard';
import { Roles } from '../auth/common/decorators/roles.decorator';
import { Role } from '../auth/common/enums/role.enum';

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // =========================
  // CREATE PAYMENT (CUSTOMER)
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post()
  @ApiOperation({ summary: 'Customer melakukan pembayaran booking' })
  pay(@Body() dto: any, @Request() req) {
    return this.paymentService.createPayment(dto, req.user.sub);
  }

  // =========================
  // GET ALL PAYMENT (ADMIN)
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Admin melihat semua data payment' })
  getAllPayments() {
    return this.paymentService.getAllPayments();
  }

  // =========================
  // CONFIRM PAYMENT (ADMIN)
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('confirm/:id')
  @ApiOperation({ summary: 'Admin konfirmasi / tolak payment' })
  confirm(
    @Param('id') id: string,
    @Body() body: { status: 'CONFIRMED' | 'REJECTED' },
  ) {
    return this.paymentService.confirmPayment(Number(id), body.status);
  }
}