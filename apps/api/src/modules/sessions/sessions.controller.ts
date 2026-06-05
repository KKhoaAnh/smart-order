import { Controller, Post, Body, Req } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { InitSessionDto } from './dto/init-session.dto';
import { Request } from 'express';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('init')
  async initSession(@Body() dto: InitSessionDto, @Req() req: Request) {
    const ip = req.ip || req.connection?.remoteAddress;
    return this.sessionsService.initSession(dto, ip);
  }
}
