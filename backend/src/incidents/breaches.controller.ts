// src/incidents/breaches.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';

@Controller('breaches')
@UseGuards(JwtAuthGuard)
export class BreachesController {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @Get()
  async getAllBreaches() {
    try {
      // Pobieramy absolutnie wszystkie dokumenty z indeksu 'breaches' w Elastic
      const { hits } = await this.elasticsearchService.search({
        index: 'breaches',
        query: {
          match_all: {}
        },
        size: 100 // limit pobieranych rekordów
      });

      // Mapujemy wyniki do płaskiej struktury, której oczekuje interface Breach na frontendzie
      return hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source
      }));
    } catch (error) {
      console.error('Błąd pobierania bazy wycieków z ES:', error);
      return [];
    }
  }
}
