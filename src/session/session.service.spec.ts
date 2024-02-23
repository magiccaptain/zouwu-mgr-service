import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import dayjs from 'dayjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { CreateSessionDto } from './dto/create-session.dto';
import { Session, SessionSchema } from './entities/session.entity';
import { SessionService } from './session.service';

const mockSession: CreateSessionDto = {
  expireAt: dayjs().add(7, 'day').toDate(),
  subject: '1234',
};

describe('SessionService', () => {
  let sessionService: SessionService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let sessionModel: Model<Session>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    sessionModel = mongoConnection.model<Session>(Session.name, SessionSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: getModelToken(Session.name),
          useValue: sessionModel,
        },
      ],
    }).compile();

    sessionService = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(sessionService).toBeDefined();
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('createSession', () => {
    it('should create a session', async () => {
      const toBeCreated = mockSession;
      const session = await sessionService.create(toBeCreated);
      expect(session).toBeDefined();
      expect(session).toMatchObject(toBeCreated);
    });
  });

  describe('getSession', () => {
    it('should get a session', async () => {
      const toBeCreated = mockSession;
      const session = await sessionService.create(toBeCreated);
      expect(session).toBeDefined();

      const found = await sessionService.get(session.id);
      expect(found).toBeDefined();
      expect(found).toMatchObject(toBeCreated);
    });
  });

  describe('deleteSession', () => {
    it('should delete a session', async () => {
      const toBeCreated = mockSession;
      const session = await sessionService.create(toBeCreated);
      expect(session).toBeDefined();

      await sessionService.delete(session.id);
      const found = await sessionService.get(session.id);
      expect(found).toEqual(null);
    });
  });

  describe('listSession', () => {
    it('should list sessions', async () => {
      await sessionService.create(mockSession);
      await sessionService.create(mockSession);
      await sessionService.create(mockSession);
      const sessions = await sessionService.list({});
      expect(sessions).toBeDefined();
      expect(sessions).toHaveLength(3);
    });
  });

  describe('countSession', () => {
    it('should count sessions', async () => {
      await sessionService.create(mockSession);
      await sessionService.create(mockSession);
      await sessionService.create(mockSession);
      const count = await sessionService.count({});
      expect(count).toBeDefined();
      expect(count).toBe(3);
    });
  });

  describe('updateSession', () => {
    it('should update a session', async () => {
      const toBeCreated = mockSession;
      const session = await sessionService.create(toBeCreated);
      expect(session).toBeDefined();

      const updateDoc = { subject: 'updated subject' };
      const updated = await sessionService.update(session.id, updateDoc);
      expect(updated).toBeDefined();
      expect(updated).toMatchObject(updateDoc);
    });
  });

  describe('findByKey', () => {
    it('should find a session by key', async () => {
      const toBeCreated = mockSession;
      const session = await sessionService.create(toBeCreated);
      expect(session).toBeDefined();

      const found = await sessionService.findByKey(session.key);
      expect(found).toBeDefined();
      expect(found).toMatchObject(toBeCreated);
    });
  });

  describe('findAndMaybeRefreshKey', () => {
    it('should find a session by key and refresh key', async () => {
      const toBeCreated = mockSession;
      const session = await sessionService.create(toBeCreated);
      expect(session).toBeDefined();

      const found = await sessionService.findAndMaybeRefreshKey(session.key);
      expect(found).toBeDefined();
      expect(found).toMatchObject(toBeCreated);
    });
  });
});
