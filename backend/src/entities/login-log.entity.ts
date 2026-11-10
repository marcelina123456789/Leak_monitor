import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class LoginLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ip_address: string;

  @Column()
  user_agent: string;

  @Column({ default: true })
  success: boolean;

  @CreateDateColumn()
  login_time: Date;

  @ManyToOne(() => User, (user) => user.loginLogs)
  user: User;
}
