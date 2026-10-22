import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.patientsService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.patientsService.findById(+id);
  }

  @Post()
  async create(
    @Body()
    body: {
      first_name: string;
      last_name: string;
      birth_date: string;
      gender: string;
      phone: string | number;
    },
  ) {
    return this.patientsService.createPatient(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.patientsService.updatePatient(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.patientsService.deletePatient(+id);
  }
}