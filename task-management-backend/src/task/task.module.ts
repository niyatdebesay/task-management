import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TaskSchema } from './schema/task.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { ProjectModule } from 'src/project/project.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports:[
    forwardRef(() => UserModule),
    forwardRef(()=>ProjectModule),  MongooseModule.forFeature([{name:"Task", schema:TaskSchema}])],
  controllers: [TaskController],
  providers: [TaskService, JwtService],
  exports:[TaskService]
})
export class TaskModule {}
