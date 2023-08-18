import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './controllers/user.controller';
import CreateUserUseCase from './useCases/user/CreateUser';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    ConfigModule,
  ],
  controllers: [UserController],
  providers: [UserRepository, UserService, CreateUserUseCase],
  exports: [UserService, CreateUserUseCase],
})
export class UserModule {}
