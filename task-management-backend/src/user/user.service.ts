import { ConflictException, forwardRef, HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import{encrypt, compare} from '../utils/bcrypt';
import { ProjectService } from 'src/project/project.service';
import { JwtService } from '@nestjs/jwt';
export interface userReturn {
  email:string;
  username:string;
  role:string;
  createdAt:Date;
  updatedAt:Date;
}
@Injectable()
export class UserService {
  secret = process.env.JWT_SECRET
  constructor(
    @Inject(forwardRef(()=>ProjectService)) 
    private readonly projectService:ProjectService,
    private readonly jwtService:JwtService,
    @InjectModel(User.name) private readonly userModel:Model<User>)
    {}
   
  async create(createUserDto: CreateUserDto, token?:string):Promise<userReturn|HttpException>{
    const user = await this.userModel.findOne({email:createUserDto.email})

    if (user){
      return new ConflictException('Email already exists')
    }
    const hashedPassword =await encrypt(createUserDto.password)
    const newUser = await this.userModel.create({...createUserDto, password:hashedPassword})
    console.log(createUserDto.inviteToken)
     if (createUserDto.inviteToken && createUserDto.inviteToken.toString() !== null){
      
          const {email, projectId, isSigned} = await this.jwtService.verifyAsync(createUserDto.inviteToken)

          if (email != createUserDto.email){
            return new NotFoundException('Email does not match')
          }
          console.log("userPassed" , new Types.ObjectId((newUser._id).toString()))
          await this.projectService.addUser(new Types.ObjectId((newUser._id).toString()), projectId)
          
          
        }
    console.log("newUser", newUser._id)
   const {password, ...rest} = newUser.toJSON()
   return rest
  }
  async findUserById(userId:string){
    const user = await this.userModel.findOne({_id:userId})
    return user
  }


  async findByEmail(email:string) :Promise<User|null>{
    const user = await this.userModel.findOne({email:email}).lean()
    return user
  }

  async findOne(id:string) :Promise<userReturn|NotFoundException> {
    const user = await this.userModel.findById(id)
    
    if (!user){
      return new NotFoundException('User not found')
    }
    const{password, ...rest} = user.toJSON()
    return rest
  }

  async update(id: string, updateUserDto: UpdateUserDto):Promise<User|NotFoundException> {
    const user = await this.userModel.findById(id)
    if (!user){
      return new NotFoundException('User not found')
    }
    Object.assign(user, updateUserDto)
    await user.save()
    return user
    
  }

  async remove(id: number) :Promise<String|HttpException>{
   const user = await this.userModel.findOne({id:id})
   if (user){
    return 'User not found'
   }
   return new NotFoundException('User not found')
  }
}
