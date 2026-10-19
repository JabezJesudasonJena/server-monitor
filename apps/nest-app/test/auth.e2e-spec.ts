import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { DatabaseModule } from './../src/database/database.module.js';
import { DatabaseTestModule } from './../src/database/database-test.module.js';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let moduleFix: TestingModule;

  beforeEach(async () => {
    moduleFix = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(DatabaseTestModule)
      .compile();

    app = moduleFix.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);
  });

  it("should return current user", async () => {
    return request(app.getHttpServer()).get('/auth/me').expect(200).expect({
        id:'default-user-1',
        name: 'Default user 1',
        email: 'default-user@example.com'
    })
  })

  afterEach(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    }
    await app?.close();
  });
});
