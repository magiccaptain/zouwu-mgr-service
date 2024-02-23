import { IsNotEmpty, IsString } from 'class-validator';

export class LoginSessionDto {
  /**
   * 用户名 或者 Email
   */
  @IsNotEmpty()
  @IsString()
  login: string;

  /**
   * 密码
   */
  @IsNotEmpty()
  @IsString()
  password: string;
}
