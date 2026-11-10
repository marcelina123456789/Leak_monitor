import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserEmail } from './user-email.entity';
import { LoginHistory } from './login-history.entity';
import { Incident } from './incident.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'primary_email' })
  primary_email: string;

  // Aliasy dla kompatybilności z serwisami
  get email(): string { return this.primary_email; }
  set email(value: string) { this.primary_email = value; }

  @Column({ name: 'password_hash' })
  password_hash: string;

  get password(): string { return this.password_hash; }
  set password(value: string) { this.password_hash = value; }

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserEmail, (ue) => ue.user)
  monitoredEmails: UserEmail[];

  @OneToMany(() => LoginHistory, (lh) => lh.user)
  loginLogs: LoginHistory[];

  @OneToMany(() => Incident, (i) => i.user)
  incidents: Incident[];
}
