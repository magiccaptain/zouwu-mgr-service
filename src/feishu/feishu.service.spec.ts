import { beforeEach, describe, expect, it, jest, mock } from 'bun:test';
import { Test, TestingModule } from '@nestjs/testing';
import fetch from 'node-fetch';

import { FeishuService } from './feishu.service';

// bun:test 不支持 jest.mock(module)，改用 mock.module。
// 借助 ES module 的 live binding，已加载的 FeishuService 也会拿到 mock 后的默认导出。
mock.module('node-fetch', () => ({
  default: mock(),
}));

const mockedFetch = fetch as unknown as jest.MockedFunction<typeof fetch>;

// 与 feishu.service.ts 中的超时保持一致
const FEISHU_REQUEST_TIMEOUT_MS = 10_000;

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
    // bun 在 fake timers 下使用 expect().rejects 会死锁（内部等待依赖真实定时器），
    // 改为手动捕获 rejection；advanceTimersByTime 同步触发超时 abort。
    const captured = notification.then(
      () => {
        throw new Error('expected notifyMaintenance to reject');
      },
      (err) => err
    );
    jest.advanceTimersByTime(FEISHU_REQUEST_TIMEOUT_MS);

    const abortError = await captured;
    expect(abortError).toMatchObject({ name: 'AbortError' });
  });
});
