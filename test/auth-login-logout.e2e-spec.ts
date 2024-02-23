import { INestApplication } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import request from 'supertest';

import { SessionWithToken } from 'src/session';
import { UserService } from 'src/user';
import { UserDocument } from 'src/user/entities/user.entity';

import { AppModule } from '../src/app.module';

describe('Web auth (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let user: UserDocument;

  const mongoUrl = 'mongodb://localhost/auth-login-logout-e2e';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongoUrl), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
    user = await userService.upsert({ username: 'test-user', ns: 'test-ns' });
    user.password = 'test123';
    await user.save();
  });

  afterEach(async () => {
    await (app.get(getConnectionToken()) as Connection).db.dropDatabase();
    app.close();
  });

  it(`Login failed via local strategy`, async () => {
    const sessionResp = await request(app.getHttpServer())
      .post('/sessions/@login')
      .send({
        login: user.username,
        password: 'xxxx',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(sessionResp.statusCode).toBe(401);
  });

  it(`login success via local strategy`, async () => {
    // 访问受限资源失败
    let productListResp = await request(app.getHttpServer())
      .get('/products')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(productListResp.statusCode).toBe(401);

    // 登录成功
    const sessionResp = await request(app.getHttpServer())
      .post('/sessions/@login')
      .send({
        login: user.username,
        password: 'test123',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    const session: SessionWithToken = sessionResp.body;
    expect(sessionResp.statusCode).toBe(200);
    expect(session).toBeDefined();

    // 访问受限资源成功
    productListResp = await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${session.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(productListResp.statusCode).toBe(200);

    // 刷新token
    let refreshTokenResp = await request(app.getHttpServer())
      .post('/sessions/@refresh')
      .send({ key: session.key })
      .set('Authorization', `Bearer ${session.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(refreshTokenResp.statusCode).toBe(200);
    const refreshToken: SessionWithToken = refreshTokenResp.body;
    expect(refreshToken).toBeDefined();

    // 新token访问受限资源成功
    productListResp = await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${refreshToken.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(productListResp.statusCode).toBe(200);

    // 退出登录
    await request(app.getHttpServer())
      .delete(`/sessions/${session.id}`)
      .set('Authorization', `Bearer ${refreshToken.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(productListResp.statusCode).toBe(200);

    // 刷新token失败
    refreshTokenResp = await request(app.getHttpServer())
      .post('/sessions/@refresh')
      .send({ key: session.key })
      .set('Authorization', `Bearer ${session.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(refreshTokenResp.statusCode).toBe(404);
  });

  afterEach(() => app.close());
});
