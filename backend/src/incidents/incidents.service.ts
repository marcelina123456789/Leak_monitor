import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from '../entities/incident.entity';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private incidentRepository: Repository<Incident>,
  ) {}

  // 1. Pobieranie wszystkich incydentów użytkownika
  async findAll(userId: number) {
    return this.incidentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // 2. Tworzenie nowego incydentu
  async create(createDto: any, user: any) {
    const newIncident = this.incidentRepository.create({
      userId: user.id,
      title: createDto.title,
      description: createDto.description,
      status: 'open',
    });

    return this.incidentRepository.save(newIncident);
  }

  // 3. Aktualizacja statusu (np. zamknięcie zgłoszenia)
  async updateStatus(id: string, status: string) {
    // Konwersja id ze stringa na number
    const incident = await this.incidentRepository.findOne({ 
      where: { id: parseInt(id) } 
    }); 

    if (incident) {
      incident.status = status;
      
      if (status === 'resolved') {
        incident.resolvedAt = new Date();
      } else {
        incident.resolvedAt = null;
      }

      return this.incidentRepository.save(incident);
    }
    
    return null;
  }

  // 4. Pobieranie pojedynczego incydentu
  async findOne(id: string) {
    return this.incidentRepository.findOne({ 
      where: { id: parseInt(id) } 
    });
  }
}
