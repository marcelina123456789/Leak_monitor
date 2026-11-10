import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard'; // guard z JWT

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Body() createDto: any, @Request() req) {
    return this.incidentsService.create(createDto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.incidentsService.findAll(req.user.id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.incidentsService.updateStatus(id, status);
  }
}
