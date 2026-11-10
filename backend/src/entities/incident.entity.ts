import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('incident_reports')
export class Incident {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ default: 'open' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @ManyToOne(() => User, (user) => user.incidents)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
