// src/modules/notifications/notifications.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from './mailer.service';

@Processor('notifications_queue')
export class NotificationsProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { type, data } = job.data;

    if (type === 'LEAK_ALERT') {
      await this.mailerService.sendLeakAlert(data.to, data.email, data.source);
    }
    return {};
  }
}
