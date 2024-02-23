import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import { Connection } from 'mongoose';
import request from 'supertest';

import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth';
import { CharacterService, CharacterType } from 'src/character';
import { Gender } from 'src/common/person';
import { DeviceService, DeviceStatus } from 'src/device';
import { DeviceAuth } from 'src/device-auth';
import { OnlyToken } from 'src/session';
import { TtsModelService } from 'src/tts-model';
import { TunedLLMService } from 'src/tuned-llm';
import { UserService } from 'src/user';
import { VirtualDevice } from 'src/virtual-device';
import { VoiceService } from 'src/voice';

describe('device-auth-setup (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let characterService: CharacterService;
  let authService: AuthService;
  let deviceService: DeviceService;
  let ttsModelService: TtsModelService;
  let tunedLLMService: TunedLLMService;
  let voiceService: VoiceService;

  const mongoUrl = 'mongodb://localhost/device-auth-setup-e2e';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongoUrl), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    userService = moduleFixture.get<UserService>(UserService);
    characterService = moduleFixture.get<CharacterService>(CharacterService);
    deviceService = moduleFixture.get<DeviceService>(DeviceService);
    ttsModelService = moduleFixture.get<TtsModelService>(TtsModelService);
    tunedLLMService = moduleFixture.get<TunedLLMService>(TunedLLMService);
    voiceService = moduleFixture.get<VoiceService>(VoiceService);
  });

  afterEach(async () => {
    await (app.get(getConnectionToken()) as Connection).db.dropDatabase();
    app.close();
  });

  it(`device auth`, async () => {
    const user = await userService.upsert({ username: 'xxxxx', ns: 'xxx' });
    const token = await authService.signAccessToken({ sub: user.id }, { expiresIn: '10s' });
    const ttsModel = await ttsModelService.create({
      driver: 'xxx',
      name: 'xxx',
      parameter: 'xxx',
      secrets: 'xxx',
      vendor: 'xxx',
    });
    const voice = await voiceService.create({
      name: 'xxx',
      ttsModelId: ttsModel.id,
      parameter: 'xxx',
      showcase: 'Test voice showcase',
      voicer: 'Test voicer',
    });
    const tunedLLM = await tunedLLMService.create({
      driver: 'xxx',
      llm: 'sss',
      name: 'xxx',
      parameter: 'xxx',
      secrets: 'xxx',
    });
    const character = await characterService.create({
      avatar: 'xxx',
      designer: { name: 'xxx' },
      animator: { name: 'xxx' },
      deviceNum: 1,
      gender: Gender.FEMALE,
      intro: 'xxx',
      name: 'xxx',
      prompt: 'prompt',
      type: CharacterType.IP,
      tagIds: [],
      voiceId: voice.id,
      tunedLLMId: tunedLLM.id,
      bgColor: '#ffffff',
      portraitPhotoUrl: 'https://xx.xx.xx',
      story: 'xxx',
    });

    //App 创建虚拟设备
    const virtualDeviceResp = await request(app.getHttpServer())
      .post('/virtual-devices')
      .send({
        name: 'virtual-one',
        avatar: 'https://avatars.githubusercontent.com/u/96055434',
        uid: user.id,
        characterId: character.id,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    const virtualDevice: VirtualDevice = virtualDeviceResp.body;
    expect(virtualDevice).toBeDefined();

    //App 申请临时的 User Access Token
    const uatRes = await request(app.getHttpServer())
      .post('/sessions/@restrictToken')
      .send({ expiresIn: '10s' })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    const uat: OnlyToken = uatRes.body;
    expect(uat).toBeDefined();
    // Device 初始化
    const device = await deviceService.create({
      eid: `eid-1`,
      name: 'xxxx',
      sku: 'xxxx',
      sn: 'xxxx',
      mfrId: new ObjectId().toString(),
      sellerId: new ObjectId().toString(),
      seriesId: new ObjectId().toString(),
      status: DeviceStatus.WAITING,
    });
    const deviceAuthRes = await request(app.getHttpServer())
      .post('/device-auth/setup')
      .send({ vid: virtualDevice.id, eid: device.eid })
      .set('Authorization', `Bearer ${uat.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(deviceAuthRes).toBeDefined();
    const deviceAuth: DeviceAuth = deviceAuthRes.body;

    // 校验 Device 的绑定情况
    const deviceAfterBind = await deviceService.get(device.id);
    expect(deviceAfterBind.virtual.id).toBe(virtualDevice.id);
    expect(deviceAfterBind.characterId).toBe(character.id);
    expect(deviceAfterBind.uid).toBe(user.id);

    // 刷新token
    const refreshRes = await request(app.getHttpServer())
      .post('/device-auth/refresh-token')
      .send({ key: deviceAuth.key })
      .set('Authorization', `Bearer ${deviceAuth.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    const refreshResult: DeviceAuth = refreshRes.body;
    expect(refreshResult.token).toBeDefined();
  });
});
