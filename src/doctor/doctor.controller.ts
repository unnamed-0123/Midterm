import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.doctorsService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.doctorsService.findById(+id);
  }

  @Post()
  async create(
    @Body()
    body: {
      first_name: string;
      last_name: string;
      specialty: string;
      password: string;
      email: string;
      licence: string;
      years_of_experience: number;
    },
  ) {
    return this.doctorsService.createDoctor(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.doctorsService.updateDoctor(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.doctorsService.deleteDoctor(+id);
  }
}