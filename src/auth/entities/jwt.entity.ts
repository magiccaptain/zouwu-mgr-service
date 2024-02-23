export interface Acl {
  [key: string]: string[];
}

/**
 * @description JWT Payload
 * 同时支持两种权限模式: ACL/RBAC
 */
export class JwtPayload {
  roles: string[]; // RBAC 角色列表
  ns: string; // 该用户或设备所属的 namespace
  acl: Acl; // ACL 权限控制列表
  jti: string; // jwt 编号
  iss: string; // 签发人
  sub: string; // 授权主体, user id or device id
  aud: string; // 接收jwt的一方，建议填 namespace
  exp: number; // 过期时间
  iat: number; // 签发时间
}
