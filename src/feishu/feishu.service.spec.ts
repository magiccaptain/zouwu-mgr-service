import { Test, TestingModule } from '@nestjs/testing';

import { FeishuService } from './feishu.service';

describe('FeishuService', () => {
  let service: FeishuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeishuService],
    }).compile();

    service = module.get<FeishuService>(FeishuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 建议补充实际接口的测试用例，例如如下示例（请根据实际feishu.service.ts调整）
  it('should return expected value', async () => {
    await service.notifyMaintenance('test');
  });
});
