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
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { errCodes } from 'src/common';

import { CreateUserDto } from './dto/create-user.dto';
import { ListUserQuery } from './dto/list-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Create user
   */
  @ApiOperation({ operationId: 'createUser' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: User,
  })
  @Post()
  create(@Body() createDto: CreateUserDto) {
    return this.userService.create(createDto);
  }

  /**
   * List users
   */
  @ApiOperation({ operationId: 'listUsers' })
  @ApiOkResponse({
    description: 'A paged array of users.',
    type: [User],
  })
  @Get()
  async list(@Query() query: ListUserQuery, @Res() res: Response) {
    const count = await this.userService.count(query);
    const data = await this.userService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }

  /**
   * Find user by id
   */
  @ApiOperation({ operationId: 'getUser' })
  @ApiOkResponse({
    description: 'The user with expected id.',
    type: User,
  })
  @Get(':userId')
  async get(@Param('userId') userId: string) {
    const user = await this.userService.get(userId);
    if (!user)
      throw new NotFoundException({
        code: errCodes.USER_NOT_FOUND,
        message: `User ${userId} not found.`,
        keyPattern: 'userId',
        keyValue: { userId },
      });
    return user;
  }

  /**
   * Update user
   */
  @ApiOperation({ operationId: 'updateUser' })
  @ApiOkResponse({
    description: 'The user updated.',
    type: User,
  })
  @Patch(':userId')
  async update(@Param('userId') userId: string, @Body() updateDto: UpdateUserDto) {
    const user = await this.userService.update(userId, updateDto);
    if (!user)
      throw new NotFoundException({
        code: errCodes.USER_NOT_FOUND,
        message: `User ${userId} not found.`,
        keyPattern: 'userId',
        keyValue: { userId },
      });
    return user;
  }

  /**
   * Delete user
   */
  @ApiOperation({ operationId: 'deleteUser' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':userId')
  async delete(@Param('userId') userId: string) {
    await this.userService.delete(userId);
  }
}
