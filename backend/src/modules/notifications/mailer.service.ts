// src/modules/notifications/mailer.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // np. email-smtp.us-east-1.amazonaws.com
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendLeakAlert(to: string, emailAccount: string, source: string) {
    await this.transporter.sendMail({
      from: '"Leak Monitor Alert" <no-reply@yourdomain.com>',
      to,
      subject: '🚨 Wykryto wyciek Twoich danych!',
      html: `
        <h1>Uwaga!</h1>
        <p>Twoje konto: <b>${emailAccount}</b> pojawiło się w nowym wycieku: <b>${source}</b>.</p>
        <p>Zalecamy natychmiastową zmianę haseł.</p>
      `,
    });
  }
}
