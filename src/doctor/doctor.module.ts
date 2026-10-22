import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { DoctorsService } from './doctor.service';
import { DoctorsController } from './doctor.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}