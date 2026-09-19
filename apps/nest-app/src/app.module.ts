import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { UsersModule } from './users/users.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'db.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
