import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { BullModule } from '@nestjs/bullmq';
import { IncidentsModule } from './incidents/incidents.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/emails/email.module';
import { ScannerModule } from './modules/scanner/scanner.module';

// Importy encji bazy danych
import { User } from './entities/user.entity';
import { UserEmail } from './entities/user-email.entity';
import { Incident } from './entities/incident.entity';
import { LoginHistory } from './entities/login-history.entity';
import { LoginLog } from './entities/login-log.entity';

@Module({
  imports: [
    // Dynamiczna konfiguracja TypeORM
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'pass',
      database: process.env.DB_NAME || 'leak_monitor',
      entities: [User, UserEmail, Incident, LoginHistory, LoginLog],
      synchronize: true, // Zostawiamy włączone dla automatycznej synchronizacji tabel (np. pola emailId)
    }),

    // Konfiguracja kolejki BullMQ (Redis)
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),

    // Moduły aplikacji
    AuthModule,
    EmailModule,
    IncidentsModule,
    ScannerModule,
  ],
})
export class AppModule {}
