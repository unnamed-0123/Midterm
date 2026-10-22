import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('medical_records')
export class MedicalRecordsController {
  constructor(private medicalRecordsService: MedicalRecordsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.medicalRecordsService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.medicalRecordsService.findById(+id);
  }

  @Post()
  async create(
    @Body()
    body: {
      patient_id: number;
      doctor_id: number;
      diagnosis: string;
    },
  ) {
    return this.medicalRecordsService.createRecord(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.medicalRecordsService.updateRecord(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.medicalRecordsService.deleteRecord(+id);
  }
}