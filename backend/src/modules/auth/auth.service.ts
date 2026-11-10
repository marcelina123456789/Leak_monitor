import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { LoginHistory } from '../../entities/login-history.entity';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(LoginHistory)
    private loginHistoryRepo: Repository<LoginHistory>,
    private jwtService: JwtService,
  ) {}

  /**
   * Pomocnicza funkcja generująca hash SHA-256 w formacie hex
   */
  private hashPasswordSHA256(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Rejestracja nowego użytkownika z hashowaniem SHA-256
   */
  async register(authDto: any) {
    const { email, password } = authDto;

    // Sprawdzamy czy użytkownik już istnieje w bazie
    const existingUser = await this.userRepo.findOne({ 
      where: { primary_email: email } 
    });
    
    if (existingUser) {
      throw new ConflictException('Użytkownik o takim adresie e-mail już istnieje');
    }

    // Hashujemy hasło za pomocą SHA-256 przed zapisem do bazy
    const hashedPassword = this.hashPasswordSHA256(password);
    
    const user = this.userRepo.create({
      primary_email: email,
      password_hash: hashedPassword,
      isActive: true,
    } as any);

    // Wymuszamy na TypeScript całkowite zresetowanie typu z User[] do 'any'
    const savedUser = (await this.userRepo.save(user)) as unknown as any;
    
    // Wycinamy bezpiecznie hash hasła przed wysłaniem do frontendu
    const { password_hash, ...result } = savedUser;
    return result;
  }

  /**
   * Logowanie użytkownika z weryfikacją hasha SHA-256 oraz zapisem historii logowań
   */
  async login(authDto: any, ipAddress: string, userAgent: string) {
    const { email, password } = authDto;

    // Szukamy użytkownika po primary_email
    const user = await this.userRepo.findOne({ 
      where: { primary_email: email } 
    });

    // PRZYPADEK 1: Brak użytkownika w bazie (Nieudane logowanie)
    if (!user) {
      // Ponieważ pole user_id/userId w bazie ma ograniczenie NOT NULL (lub zrywa klucz obcy dla wartości 0),
      // w przypadku braku użytkownika najbezpieczniej jest w ogóle nie przekazywać tego pola,
      // pod warunkiem, że struktura tabeli na to pozwala, lub pominąć ten zapis.
      // Zostawiamy czysty log bez przypisanego userId:
      const log = this.loginHistoryRepo.create({
        ipAddress: ipAddress,
        userAgent: userAgent,
        success: false,
        loginTime: new Date()
      } as any);
      
      try {
        await this.loginHistoryRepo.save(log);
      } catch (e) {
        // Ignorujemy błąd zapisu logu dla nieistniejącego użytkownika, żeby nie blokować aplikacji
      }

      throw new UnauthorizedException('Niepoprawne dane logowania');
    }

    // Hashujemy wpisane hasło i porównujemy z hashem z Postgresa
    const inputPasswordHash = this.hashPasswordSHA256(password);

    // PRZYPADEK 2: Błędne hasło (Nieudane logowanie)
    if (inputPasswordHash !== user.password_hash) {
      const log = this.loginHistoryRepo.create({
        userId: user.id, // Zmienione z user_id na userId (zgodnie z właściwością z encji)
        ipAddress: ipAddress,
        userAgent: userAgent,
        success: false,
        loginTime: new Date()
      } as any);
      await this.loginHistoryRepo.save(log);

      throw new UnauthorizedException('Niepoprawne dane logowania');
    }

    // PRZYPADEK 3: Logowanie udane
    const log = this.loginHistoryRepo.create({
      userId: user.id, // Zmienione z user_id na userId (zgodnie z właściwością z encji)
      ipAddress: ipAddress,
      userAgent: userAgent,
      success: true,
      loginTime: new Date()
    } as any);
    await this.loginHistoryRepo.save(log);

    // Generujemy payload dla JWT
    const payload = { email: user.primary_email, sub: user.id };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.primary_email
      }
    };
  }

  /**
   * Pobieranie historii logowań dla konkretnego zalogowanego użytkownika
   */
  async getLoginHistory(userId: number) {
    const sanitizedUserId = Number(userId);

    // Szukamy i sortujemy używając dokładnych nazw pól z encji LoginHistory (camelCase)
    return this.loginHistoryRepo.find({
      where: { userId: sanitizedUserId },
      order: { loginTime: 'DESC' },
      take: 50
    });
  }

  /**
   * Zmiana hasła użytkownika z weryfikacją starego hasha SHA-256
   */
  async changePassword(userId: number, changePasswordDto: any) {
    const { currentPassword, newPassword } = changePasswordDto;
    
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Użytkownik nie istnieje');
    }

    // Weryfikacja obecnego hasła
    const currentHash = this.hashPasswordSHA256(currentPassword);
    if (currentHash !== user.password_hash) {
      throw new UnauthorizedException('Obecne hasło jest niepoprawne');
    }

    // Zapis nowego hasła jako SHA-256
    user.password_hash = this.hashPasswordSHA256(newPassword);
    await this.userRepo.save(user);

    return { message: 'Hasło zostało pomyślnie zmienione' };
  }
}
