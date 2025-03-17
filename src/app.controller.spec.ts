import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
  describe('loadTest', () => {
    it('should return a test message or perform its calculation', () => {
      const result = appController.loadTest();
      // Ajusta el 'expect' según lo que devuelva tu método:
      expect(result).toContain('Operación completa');
    });
  });
});
