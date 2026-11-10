import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { UserEmail } from '../../entities/user-email.entity';
import { Incident } from '../../entities/incident.entity'; // <-- DODAJ TEN IMPORT
import { BullModule } from '@nestjs/bullmq';
import { ScannerModule } from '../scanner/scanner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEmail, Incident]), // <-- DODAJ INCIDENT TUTAJ
    BullModule.registerQueue({ name: 'notifications_queue' }),
    ScannerModule,
  ],
  controllers: [EmailsController],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailModule {}
