import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as dotenv from 'dotenv';
import { ProjectModule } from 'src/project/project.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
dotenv.config()
@Module({
  imports:[UserModule,
    ConfigModule.forRoot(),
     PassportModule,
      ProjectModule, 
      JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET') || 'mysecret',
          signOptions: {
            expiresIn: '10h',
          },
        }),
      }),],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports:[JwtModule]
})
export class AuthModule {}
