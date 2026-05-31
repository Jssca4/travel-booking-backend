import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { DestinationService } from './destination.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';

import { Roles } from '../auth/common/decorators/roles.decorator';
import { Role } from '../auth/common/enums/role.enum';
import { JwtAuthGuard } from '../auth/common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/common/guards/roles.guard';

@Controller('destination')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  // PUBLIC
  @Get()
  findAll() {
    return this.destinationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.destinationService.findOne(id);
  }

  // ADMIN ONLY
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateDestinationDto) {
    return this.destinationService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDestinationDto,
  ) {
    return this.destinationService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.destinationService.remove(id);
  }
}