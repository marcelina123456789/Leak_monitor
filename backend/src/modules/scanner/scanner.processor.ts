// src/modules/scanner/scanner.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ScannerService } from './scanner.service';

@Processor('scanner_queue')
export class ScannerProcessor extends WorkerHost {
  constructor(private readonly scannerService: ScannerService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { email, userId } = job.data;
    console.log(`🔍 Rozpoczynam skanowanie dla: ${email}`);
    
    return await this.scannerService.scanEmail(email, userId);
  }
}
