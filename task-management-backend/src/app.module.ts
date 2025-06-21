import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from "@nestjs/mongoose";
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule} from "@nestjs/config";
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { NotificationModule } from './notification/notification.module';
const URI = process.env.DATABASE_URI||"mongodb+srv://niyatdebesay26:NiyatDebesay@cluster0.am4kuxw.mongodb.net/"
@Module({
  imports: [UserModule,
     AuthModule, 
     ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    MailerModule.forRoot({
      transport:{
        port:465, 
        host:'smtp.gmail.com',
        auth:{
          user:"niyatdebesay26@gmail.com",
          pass:'uqso paak exuy ghse'
        }
      },
      template: {
        dir: join(__dirname, '../templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true
        }
      }
    }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(URI
      
    ),
    ProjectModule,
    TaskModule,
    NotificationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
