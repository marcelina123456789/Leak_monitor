import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from '../../entities/incident.entity';
import { UserEmail } from '../../entities/user-email.entity';

@Injectable()
export class ScannerService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    
    @InjectRepository(Incident)
    private readonly incidentRepo: Repository<Incident>,

    @InjectRepository(UserEmail)
    private readonly userEmailRepo: Repository<UserEmail>,
  ) {}

  async scanEmail(email: string, userId: number) {
    // 1. Szukamy dopasowania w Elasticsearch
    const { hits } = await this.elasticsearchService.search({
      index: 'breaches', 
      query: {
        term: { 'affected_emails.keyword': email }
      },
    });

    const results = hits.hits;

    // 2. Jeśli coś znaleźliśmy, mapujemy wyniki na bazę Postgres
    if (results.length > 0) {
      const userEmail = await this.userEmailRepo.findOne({
        where: { email: email, userId: userId } as any
      });

      for (const hit of results) {
        const leakData: any = hit._source;
        const sourceTitle = leakData.name || leakData.source || 'Unknown Source';
        
        // 🔥 ZABEZPIECZENIE: Sprawdzamy, czy ten konkretny wyciek dla tego maila już istnieje w bazie SQL
        const existingIncident = await this.incidentRepo.findOne({
          where: {
            userId: userId,
            title: `Wykryto wyciek: ${sourceTitle}`,
            description: Like(`%${email}%`) // Wyszukiwanie tekstu zawierającego dany e-mail
          } as any
        });

        // Jeśli incydent już istnieje, pomijamy jego ponowne dodawanie
        if (existingIncident) {
          continue;
        }
        
        // Jeśli to nowy wyciek – zapisujemy go
        const incident = this.incidentRepo.create({
          userId: userId,
          user: { id: userId },
          title: `Wykryto wyciek: ${sourceTitle}`,
          description: `Znaleziono wyciek dla adresu ${email}. Źródło: ${sourceTitle}. Wyciekły dane: ${leakData.breach_data || 'nieokreślone'}.`,
          source: sourceTitle,
          status: 'open',
          createdAt: new Date(),
        } as any);
        
        await this.incidentRepo.save(incident);
      }
    }

    return results.map(h => h._source);
  }
}

// Pomocniczy import z TypeORM potrzebny do działania metody Like
import { Like } from 'typeorm';
