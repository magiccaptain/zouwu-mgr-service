import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // get session by token
  @ApiOperation({ operationId: 'getSession', summary: 'Get session by token' })
  @ApiOkResponse({ description: 'Get session by token' })
  @Get('/:token')
  getSessionByToken(@Param('token') token: string) {
    const session = this.sessionService.getSession(token);

    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }
}
