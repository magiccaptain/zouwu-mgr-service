import { FundAccountController } from './fund_account.controller';
import { FundAccountService } from './fund_account.service';

describe('FundAccountController', () => {
  let controller: FundAccountController;
  let fundAccountService: jest.Mocked<
    Pick<FundAccountService, 'getNextTradingDay'>
  >;

  beforeEach(() => {
    fundAccountService = {
      getNextTradingDay: jest.fn(),
    };
    controller = new FundAccountController(
      fundAccountService as unknown as FundAccountService
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return next trading day', () => {
    fundAccountService.getNextTradingDay.mockReturnValue('2026-05-25');

    expect(controller.queryNextTradingDay({ base_date: '2026-05-22' })).toEqual(
      {
        next_trading_day: '2026-05-25',
      }
    );
    expect(fundAccountService.getNextTradingDay).toHaveBeenCalledWith(
      '2026-05-22'
    );
  });

  xit('should check trade time', () => {
    controller.cannotDoInTradeTime();
  });
});
