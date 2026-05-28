import { SessionController } from './session.controller';
import { SessionService } from './session.service';

describe('SessionController', () => {
  let controller: SessionController;
  let sessionService: jest.Mocked<SessionService>;

  beforeEach(() => {
    sessionService = {
      getSession: jest.fn(),
    } as unknown as jest.Mocked<SessionService>;
    controller = new SessionController(sessionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
