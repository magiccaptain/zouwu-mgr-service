import { Test, TestingModule } from '@nestjs/testing';
import fetch from 'node-fetch';

import { FeishuService } from './feishu.service';

jest.mock('node-fetch');

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('FeishuService', () => {
  let service: FeishuService;

  beforeEach(async () => {
    jest.useRealTimers();
    mockedFetch.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [FeishuService],
    }).compile();

    service = module.get<FeishuService>(FeishuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should abort a stalled webhook request', async () => {
    jest.useFakeTimers();
    mockedFetch.mockImplementation((_url, init) => {
      return new Promise((_resolve, reject) => {
        if (!init?.signal) {
          reject(new Error('missing abort signal'));
          return;
        }
        init.signal.addEventListener('abort', () => {
          const error = new Error('request aborted');
          error.name = 'AbortError';
          reject(error);
        });
      });
    });

    const notification = service.notifyMaintenance('test');
    const aborted = expect(notification).rejects.toMatchObject({
      name: 'AbortError',
    });
    await jest.runAllTimersAsync();

    await aborted;
  });
});
