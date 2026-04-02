import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const appServiceMock = {
    getHello: jest.fn().mockReturnValue('Hello World!'),
    getHealth: jest.fn().mockReturnValue({
      status: 'ok',
      database: 'connected',
      timestamp: '2026-04-03T00:00:00.000Z',
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appServiceMock,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return the current health payload', () => {
      expect(appController.getHealth()).toEqual({
        status: 'ok',
        database: 'connected',
        timestamp: '2026-04-03T00:00:00.000Z',
      });
    });
  });
});
