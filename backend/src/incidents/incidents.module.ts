// src/incidents/incidents.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticsearchModule } from '@nestjs/elasticsearch'; // <--- IMPORT MODUŁU ELASTIC
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { Incident } from '../entities/incident.entity';
import { BreachesController } from './breaches.controller';

@Module({
  imports: [
    // Rejestracja encji w TypeORM
    TypeOrmModule.forFeature([Incident]),
    
    // Rejestracja modułu Elasticsearch, aby BreachesController mógł korzystać z ElasticsearchService
    ElasticsearchModule.register({
      node: 'http://localhost:9200',
    }),
  ],
  controllers: [IncidentsController, BreachesController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
