import { BadRequestException } from '@nestjs/common';
import {
  SubscriptionRedemptionDirection,
  SubscriptionRedemptionStatus,
  TransferDirection,
} from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateCustodianTransferDto } from './custodian_transfer.dto';
import { CustodianTransferService } from './custodian_transfer.service';

describe('CustodianTransferService', () => {
  let service: CustodianTransferService;
  let prismaService: {
    custodianTransfer: {
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    subscriptionRedemptionRecord: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaService = {
      custodianTransfer: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      subscriptionRedemptionRecord: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };
    service = new CustodianTransferService(
      prismaService as unknown as PrismaService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create record without association', async () => {
    const dto: CreateCustodianTransferDto = {
      fund_account: 'FA001',
      direction: TransferDirection.IN,
      amount: 100000,
      transfer_date: '2026-05-27',
    };
    const created = {
      id: 1,
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscription_redemption_id: null,
    };
    prismaService.custodianTransfer.create.mockResolvedValue(created as any);

    const result = await service.create(dto);

    expect(result).toEqual(created);
    expect(prismaService.custodianTransfer.create).toHaveBeenCalledWith({
      data: dto,
      include: { subscriptionRedemption: true },
    });
  });

  it('should create record with valid IN+SUBSCRIPTION association', async () => {
    const dto: CreateCustodianTransferDto = {
      fund_account: 'FA001',
      direction: TransferDirection.IN,
      amount: 50000,
      transfer_date: '2026-05-27',
      subscription_redemption_id: 10,
    };
    prismaService.subscriptionRedemptionRecord.findUnique.mockResolvedValue({
      id: 10,
      direction: SubscriptionRedemptionDirection.SUBSCRIPTION,
    } as any);
    const created = {
      id: 1,
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prismaService.custodianTransfer.create.mockResolvedValue(created as any);

    const result = await service.create(dto);

    expect(result).toEqual(created);
    expect(
      prismaService.subscriptionRedemptionRecord.findUnique
    ).toHaveBeenCalledWith({
      where: { id: 10 },
    });
  });

  it('should create record with valid OUT+REDEMPTION association', async () => {
    const dto: CreateCustodianTransferDto = {
      fund_account: 'FA001',
      direction: TransferDirection.OUT,
      amount: 30000,
      transfer_date: '2026-05-27',
      subscription_redemption_id: 20,
    };
    prismaService.subscriptionRedemptionRecord.findUnique.mockResolvedValue({
      id: 20,
      direction: SubscriptionRedemptionDirection.REDEMPTION,
    } as any);
    const created = {
      id: 2,
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prismaService.custodianTransfer.create.mockResolvedValue(created as any);

    const result = await service.create(dto);

    expect(result).toEqual(created);
  });

  it('should reject IN+REDEMPTION association', async () => {
    const dto: CreateCustodianTransferDto = {
      fund_account: 'FA001',
      direction: TransferDirection.IN,
      amount: 50000,
      transfer_date: '2026-05-27',
      subscription_redemption_id: 10,
    };
    prismaService.subscriptionRedemptionRecord.findUnique.mockResolvedValue({
      id: 10,
      direction: SubscriptionRedemptionDirection.REDEMPTION,
    } as any);

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    expect(prismaService.custodianTransfer.create).not.toHaveBeenCalled();
  });

  it('should reject OUT+SUBSCRIPTION association', async () => {
    const dto: CreateCustodianTransferDto = {
      fund_account: 'FA001',
      direction: TransferDirection.OUT,
      amount: 50000,
      transfer_date: '2026-05-27',
      subscription_redemption_id: 10,
    };
    prismaService.subscriptionRedemptionRecord.findUnique.mockResolvedValue({
      id: 10,
      direction: SubscriptionRedemptionDirection.SUBSCRIPTION,
    } as any);

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    expect(prismaService.custodianTransfer.create).not.toHaveBeenCalled();
  });

  it('should return records filtered by fund_account', async () => {
    const records = [
      {
        id: 1,
        fund_account: 'FA001',
        direction: TransferDirection.IN,
        amount: 100,
      },
    ];
    prismaService.custodianTransfer.findMany.mockResolvedValue(records as any);

    const result = await service.findAll({ fund_account: 'FA001' });

    expect(result).toEqual(records);
    expect(prismaService.custodianTransfer.findMany).toHaveBeenCalledWith({
      where: { fund_account: 'FA001' },
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptionRedemption: {
          select: { id: true, direction: true, amount: true, reduce_day: true },
        },
      },
    });
  });

  it('should return all records without filter', async () => {
    const records = [
      { id: 1, fund_account: 'FA001' },
      { id: 2, fund_account: 'FA002' },
    ];
    prismaService.custodianTransfer.findMany.mockResolvedValue(records as any);

    const result = await service.findAll({});

    expect(result).toEqual(records);
    expect(prismaService.custodianTransfer.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptionRedemption: {
          select: { id: true, direction: true, amount: true, reduce_day: true },
        },
      },
    });
  });

  it('should return only OPEN records with matching direction for candidates', async () => {
    const records = [
      {
        id: 1,
        fund_account: 'FA001',
        direction: SubscriptionRedemptionDirection.SUBSCRIPTION,
        status: SubscriptionRedemptionStatus.OPEN,
      },
    ];
    prismaService.subscriptionRedemptionRecord.findMany.mockResolvedValue(
      records as any
    );

    const result = await service.findCandidates({
      fund_account: 'FA001',
      direction: TransferDirection.IN,
    });

    expect(result).toEqual(records);
    expect(
      prismaService.subscriptionRedemptionRecord.findMany
    ).toHaveBeenCalledWith({
      where: {
        fund_account: 'FA001',
        status: SubscriptionRedemptionStatus.OPEN,
        direction: SubscriptionRedemptionDirection.SUBSCRIPTION,
      },
    });
  });

  it('should map OUT direction to REDEMPTION for candidates', async () => {
    prismaService.subscriptionRedemptionRecord.findMany.mockResolvedValue([]);

    await service.findCandidates({
      fund_account: 'FA002',
      direction: TransferDirection.OUT,
    });

    expect(
      prismaService.subscriptionRedemptionRecord.findMany
    ).toHaveBeenCalledWith({
      where: {
        fund_account: 'FA002',
        status: SubscriptionRedemptionStatus.OPEN,
        direction: SubscriptionRedemptionDirection.REDEMPTION,
      },
    });
  });

  it('should update a record', async () => {
    const updated = { id: 1, remark: 'updated' };
    prismaService.custodianTransfer.update.mockResolvedValue(updated as any);

    const result = await service.update(1, { remark: 'updated' });

    expect(result).toEqual(updated);
    expect(prismaService.custodianTransfer.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { remark: 'updated' },
    });
  });

  it('should remove a record', async () => {
    prismaService.custodianTransfer.delete.mockResolvedValue({ id: 1 } as any);

    await service.remove(1);

    expect(prismaService.custodianTransfer.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
