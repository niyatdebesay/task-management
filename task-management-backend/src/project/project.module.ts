import { forwardRef, Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schema/project.schema';
import { UserModule } from 'src/user/user.module';
import { TaskModule } from 'src/task/task.module';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[
    forwardRef(() => AuthModule), 
    forwardRef(()=>UserModule),
    forwardRef(() =>TaskModule),
    MongooseModule.forFeature([{name:Project.name, schema:ProjectSchema}])
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports:[ProjectService]
})
export class ProjectModule {}

