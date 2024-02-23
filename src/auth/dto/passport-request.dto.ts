import { Acl } from '../entities/jwt.entity';

export interface PassportAuth {
  subject: string;
  ns?: string;
  roles?: string[];
  acl?: Acl;
}

export class RequestWithPassport {
  user: PassportAuth;
}
