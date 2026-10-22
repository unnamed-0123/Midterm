import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AppointmentsService } from './appointment.service';
import { AppointmentsController } from './appointment.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}