import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.appointmentsService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.appointmentsService.findById(+id);
  }

  @Post()
  async create(
    @Body()
    body: {
      doctor_id: number;
      appointment_time: string;
    },
  ) {
    return this.appointmentsService.createAppointment(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.appointmentsService.updateAppointment(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.appointmentsService.deleteAppointment(+id);
  }
}