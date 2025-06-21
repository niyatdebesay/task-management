import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Priority } from './enum/priority.enum';
import { Status } from 'src/project/enum/status.enum';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { Types } from 'mongoose';
@UseGuards(JwtAuthGuard)
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('/create')
  async create(@Body() createTaskDto: CreateTaskDto) {
    return await this.taskService.createTask(createTaskDto);
  }

  @Get('title/:title')
  async findByTitle(@Param('title') title: string) {
    return await this.taskService.findByTitle(title);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.taskService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    console.log(updateTaskDto)
    return await this.taskService.update(id, updateTaskDto);
  }

  @Patch('assign/:taskId/:userId')
  async assignTask(@Param('taskId') taskId: string, @Param('userId') userId: string) {
    return await this.taskService.assignTask(taskId, userId);
  }

  @Patch('priority/:taskId')
  async changePriority(
    @Param('taskId') taskId: string,
    @Body('priority') priority: Priority
  ) {
    return await this.taskService.changePriority(priority, taskId);
  }

  @Patch('deadline/:taskId')
  async setDeadline(
    @Param('taskId') taskId: string,
    @Body('deadline') deadline: Date
  ) {
    return await this.taskService.setDeadline(deadline, taskId);
  }

  @Delete('removeUser/:taskId/:userId')
  async removeUser(@Param('taskId') taskId: string, @Param('userId') userId: string) {
    return await this.taskService.removeUser(taskId, userId);
  }

  @Patch('status/:taskId')
  async changeStatus(
    @Param('taskId') taskId: string,
    @Body('status') status: Status
  ) {
    return await this.taskService.changeStatus(status, taskId);
  }

  @Get('/:userId/user')
  async findTaskForUser(@Param('userId') userId:string){
    return await this.taskService.findTaskForUser(new Types.ObjectId(userId))
  }


  
}