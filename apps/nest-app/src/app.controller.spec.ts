import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Welcome to the Server Monitor API"', () => {
      // Reason: AppController.getHello() returns the API welcome message rather than "Hello World!"
      // What it does: Asserts that calling appController.getHello() returns "Welcome to the Server Monitor API"
      expect(appController.getHello()).toBe('Welcome to the Server Monitor API');
    });
  });
});
