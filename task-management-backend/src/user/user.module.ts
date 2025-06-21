import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectModule } from 'src/project/project.module';
import { TaskModule } from 'src/task/task.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[ 
    forwardRef(() => AuthModule), 
    forwardRef(()=>ProjectModule),
    forwardRef(() => TaskModule),
    MongooseModule.forFeature([{name:"User", schema:UserSchema}])],
  controllers: [UserController],
  providers: [UserService],
  exports:[UserService]
})
export class UserModule {}
