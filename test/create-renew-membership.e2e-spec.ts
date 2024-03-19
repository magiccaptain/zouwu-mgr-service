import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import dayjs from 'dayjs';
import { Connection } from 'mongoose';
import request from 'supertest';

import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth';
import { MembershipService, MembershipType } from 'src/membership';
import { OrderService } from 'src/order';
import { PlanChannel, PlanPeriod, PlanService, PlanType } from 'src/plan';
import { SubscriptionService } from 'src/subscription';
import { UserService } from 'src/user';
import { User } from 'src/user/entities/user.entity';

describe('create or renew membership (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let authService: AuthService;
  let planService: PlanService;
  let subscriptionService: SubscriptionService;
  let orderService: OrderService;
  let membershipService: MembershipService;
  let user: User;
  let token: string;

  const mongoUrl = 'mongodb://localhost/create-renew-membership-e2e';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongoUrl), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true })
    );
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    userService = moduleFixture.get<UserService>(UserService);
    planService = moduleFixture.get<PlanService>(PlanService);
    subscriptionService =
      moduleFixture.get<SubscriptionService>(SubscriptionService);
    orderService = moduleFixture.get<OrderService>(OrderService);
    membershipService = moduleFixture.get<MembershipService>(MembershipService);

    user = await userService.upsert({ username: 'xxxxx', ns: 'xxx' });
    token = await authService.signAccessToken(
      { sub: user.id },
      { expiresIn: '10s' }
    );
  });

  afterEach(async () => {
    await (app.get(getConnectionToken()) as Connection).db.dropDatabase();
    app.close();
  });

  // 开通会员
  it(`Create membership`, async () => {
    const plan = await planService.create({
      name: 'test plan name',
      channelItems: [],
      type: PlanType.SINGLE,
      period: PlanPeriod.MONTH,
      originalPrice: '20',
      discountPrice: '18.9',
      firsttimePrice: '10.9',
      enableFirsttimePrice: true,
    });
    const order = await orderService.create({
      uid: user.id,
      planId: plan.id,
      channel: PlanChannel.ALIPAY,
    });
    const purchaseAt = dayjs().toDate();
    const paymentResp = await request(app.getHttpServer())
      .post(`/payments`)
      .send({
        uid: user.id,
        orderId: order.id,
        orderSn: 'xxx',
        purchaseAt,
        channel: PlanChannel.ALIPAY,
        amount: '10.23',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(paymentResp.statusCode).toBe(201);
    const payment = paymentResp.body;
    expect(payment).toBeDefined();

    const membership = await membershipService.getByUId(user.id);
    expect(payment).toBeDefined();
    expect(dayjs(membership.expireAt).format('YYYY-MM-DD HH:mm')).toEqual(
      dayjs(purchaseAt).add(1, 'month').format('YYYY-MM-DD HH:mm')
    );
  });

  // 续费有效期内的会员
  it(`Renew valid membership`, async () => {
    await membershipService.create({
      type: MembershipType.VIP,
      expireAt: dayjs().add(1, 'month').toDate(),
      uid: user.id,
    });
    const plan = await planService.create({
      name: 'test plan name',
      channelItems: [],
      type: PlanType.SINGLE,
      period: PlanPeriod.QUARTER,
      originalPrice: '20',
      discountPrice: '18.9',
      firsttimePrice: '10.9',
      enableFirsttimePrice: true,
    });
    const order = await orderService.create({
      uid: user.id,
      planId: plan.id,
      channel: PlanChannel.ALIPAY,
    });
    const purchaseAt = dayjs().toDate();
    const paymentResp = await request(app.getHttpServer())
      .post(`/payments`)
      .send({
        uid: user.id,
        orderId: order.id,
        orderSn: 'xxx',
        purchaseAt,
        channel: PlanChannel.ALIPAY,
        amount: '10.23',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(paymentResp.statusCode).toBe(201);
    const payment = paymentResp.body;
    expect(payment).toBeDefined();

    const membership = await membershipService.getByUId(user.id);
    expect(payment).toBeDefined();
    expect(dayjs(membership.expireAt).format('YYYY-MM-DD HH:mm')).toEqual(
      dayjs(purchaseAt).add(4, 'month').format('YYYY-MM-DD HH:mm')
    );
  });

  // 续费过期会员
  it(`Renew overdue membership`, async () => {
    await membershipService.create({
      type: MembershipType.VIP,
      expireAt: dayjs().subtract(1, 'month').toDate(),
      uid: user.id,
    });
    const plan = await planService.create({
      name: 'test plan name',
      channelItems: [],
      type: PlanType.SINGLE,
      period: PlanPeriod.YEAR,
      originalPrice: '20',
      discountPrice: '18.9',
      firsttimePrice: '10.9',
      enableFirsttimePrice: true,
    });
    const subscription = await subscriptionService.create({
      uid: user.id,
      planId: plan.id,
      orderAt: dayjs().toDate(),
      renewAt: dayjs().add(1, 'month').toDate(),
      channel: PlanChannel.ALIPAY,
    });
    const purchaseAt = dayjs().toDate();
    const paymentResp = await request(app.getHttpServer())
      .post(`/payments`)
      .send({
        uid: user.id,
        subscriptionId: subscription.id,
        orderSn: 'xxx',
        purchaseAt,
        channel: PlanChannel.ALIPAY,
        amount: '10.23',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(paymentResp.statusCode).toBe(201);
    const payment = paymentResp.body;
    expect(payment).toBeDefined();

    const membership = await membershipService.getByUId(user.id);
    expect(payment).toBeDefined();
    expect(dayjs(membership.expireAt).format('YYYY-MM-DD HH:mm')).toEqual(
      dayjs(purchaseAt).add(1, 'year').format('YYYY-MM-DD HH:mm')
    );
  });
});
