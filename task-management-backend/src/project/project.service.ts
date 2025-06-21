import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './schema/project.schema';
import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/schemas/user.schema';
import { Priority } from 'src/task/enum/priority.enum';
import { InviteUserDto } from './dto/invite-user.dto';
import { TaskService } from 'src/task/task.service';

@Injectable()
export class ProjectService {

  constructor(
    @Inject(forwardRef(()=>UserService))
    private readonly userService:UserService,
    private readonly mailerService:MailerService,
    private readonly jwtService:JwtService,
    @Inject(forwardRef(() => TaskService)) 
    private readonly taskService: TaskService,
    @InjectModel(Project.name) private readonly projectModel:Model<Project>){}
    async create(createProjectDto: CreateProjectDto) {
      console.log('Owner ID:', createProjectDto.owner); 
      const owner = await this.userService.findUserById(createProjectDto.owner);
      console.log('Found Owner:', owner);  
      console.log('CreateProjectDto:', createProjectDto);
      if (!owner) {
        throw new NotFoundException('User not found');
      }
    
      const project = await this.projectModel.findOne({
        name: createProjectDto.name,
        creator: new mongoose.Types.ObjectId(createProjectDto.owner),
      });
      console.log('Existing Project:', project);  
    
      if (project) {
        throw new ConflictException('Project already exists');
      }
    
      const newProject = await this.projectModel.create({
        ...createProjectDto,
        creator: new mongoose.Types.ObjectId(createProjectDto.owner),
        teamMembers:[new mongoose.Types.ObjectId(createProjectDto.owner)]
      });
    
      console.log('New Project:', newProject);  
    
      await newProject.save();
      return newProject.toJSON();
    }
    

  async inviteUser(projectId:string, inviteUserDto:InviteUserDto){
    const project = await this.projectModel.findById(projectId)
    if (!project){
      throw new ConflictException('Project not found')

    }
  const user = await this.userService.findByEmail(inviteUserDto.email);
  const isSigned = !!user;
  const token = await this.jwtService.signAsync({ email:inviteUserDto.email, projectId, isSigned });
  const Link = `${process.env.LINK}/invite?token=${token}`
  try{
    await this.sendProjectInvitation(inviteUserDto.email, project.name, Link)
    return {message:'Invitation Sent Successfully'}
  }catch(e){
    return e.message
  }
 
 

  }

  async findProjectsTask(projectId:string){
    const project = await this.projectModel.findById(projectId).lean()
    if (!project){
      return new ConflictException('Project not found')

    }
    const tasks = await Promise.all(
      project.task.map(taskId => this.taskService.findOne(taskId.toString()))
    );
    return tasks

  }

  async sendProjectInvitation(email:string, projectName:string, inviteLink:string){
    console.log(inviteLink)
    await this.mailerService.sendMail({
      to:email, 
      subject:`Invitation to join ${projectName}`,
      template:'invite',
      context:{
        projectName,
        baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        inviteToken: inviteLink.split('token=')[1],
        isSigned: inviteLink.includes('isSigned=true')
      }
    })
  }

  async addUser(user:Types.ObjectId, projectId:string){
    const project = await this.projectModel.findById(projectId)
    if (!project){
      return new ConflictException('Project not found')

    }
    const isAlreadyMember = project.teamMembers.some(member => member.toString() === user.toString());
  if (isAlreadyMember) {
    throw new ConflictException('User is already a member of the project');
  }
    project.teamMembers.push(user)
    project.updatedAt = new Date()
    console.log(project)
    await project.save()
    return project.toJSON()


  }

 
  async findProjectById(id:string){
    const project = await this.projectModel.findById(id).exec()
    return project
  }


  async findById(id: string) {
    const project = await this.projectModel.findById(id);
   
    if (!project) {
      throw new NotFoundException("Project does not exist");
    }
  
    
    
    // Get full user information for the team members in the project
    const teamMembers = await Promise.all(
      project.teamMembers.map(async (userId) => {
        const user = await this.userService.findOne(userId.toString());
        if (user instanceof NotFoundException) {
          
          throw new NotFoundException(`User with ID ${userId} not found`);
        }
        return user;
      })
    );
    console.log(project.task)

    const tasksWithEmails = await Promise.all(
      project.task.map(async (taskId) => {
        console.log(taskId)
        const task = await this.taskService.findOne(taskId.toString());
        console.log("task", task)
        const usersEmails = await Promise.all(
          task.assignedTo.map(async (userId) => {
            const user = await this.userService.findUserById(userId.toString());
            console.log(user)
            if (user instanceof NotFoundException) {
              console.log(`User with ID ${userId} not found`)
              throw new NotFoundException(`User with ID ${userId} not found`);
            }
            return user;
          })
        );
        
        return { ...task, assignedTo: usersEmails };
      })
    );
    console.log("tasksWithEmails", tasksWithEmails)

    console.log({ 
      ...project.toJSON(), 
      teamMembers, 
      tasks: tasksWithEmails 
    })
    return { 
      ...project.toJSON(), 
      teamMembers, 
      tasks: tasksWithEmails 
    };
  }
  
  
  

  async updateName(projectId: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.projectModel.findById(projectId)
    if (!project){
      throw  new NotFoundException("Project does not exist")
    }
    Object.assign(project, updateProjectDto)
    project.updatedAt = new Date();
    await project.save()
    return project.toJSON()
  }

  async remove(projectId:string) {
    const project = await this.projectModel.findByIdAndDelete({id:projectId})
    return 'project deleted successfully'
  }

  async removeuser(projectId:string, userId:string){
    const userInProject = await this.projectModel.findOne({_id:projectId})
    if(!userInProject){
      throw new NotFoundException('Project not found')
    }
    console.log(userId)
    
    const isMember =userInProject.teamMembers.find((user)=>(user).toString() == userId)
    console.log(isMember)
    if (!isMember){
      throw new NotFoundException('User not found')

    }    
    userInProject.teamMembers = userInProject.teamMembers.filter(user =>(user).toString() !== userId)
    userInProject.updatedAt = new Date()
    await userInProject.save()
    return { message: 'User removed successfully' };

  }
  async changePriority(projectId: string, priority: Priority) {
    if (!Object.values(Priority).includes(priority)) {
      throw new BadRequestException('Invalid priority value');
    }
  
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
  
    project.priority = priority;
    project.updatedAt = new Date()
    await project.save();
  
    return { message: `Project priority updated to ${Priority[priority]}` };
  }


  async getProjectAUserIsIn( userId:string){
    const userProjects = await this.projectModel.find({teamMembers:{$in :[new mongoose.Types.ObjectId(userId)]}})
    const ownedProjects = await this.projectModel.find({creator:userId})
    return {ownedProjects, 
      userProjects}

  }
}
