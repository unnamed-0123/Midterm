import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}