import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { AddUserDto } from './dto/addUserDto.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import mongoose, { Types } from 'mongoose';
import { Priority } from 'src/task/enum/priority.enum';

@UseGuards(JwtAuthGuard)
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post("/create")
  createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  
@Get(':id')
  async findOne(@Param('id') id: string) {
    // console.log(id)
    return await this.projectService.findById(id);
}
@Get(':id/tasks')
  async findTasks(@Param('id') id: string) {
    return await this.projectService.findProjectsTask(id);
}

@Patch(':projectId/edit')
  async updateproject(@Param('projectId') projectId:string, @Body() updateProjectDto:UpdateProjectDto){
    return await this.projectService.updateName(projectId, updateProjectDto)
}

@Patch(':projectId/addUsers')
async addUsers(@Param('projectId') projectId:string, @Body() addUserDto:AddUserDto){
  return await this.projectService.addUser(new Types.ObjectId(addUserDto.userId), projectId)
}

@Delete(':projectId/user/:userId')
async removeUser(@Param('projectId') projectId:string, @Param('userId') userId:string){
  return await this.projectService.removeuser(projectId, userId)

}

@Post("/:projectId/inviteUser")
async inviteUser(@Param('projectId') projectId:string, @Body() inviteUserDto:InviteUserDto){
  return await this.projectService.inviteUser(projectId, inviteUserDto)

}


@Delete(':projectId/user/:usreId')
async removeProject(@Param('projectId') projectId:string){
  return await this.projectService.remove(projectId)

}

@Patch(':projectId/changePriority')
async cnangePriority(@Param("projectId") projectId:string, @Query('priority') priority:Priority){
  return await this.projectService.changePriority(projectId, priority)

}

@Get(':userId/projects')
async usersProjects(@Param('userId') userId:string){
  return await this.projectService.getProjectAUserIsIn(userId)
}


}
