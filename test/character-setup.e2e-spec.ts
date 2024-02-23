import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import dayjs from 'dayjs';
import { ObjectId } from 'mongodb';
import { Connection } from 'mongoose';
import request from 'supertest';

import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth';
import { Character, CharacterService, CharacterType } from 'src/character';
import { Gender } from 'src/common/person';
import { Device, DeviceService, DeviceStatus } from 'src/device';
import { TtsModel, TtsModelService } from 'src/tts-model';
import { TunedLLM, TunedLLMService } from 'src/tuned-llm';
import { UserService } from 'src/user';
import { User } from 'src/user/entities/user.entity';
import { VirtualDevice } from 'src/virtual-device';
import { Voice, VoiceService } from 'src/voice';

describe('character-setup (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let characterService: CharacterService;
  let authService: AuthService;
  let deviceService: DeviceService;
  let ttsModelService: TtsModelService;
  let voiceService: VoiceService;
  let tunedLLMService: TunedLLMService;
  let user: User;
  let token: string;
  let ttsModel: TtsModel;
  let voice: Voice;
  let tunedLLM: TunedLLM;
  let characterIP: Character;
  let characterPreset: Character;
  let device: Device;

  const mongoUrl = 'mongodb://localhost/character-setup-e2e';

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
    voiceService = moduleFixture.get<VoiceService>(VoiceService);
    tunedLLMService = moduleFixture.get<TunedLLMService>(TunedLLMService);

    user = await userService.upsert({ username: 'xxxxx', ns: 'xxx' });
    token = await authService.signAccessToken({ sub: user.id }, { expiresIn: '10s' });

    ttsModel = await ttsModelService.create({
      driver: 'xxx',
      name: 'xxx',
      parameter: 'xxx',
      secrets: 'xxx',
      vendor: 'xxx',
    });
    voice = await voiceService.create({
      name: 'Test voice name',
      voicer: 'Test voicer',
      ttsModelId: ttsModel.id,
      parameter: 'Test voice parameter',
      showcase: 'Test voice showcase',
    });
    tunedLLM = await tunedLLMService.create({
      driver: 'xxx',
      llm: 'sss',
      name: 'xxx',
      parameter: 'xxx',
      secrets: 'xxx',
    });

    device = await deviceService.upsert({
      name: '1234',
      eid: 'xxx',
      sn: '1234',
      sku: '1234',
      mfrId: new ObjectId().toString(),
      sellerId: new ObjectId().toString(),
      seriesId: new ObjectId().toString(),
      status: DeviceStatus.SHIPPED,
    });

    characterIP = await characterService.create({
      avatar: 'xxx',
      designer: { name: 'xxx' },
      animator: { name: 'xxx' },
      bgColor: 'xxx',
      portraitPhotoUrl: 'xxx',
      story: 'xxx',
      deviceNum: 1,
      gender: Gender.FEMALE,
      intro: 'xxx',
      name: 'xxx',
      prompt: 'prompt',
      type: CharacterType.IP,
      tagIds: [],
      voiceId: voice.id,
      tunedLLMId: tunedLLM.id,
    });

    characterPreset = await characterService.create({
      avatar: 'xxx',
      designer: { name: 'xxx' },
      animator: { name: 'xxx' },
      bgColor: 'xxx',
      portraitPhotoUrl: 'xxx',
      story: 'xxx',
      deviceNum: 1,
      gender: Gender.FEMALE,
      intro: 'xxx',
      name: 'xxx',
      prompt: 'prompt',
      type: CharacterType.PRESET,
      tagIds: [],
      voiceId: voice.id,
      tunedLLMId: tunedLLM.id,
    });
  });

  // should clear database after each test
  // 需要指定一个 test database 防止删掉线上数据库

  afterEach(async () => {
    await (app.get(getConnectionToken()) as Connection).db.dropDatabase();
    app.close();
  });

  // 选择现有角色创建设备
  it(`Choose IP character to create device`, async () => {
    let virtualDevice: VirtualDevice;
    // 创建虚拟设备
    const createResp = await request(app.getHttpServer())
      .post('/virtual-devices')
      .send({
        uid: user.id,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(createResp.statusCode).toBe(201);
    virtualDevice = createResp.body;
    expect(virtualDevice).toBeDefined();
    expect(virtualDevice.uid).toBe(user.id);

    // 选择IP角色
    let updateResp = await request(app.getHttpServer())
      .patch(`/virtual-devices/${virtualDevice.id}`)
      .send({
        characterId: characterIP.id,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(updateResp.statusCode).toBe(200);
    virtualDevice = updateResp.body;
    expect(virtualDevice).toBeDefined();
    expect(virtualDevice.characterId).toBe(characterIP.id);

    // 设置角色头像和名称
    updateResp = await request(app.getHttpServer())
      .patch(`/virtual-devices/${virtualDevice.id}`)
      .send({
        name: 'Character name',
        avatar: 'Character avatar',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(updateResp.statusCode).toBe(200);
    virtualDevice = updateResp.body;
    expect(virtualDevice).toBeDefined();
    expect(virtualDevice.name).toBe('Character name');
    expect(virtualDevice.avatar).toBe('Character avatar');

    // 设置儿童信息
    const child = {
      name: 'Kid name',
      calcAge: 3,
      birthday: dayjs('2020-03-12').toISOString(),
      gender: Gender.FEMALE,
      calcGender: Gender.FEMALE,
      relationship: 'Relationship with kids',
    };
    updateResp = await request(app.getHttpServer())
      .patch(`/virtual-devices/${virtualDevice.id}`)
      .send({
        child,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(updateResp.statusCode).toBe(200);
    virtualDevice = updateResp.body;
    expect(virtualDevice).toBeDefined();
    expect(virtualDevice.child).toMatchObject(child);

    //绑定设备
    const updateDeviceResp = await request(app.getHttpServer())
      .patch(`/devices/${device.id}`)
      .send({
        virtual: virtualDevice.id,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(updateDeviceResp.statusCode).toBe(200);
    const updateDevice = updateDeviceResp.body;
    expect(updateDevice).toBeDefined();
    expect(updateDevice.virtual).toStrictEqual(virtualDevice);
  });

  // 选择自定义角色创建设备
  it(`Choose custom character to create device`, async () => {
    let virtualDevice: VirtualDevice;
    // 创建虚拟设备
    const createResp = await request(app.getHttpServer())
      .post('/virtual-devices')
      .send({
        uid: user.id,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(createResp.statusCode).toBe(201);
    virtualDevice = createResp.body;
    expect(virtualDevice).toBeDefined();
    expect(virtualDevice.uid).toBe(user.id);

    // 选择内置角色
    let updateResp = await request(app.getHttpServer())
      .patch(`/virtual-devices/${virtualDevice.id}`)
      .send({
        characterId: characterPreset.id,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(updateResp.statusCode).toBe(200);
    virtualDevice = updateResp.body;
    expect(virtualDevice).toBeDefined();
    expect(virtualDevice.characterId).toBe(characterPreset.id);

    // 设置角色性别
    updateResp = await request(app.getHttpServer())
      .patch(`/virtual-devices/${virtualDevice.id}`)
      .send({
        gender: Gender.MALE,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(updateResp.statusCode).toBe(200);
    virtualDevice = updateResp.body;
    expect(virtualDevice).toBeDefined();
    expect(virtualDevice.gender).toBe(Gender.MALE);

    // 设置角色声音
    updateResp = await request(app.getHttpServer())
      .patch(`/virtual-devices/${virtualDevice.id}`)
      .send({
        voiceId: voice.id,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(updateResp.statusCode).toBe(200);
    virtualDevice = updateResp.body;
    expect(virtualDevice).toBeDefined();
    expect(virtualDevice.voiceId).toBe(voice.id);

    // 设置角色背景故事
    updateResp = await request(app.getHttpServer())
      .patch(`/virtual-devices/${virtualDevice.id}`)
      .send({
        story: 'Character story',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(updateResp.statusCode).toBe(200);
    virtualDevice = updateResp.body;
    expect(virtualDevice).toBeDefined();
    expect(virtualDevice.story).toBe('Character story');

    // 设置角色头像和名称
    updateResp = await request(app.getHttpServer())
      .patch(`/virtual-devices/${virtualDevice.id}`)
      .send({
        name: 'Character name',
        avatar: 'Character avatar',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(updateResp.statusCode).toBe(200);
    virtualDevice = updateResp.body;
    expect(virtualDevice).toBeDefined();
    expect(virtualDevice.name).toBe('Character name');
    expect(virtualDevice.avatar).toBe('Character avatar');

    // 设置儿童信息
    const child = {
      name: 'Kid name',
      calcAge: 3,
      birthday: dayjs('2020-03-12').toISOString(),
      gender: Gender.FEMALE,
      calcGender: Gender.FEMALE,
      relationship: 'Relationship with kids',
    };
    updateResp = await request(app.getHttpServer())
      .patch(`/virtual-devices/${virtualDevice.id}`)
      .send({
        child,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(updateResp.statusCode).toBe(200);
    virtualDevice = updateResp.body;
    expect(virtualDevice).toBeDefined();
    expect(virtualDevice.child).toMatchObject(child);

    //绑定设备
    const updateDeviceResp = await request(app.getHttpServer())
      .patch(`/devices/${device.id}`)
      .send({
        virtual: virtualDevice.id,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(updateDeviceResp.statusCode).toBe(200);
    const updateDevice = updateDeviceResp.body;
    expect(updateDevice).toBeDefined();
    expect(updateDevice.virtual).toStrictEqual(virtualDevice);
  });
});
