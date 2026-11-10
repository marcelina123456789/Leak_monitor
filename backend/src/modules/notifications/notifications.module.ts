// src/modules/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MailerService } from './mailer.service';
import { NotificationsProcessor } from './notifications.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications_queue',
    }),
  ],
  providers: [MailerService, NotificationsProcessor],
  exports: [MailerService], // Eksportujemy, by Moduł Skanowania mógł z niego korzystać
})
export class NotificationsModule {}
