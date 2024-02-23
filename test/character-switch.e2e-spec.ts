import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import dayjs from 'dayjs';
import { omit } from 'lodash';
import { Connection } from 'mongoose';
import request from 'supertest';

import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth';
import { Character, CharacterService, CharacterType } from 'src/character';
import { Gender } from 'src/common/person';
import { TtsModel, TtsModelService } from 'src/tts-model';
import { TunedLLM, TunedLLMService } from 'src/tuned-llm';
import { UserService } from 'src/user';
import { User } from 'src/user/entities/user.entity';
import { VirtualDeviceService } from 'src/virtual-device';
import { Voice, VoiceService } from 'src/voice';

describe('character-switch (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let characterService: CharacterService;
  let authService: AuthService;
  let virtualDeviceService: VirtualDeviceService;
  let ttsModelService: TtsModelService;
  let voiceService: VoiceService;
  let tunedLLMService: TunedLLMService;
  let user: User;
  let token: string;
  let ttsModel: TtsModel;
  let voice: Voice;
  let tunedLLM: TunedLLM;
  let character: Character;

  const mongoUrl = 'mongodb://localhost/character-switch-e2e';

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
    virtualDeviceService = moduleFixture.get<VirtualDeviceService>(VirtualDeviceService);
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

    character = await characterService.create({
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
      prompt: 'aaaaaaaaaaaa',
      type: CharacterType.IP,
      tagIds: [],
      voiceId: voice.id,
      tunedLLMId: tunedLLM.id,
    });
  });

  afterEach(async () => {
    await (app.get(getConnectionToken()) as Connection).db.dropDatabase();
    app.close();
  });

  // 切换角色
  it(`Switch character`, async () => {
    const virtualDevice = await virtualDeviceService.create({
      uid: user.id,
      characterId: character.id,
      name: 'character name',
      avatar: 'character avatar',
      gender: Gender.FEMALE,
      voiceId: voice.id,
      story: 'character story',
      child: {
        name: 'Kid name',
        calcAge: 3,
        birthday: dayjs('2020-03-12').toDate(),
        gender: Gender.FEMALE,
        calcGender: Gender.FEMALE,
        relationship: 'Relationship with kids',
      },
    });

    const character1 = await characterService.create({
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
    const switchCharacterResp = await request(app.getHttpServer())
      .patch(`/virtual-devices/${virtualDevice.id}`)
      .send({
        characterId: character1.id,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(switchCharacterResp.statusCode).toBe(200);
    const virtualDevice1 = switchCharacterResp.body;
    expect(virtualDevice1).toBeDefined();
    expect(virtualDevice1.characterId).toBe(character1.id);
    expect(JSON.stringify(omit(virtualDevice1, ['updateAt', 'characterId']))).toStrictEqual(
      JSON.stringify(omit(virtualDevice.toJSON(), ['updateAt', 'characterId']))
    );
  });
});
