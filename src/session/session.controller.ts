import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import dayjs from 'dayjs';
import { Response } from 'express';

import {
  AuthService,
  LocalAuthGuard,
  Public,
  RequestWithPassport,
} from 'src/auth';
import { errCodes } from 'src/common';
import { splitShortTimeSpan } from 'src/lib/lang/time';

import { CreateSessionDto } from './dto/create-session.dto';
import { ListSessionQuery } from './dto/list-session.dto';
import { LoginSessionDto } from './dto/login-session.dto';
import { RefreshSessionDto } from './dto/refresh-session.dto';
import { RestrictTokenDto } from './dto/restrict-token.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import {
  OnlyToken,
  Session,
  SessionWithToken,
} from './entities/session.entity';
import { SessionService } from './session.service';

@ApiTags('auth')
@Controller('sessions')
export class SessionController {
  constructor(
    private sessionService: SessionService,
    private authService: AuthService
  ) {}

  /**
   * Create session
   */
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'createSession' })
  @ApiCreatedResponse({
    description: 'The session has been successfully created.',
    type: Session,
  })
  @Post()
  create(@Body() createDto: CreateSessionDto) {
    return this.sessionService.create(createDto);
  }

  /**
   * List sessions
   */
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'listSessions' })
  @ApiOkResponse({
    description: 'A paged array of sessions.',
    type: [Session],
  })
  @Get()
  async list(@Query() query: ListSessionQuery, @Res() res: Response) {
    const count = await this.sessionService.count(query);
    const data = await this.sessionService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }

  /**
   * Find session by id
   */
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'getSession' })
  @ApiOkResponse({
    description: 'The session with expected id.',
    type: Session,
  })
  @Get(':sessionId')
  async get(@Param('sessionId') sessionId: string) {
    const session = await this.sessionService.get(sessionId);
    if (!session)
      throw new NotFoundException({
        code: errCodes.NOT_FOUND,
        message: `Session ${sessionId} not found.`,
        keyPattern: 'sessionId',
        keyValue: { sessionId },
      });
    return session;
  }

  /**
   * Update session
   */
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'updateSession' })
  @ApiOkResponse({
    description: 'The session updated.',
    type: Session,
  })
  @Patch(':sessionId')
  async update(
    @Param('sessionId') sessionId: string,
    @Body() updateDto: UpdateSessionDto
  ) {
    const session = await this.sessionService.update(sessionId, updateDto);
    if (!session)
      throw new NotFoundException({
        code: errCodes.NOT_FOUND,
        message: `Session ${sessionId} not found.`,
        keyPattern: 'sessionId',
        keyValue: { sessionId },
      });
    return session;
  }

  /**
   * Delete session
   */
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'deleteSession' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':sessionId')
  async delete(@Param('sessionId') sessionId: string) {
    await this.sessionService.delete(sessionId);
  }

  /**
   * 通过 username、email / password 登录
   *
   * @param req
   * @param loginSessionDto
   * @returns session
   */
  @ApiOperation({ operationId: 'login' })
  @ApiCreatedResponse({
    description: 'The session which is created by login.',
    type: Session,
  })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('@login')
  @HttpCode(200)
  async login(
    @Request() req: RequestWithPassport,
    @Body() body: LoginSessionDto // eslint-disable-line
  ): Promise<SessionWithToken> {
    const session = await this.sessionService.create({
      subject: req.user.subject,
      expireAt: dayjs().add(7, 'day').toDate(),
    });

    // 有效期先用 7 天
    const token = this.authService.signAccessToken(
      { sub: session.subject },
      { expiresIn: '7d' }
    );
    const tokenExpireAt = dayjs().add(1, 'd').toDate();

    return {
      ...session.toJSON(),
      token,
      tokenExpireAt,
    };
  }

  /**
   * 根据 key 刷新 Session
   *
   * key 是用户的授权令牌，token 是用户访问资源的凭证
   *
   * @param refreshSessionDto
   * @returns session
   */
  @ApiOperation({ operationId: 'refreshSession' })
  @ApiCreatedResponse({
    description: 'The session has been successfully refreshed.',
    type: Session,
  })
  @Public()
  @Post('@refresh')
  @HttpCode(200)
  async refresh(
    @Body() refreshSessionDto: RefreshSessionDto
  ): Promise<SessionWithToken> {
    const session = await this.sessionService.findAndMaybeRefreshKey(
      refreshSessionDto.key
    );
    if (!session) {
      throw new NotFoundException({
        code: errCodes.NOT_FOUND,
        message: `Session key ${refreshSessionDto.key} not found.`,
        keyPattern: 'key',
        keyValue: { key: refreshSessionDto.key },
      });
    }

    // 有效期先用 1 天
    const token = this.authService.signAccessToken(
      { sub: session.subject },
      { expiresIn: '1d' }
    );
    const tokenExpireAt = dayjs().add(1, 'd').toDate();

    return {
      ...session.toJSON(),
      token,
      tokenExpireAt,
    };
  }

  /**
   * 返回一个 token
   *
   * 一般用于给设备等提供临时访问凭证
   *
   * @param restrictTokenDto
   * @returns session
   */
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'restictToken' })
  @ApiCreatedResponse({
    description: 'The restricted token.',
    type: OnlyToken,
  })
  @Post('@restrictToken')
  @HttpCode(200)
  async restrict(
    @Request() req: RequestWithPassport,
    @Body() restrictDto: RestrictTokenDto
  ): Promise<OnlyToken> {
    const [span, unit] = splitShortTimeSpan(restrictDto.expiresIn);
    const token = this.authService.signAccessToken(
      { sub: req.user.subject },
      { expiresIn: restrictDto.expiresIn }
    );
    const tokenExpireAt = dayjs().add(span, unit).toDate();

    return {
      token,
      tokenExpireAt,
    };
  }
}
