import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { DoctorsModule } from './doctor/doctor.module';
import { AppointmentsModule } from './appointment/appointment.module';
import { PrescriptionsModule } from './prescription/prescriptions.module';
import { MedicalRecordsModule } from './medical_records/medical-records.module';
import { PatientsModule } from './patients/patients.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, UsersModule, AuthModule, DoctorsModule, AppointmentsModule, PrescriptionsModule, MedicalRecordsModule, PatientsModule],
})
export class AppModule {}