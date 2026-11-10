import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('email_breach_matches')
export class EmailBreachMatch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_email_id' })
  userEmailId: number;

  @Column({ name: 'breach_id' })
  breachId: number;

  @Column({ name: 'data_types_exposed' })
  dataTypesExposed: string;

  @Column({ name: 'risk_level' })
  riskLevel: number;

  @CreateDateColumn({ name: 'found_at' })
  foundAt: Date;
}
