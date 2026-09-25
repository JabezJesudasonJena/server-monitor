import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { UsersModule } from './users/users.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteServersModule } from './remote-servers/remote-servers.module.js';
import { AuthModule } from './auth/auth.module.js';
import { LogSourcesModule } from './log-sources/log-sources.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'db.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    RemoteServersModule,
    AuthModule,
    LogSourcesModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
