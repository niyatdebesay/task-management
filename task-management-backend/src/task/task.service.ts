import { ConflictException, forwardRef, Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './schema/task.schema';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { Priority } from './enum/priority.enum';
import { Status } from 'src/project/enum/status.enum';
import { ProjectService } from 'src/project/project.service';
import { MailerService } from '@nestjs-modules/mailer';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskUpdatedEvent, TaskAssignedEvent, TaskDeadlineApproachingEvent, TaskCompletedEvent } from '../notification/events/notificationEvent';
@Injectable()
export class TaskService {
  constructor(
    private readonly eventEmitter:EventEmitter2,
    @Inject(forwardRef(() => ProjectService)) 
    private readonly projectService: ProjectService,
    @Inject(forwardRef(()=>UserService))
    private readonly userService:UserService,
    @InjectModel(Task.name) private readonly taskModel:Model<Task>,
    private readonly mailerService:MailerService
  ){}
  async createTask(createTaskDto: CreateTaskDto) {
    const task =await  this.taskModel.findOne({title:createTaskDto.title})
    if (task){
      throw new ConflictException("task with the given title already exists")

    }
    const project = await this.projectService.findProjectById(createTaskDto.project)
    if (!project){
      throw new NotFoundException("Project Not Found")
    }
    if (Array.isArray(createTaskDto.assignedTo) && createTaskDto.assignedTo.length > 0) {
      const assignedToInvalid = createTaskDto.assignedTo.some(
        (user) => !project.teamMembers.includes(new Types.ObjectId(user))
      );
      if (assignedToInvalid) {
        throw new ConflictException(
          "User not in project. Please add user before assigning the task."
        );
      }
    }
    const newTask = await this.taskModel.create(createTaskDto)
    await newTask.save()
    project.task.push(newTask._id as Types.ObjectId);
    await project.save()
    return newTask.toJSON()
  }

  async findByTitle(title:string){
    const  task =await this.taskModel.findOne({title}) 
    if (!task){
      throw new NotFoundException('Task not foune')
    }
    return task.toJSON()
  }
  async findOne(id:string) {
    const task  =  await this.taskModel.findById(id)
    if (!task){
      throw new NotFoundException('Task not found')
    }
    return task.toJSON()

  }

  async assignTask(taskId:string, userId:string) {
    const task = await this.taskModel.findOne({ _id: taskId });
  if (!task) {
    throw new NotFoundException("Task not found");
  }

  const user = await this.userService.findUserById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  const project = await this.projectService.findById((task.project).toString());
  const userIn = project.teamMembers.some(member => 
  (member as any)._id?.toString?.() === userId
);

  if (!userIn) {
    throw new ConflictException("Please add user to the project before assigning them a task");
  }


  if (!task.assignedTo) {
    task.assignedTo = [];
  }

 
  const alreadyAssigned = task.assignedTo.some(member => member.toString() === userId);
  if (alreadyAssigned) {
    throw new ConflictException("User is already assigned to this task");
  }
  const data = {
    name:user.username,
    projectName:project.name,
    taskTitle:task.title,
    taskDescription:task.description,
    dueDate:task.deadline,
  
  

  }
  await this.sendTaskAssignmentEmail(user.email, data)

  task.assignedTo.push(new Types.ObjectId(userId));
  this.eventEmitter.emit('task.assigned', new TaskAssignedEvent(taskId, user.username));

     await task.save()
     return task.toJSON()
  }

  async sendTaskAssignmentEmail(userEmail: string, data: any) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'New Task Assigned',
      template: './task-assigned', 
      context: {
        name: data.name,
        projectName: data.projectName,
        taskTitle: data.taskTitle,
        taskDescription: data.taskDescription,
        dueDate: data.dueDate,
        taskLink: data.taskLink,
      },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    console.log(updateTaskDto);
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
  
    const oldAssignedTo = task.assignedTo
      .filter(userId => userId !== null)
      .map(userId => userId.toString());
  
    if (updateTaskDto.assignedTo) {
      console.log('Old assignedTo:', task.assignedTo);
      console.log('New assignedTo:', updateTaskDto.assignedTo);

      const normalizedAssignedTo = updateTaskDto.assignedTo
        .map(user => (typeof user === 'string' ? user : user._id)) 
        .filter(userId => userId !== null);
  
      const uniqueAssignedTo = [...new Set(normalizedAssignedTo)]; 
      task.assignedTo = uniqueAssignedTo;
      task.markModified('assignedTo'); 
      console.log('Updated assignedTo:', task.assignedTo);
    }
  
    Object.assign(task, updateTaskDto);
    task.updatedAt = new Date();
  
    this.eventEmitter.emit('task.updated', new TaskUpdatedEvent(task.title));
  
    if (updateTaskDto.assignedTo) {
      const newAssignedTo = task.assignedTo.filter(userId => !oldAssignedTo.includes(userId.toString()));
      
      for (const userId of newAssignedTo) {
        const user = await this.userService.findUserById(userId.toString());
        if (user) {
          await this.sendTaskAssignmentEmail(user.email, {
            name: user.username,
            projectName: task.project,
            taskTitle: task.title,
            taskDescription: task.description,
            dueDate: task.deadline,
          });
        }
      }
    }
  
    try {
      const updatedTask = await task.save();

      const assignedToWithDetails = await Promise.all(
        updatedTask.assignedTo.map(async (userId) => {
          const user = await this.userService.findUserById(userId.toString());
          if (!user) {
            console.warn(`User with ID ${userId} not found`);
            return null; 
          }
          return {
            _id: user._id,
            username: user.username,
            email: user.email,
          };
        })
      );

      const filteredAssignedTo = assignedToWithDetails.filter(user => user !== null);
  

      const enrichedTask = {
        ...updatedTask.toJSON(),
        assignedTo: filteredAssignedTo,
      };
  
      console.log(enrichedTask);
      return enrichedTask;
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  }

  async changePriority(priority:Priority, taskId:string){
    const task = await this.taskModel.findById({_id:taskId})
    if (!task){
      throw new NotFoundException("Task not Found")
    }
    task.priority = priority
   
    await task.save()
    return task.toJSON()
  

  }

  async setDeadline(deadline:Date, taskId:string){
    if (new Date(deadline) < new Date()){
      throw new NotAcceptableException("Date value not acceptable")
    }
    const task = await this.taskModel.findById(taskId)
    if (!task){
      throw new NotFoundException('task not found')
    }
    task.deadline = deadline
    
    await task.save()
    return task.toJSON()
    

  }

  async removeUser(taskId:string, userId:string){
    const task = await this.findOne(taskId)
    if (!task.assignedTo.some(id => id.toString() === userId)) {
      throw new NotFoundException('Specified user does not exist in this task');
  }
    task.assignedTo = task.assignedTo.filter(id => id.toString() !== userId);
    await task.save()
    return task.toJSON()

  }

  async changeStatus(status:Status, taskId:string){
    const task = await this.taskModel.findOne({_id:taskId})
    if (!task){
      throw new NotFoundException("Task not Found")
    }
    task.status = status
    await task.save()
    return task.toJSON()
    
  }

  async findTaskForUser(id:Types.ObjectId){
    const tasks = await this.taskModel.find({assignedTo:{$in :[id]}}).lean();
    return tasks

  }

  async checkTaskDeadline(taskId: string, dueDate: Date): Promise<void> {
    const now = new Date();
    const hoursLeft = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60); 
    if (hoursLeft <= 24) {
      this.eventEmitter.emit('task.deadlineApproaching', new TaskDeadlineApproachingEvent(taskId, dueDate));
  }

}

async markTaskCompleted(taskId: string, completedBy: string): Promise<Task> {
  const task = await this.taskModel.findById(taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }
  task.status = Status.COMPLETED
  await task.save();
  this.eventEmitter.emit('task.completed', new TaskCompletedEvent(taskId));
  return task;
}
  
}
