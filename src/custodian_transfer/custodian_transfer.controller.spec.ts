import { TransferDirection } from '@prisma/client';

import { CustodianTransferController } from './custodian_transfer.controller';
import { CustodianTransferService } from './custodian_transfer.service';

describe('CustodianTransferController', () => {
  let controller: CustodianTransferController;
  let custodianTransferService: jest.Mocked<
    Pick<
      CustodianTransferService,
      'create' | 'findAll' | 'findCandidates' | 'update' | 'remove'
    >
  >;

  beforeEach(() => {
    custodianTransferService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findCandidates: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new CustodianTransferController(
      custodianTransferService as unknown as CustodianTransferService
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create to service', async () => {
    const dto = {
      fund_account: 'FA001',
      direction: TransferDirection.IN,
      amount: 100000,
      transfer_date: '2026-05-27',
    };
    const expected = { id: 1, ...dto };
    custodianTransferService.create.mockResolvedValue(expected as any);

    const result = await controller.create(dto);

    expect(result).toEqual(expected);
    expect(custodianTransferService.create).toHaveBeenCalledWith(dto);
  });

  it('should delegate findAll to service with query', async () => {
    const query = { fund_account: 'FA001' };
    const expected = [{ id: 1, fund_account: 'FA001' }];
    custodianTransferService.findAll.mockResolvedValue(expected as any);

    const result = await controller.findAll(query);

    expect(result).toEqual(expected);
    expect(custodianTransferService.findAll).toHaveBeenCalledWith(query);
  });

  it('should delegate findCandidates to service', async () => {
    const query = { fund_account: 'FA001', direction: TransferDirection.IN };
    custodianTransferService.findCandidates.mockResolvedValue([] as any);

    await controller.findCandidates(query);

    expect(custodianTransferService.findCandidates).toHaveBeenCalledWith(query);
  });

  it('should delegate update to service', async () => {
    custodianTransferService.update.mockResolvedValue({ id: 1 } as any);

    await controller.update('1', { remark: 'test' });

    expect(custodianTransferService.update).toHaveBeenCalledWith(1, {
      remark: 'test',
    });
  });

  it('should delegate remove to service', async () => {
    custodianTransferService.remove.mockResolvedValue(undefined as any);

    await controller.remove('1');

    expect(custodianTransferService.remove).toHaveBeenCalledWith(1);
  });
});
