import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { CommonModule } from '../common/common.module';
import { User } from '../common/entities/user.entity';
import { Company } from '../common/entities/company.entity';
import { UsersService } from '../common/services/users.service';
import { TokenGeneratorService } from '../common/services/token-generator.service';
import { AuthResolvers } from './auth.resolvers';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    PassportModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => configService.get('passport'),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => configService.get('jwt'),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Company]),
    CommonModule,
    NotificationModule
  ],
  providers: [
    AuthService,
    JwtStrategy,
    UsersService,
    AuthResolvers,
    TokenGeneratorService,
  ],
})
export class AuthModule { }
