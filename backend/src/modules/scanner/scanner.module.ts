import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ScannerService } from './scanner.service';
import { Incident } from '../../entities/incident.entity';
import { UserEmail } from '../../entities/user-email.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incident, UserEmail]),
    ElasticsearchModule.register({
      node: 'http://localhost:9200',
    }),
  ],
  providers: [ScannerService],
  exports: [ScannerService],
})
export class ScannerModule {}
