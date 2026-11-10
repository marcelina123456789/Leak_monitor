import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UserEmail } from '../../entities/user-email.entity';
import { Incident } from '../../entities/incident.entity';
import { ScannerService } from '../scanner/scanner.service';

@Injectable()
export class EmailsService {
  constructor(
    @InjectRepository(UserEmail)
    private readonly emailRepo: Repository<UserEmail>,

    @InjectRepository(Incident)
    private readonly incidentRepo: Repository<Incident>,

    @InjectQueue('notifications_queue')
    private readonly notificationsQueue: Queue,

    private readonly scannerService: ScannerService,
  ) {}

  /**
   * Pobiera wszystkie e-maile przypisane do danego użytkownika wraz z ich wyciekami (incydentami)
   */
  async findAll(userId: number): Promise<any[]> {
    // 1. Pobieramy monitorowane maile użytkownika
    const monitoredEmails = await this.emailRepo.find({
      where: { userId: userId },
      order: { id: 'ASC' },
    });

    // 2. Pobieramy incydenty powiązane z tym użytkownikiem
    const userIncidents = await this.incidentRepo.find({
      where: { userId: userId },
      order: { createdAt: 'DESC' },
    });

    // 3. Mapujemy i dołączamy incydenty do odpowiednich maili (szukając maila w opisie incydentu)
    return monitoredEmails.map((emailEntity) => {
      const emailStr = emailEntity.email.toLowerCase();
      
      // Filtrujemy incydenty, które w opisie zawierają ten konkretny adres e-mail
      const filteredIncidents = userIncidents
        .filter((incident) => incident.description.toLowerCase().includes(emailStr))
        .map((incident) => ({
          id: incident.id,
          source: incident.title.replace('Wykryto wyciek: ', ''), // Wyciągamy samą nazwę źródła (np. Canva Creative Studio Exposure)
          leakedData: incident.description,
          createdAt: incident.createdAt,
        }));

      return {
        ...emailEntity,
        incidents: filteredIncidents, // Przekazujemy tablicę, której oczekuje frontend
      };
    });
  }

  /**
   * Dodaje nowy adres e-mail do monitorowania i natychmiast sprawdza bazę Elasticsearch
   */
  async create(userId: number, email: string): Promise<any> {
    const normalizedEmail = email.toLowerCase().trim();

    // Sprawdzamy czy adres nie jest już dodany
    let emailEntity = await this.emailRepo.findOne({
      where: { email: normalizedEmail, userId: userId },
    });

    if (!emailEntity) {
      const newEmail = this.emailRepo.create({
        email: normalizedEmail,
        isVerified: false,
        userId: userId,
      });
      emailEntity = await this.emailRepo.save(newEmail);
    }

    // Automatyczny skan w poszukiwaniu wycieków w Elasticsearch
    try {
      await this.scannerService.scanEmail(normalizedEmail, userId);
    } catch (error) {
      console.error(`Błąd podczas skanowania e-maila ${normalizedEmail}:`, error);
    }

    // Zlecenie wysyłki maila weryfikacyjnego do kolejki BullMQ
    await this.notificationsQueue.add('send_verification', {
      emailId: emailEntity.id,
      email: emailEntity.email,
    });

    // Zwracamy pełny obiekt struktury (z pustą lub nowo uzupełnioną tablicą incydentów)
    const allEmails = await this.findAll(userId);
    return allEmails.find((e) => e.id === emailEntity.id);
  }

  /**
   * Usuwa adres e-mail z monitorowania
   */
  async remove(userId: number, emailId: number): Promise<{ message: string }> {
    const email = await this.emailRepo.findOne({
      where: { id: emailId, userId: userId },
    });

    if (!email) {
      throw new NotFoundException('Nie znaleziono podanego adresu e-mail lub nie należy on do Ciebie');
    }

    await this.emailRepo.remove(email);
    return { message: 'Adres e-mail został pomyślnie usunięty z monitorowania' };
  }
}
