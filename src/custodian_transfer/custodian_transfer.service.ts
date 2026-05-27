import { BadRequestException, Injectable } from '@nestjs/common';
import {
  SubscriptionRedemptionDirection,
  SubscriptionRedemptionStatus,
  TransferDirection,
} from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

import {
  CandidatesQueryDto,
  CreateCustodianTransferDto,
  ListCustodianTransferQueryDto,
  UpdateCustodianTransferDto,
} from './custodian_transfer.dto';

@Injectable()
export class CustodianTransferService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateCustodianTransferDto) {
    if (dto.subscription_redemption_id != null) {
      const record =
        await this.prismaService.subscriptionRedemptionRecord.findUnique({
          where: { id: dto.subscription_redemption_id },
        });

      if (record) {
        const valid =
          (dto.direction === TransferDirection.IN &&
            record.direction ===
              SubscriptionRedemptionDirection.SUBSCRIPTION) ||
          (dto.direction === TransferDirection.OUT &&
            record.direction === SubscriptionRedemptionDirection.REDEMPTION);

        if (!valid) {
          throw new BadRequestException(
            'Direction mismatch with subscription/redemption record'
          );
        }
      }
    }

    return this.prismaService.custodianTransfer.create({
      data: dto,
      include: { subscriptionRedemption: true },
    });
  }

  async findAll(query: ListCustodianTransferQueryDto) {
    const where: any = {};

    if (query.fund_account) {
      where.fund_account = query.fund_account;
    }

    return this.prismaService.custodianTransfer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptionRedemption: {
          select: { id: true, direction: true, amount: true, reduce_day: true },
        },
      },
    });
  }

  async findCandidates(query: CandidatesQueryDto) {
    const direction =
      query.direction === TransferDirection.IN
        ? SubscriptionRedemptionDirection.SUBSCRIPTION
        : SubscriptionRedemptionDirection.REDEMPTION;

    return this.prismaService.subscriptionRedemptionRecord.findMany({
      where: {
        fund_account: query.fund_account,
        status: SubscriptionRedemptionStatus.OPEN,
        direction,
      },
    });
  }

  async update(id: number, dto: UpdateCustodianTransferDto) {
    return this.prismaService.custodianTransfer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prismaService.custodianTransfer.delete({
      where: { id },
    });
  }
}
