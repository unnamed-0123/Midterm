import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.prescriptionsService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.prescriptionsService.findById(+id);
  }

  @Post()
  async create(
    @Body()
    body: {
      record_id: number;
      medication_name: string;
      dosage: string;
      frequency: string;
    },
  ) {
    return this.prescriptionsService.createPrescription(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.prescriptionsService.updatePrescription(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.prescriptionsService.deletePrescription(+id);
  }
}