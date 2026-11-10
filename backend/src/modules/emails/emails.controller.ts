import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('emails')
@UseGuards(JwtAuthGuard)
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  // Dopasowane pod frontend: GET /emails/list
  @Get('list')
  async getEmails(@Req() req: any) {
    // req.user.id pochodzi z tokenu JWT zalogowanego użytkownika
    return this.emailsService.findAll(req.user.id);
  }

  // Dopasowane pod frontend: POST /emails/add
  @Post('add')
  async addEmail(@Req() req: any, @Body() body: { email: string }) {
    // Przekazujemy body.email wpisany przez użytkownika w okienku dialogowym
    return this.emailsService.create(req.user.id, body.email);
  }

  // Dopasowane pod frontend: DELETE /emails/:id
  @Delete(':id')
  async removeEmail(@Req() req: any, @Param('id') id: string) {
    return this.emailsService.remove(req.user.id, parseInt(id));
  }
}
