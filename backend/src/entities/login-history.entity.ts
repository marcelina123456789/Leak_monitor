import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('login_history')
export class LoginHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'ip_address' })
  ipAddress: string;

  @Column({ name: 'user_agent' })
  userAgent: string;

  @Column({ name: 'login_time' })
  loginTime: Date;

  @Column()
  success: boolean;

  @ManyToOne(() => User, (user) => user.loginLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
