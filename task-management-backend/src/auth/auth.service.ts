import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from 'src/user/user.service';
import {compare} from '../utils/bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ProjectService } from 'src/project/project.service';
import mongoose, { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly projectService:ProjectService,
    private readonly jwtService:JwtService,
    private readonly userService:UserService
  ){}
  async login(createAuthDto: CreateAuthDto) {
   

    const user = await this.userService.findByEmail(createAuthDto.email)
    if (user == null){
      return new  NotFoundException('User not found')
    }
    console.log(user.password)
   
    const isPasswordValid = await compare(createAuthDto.password, user.password);
    console.log(isPasswordValid)
  if (!isPasswordValid) {
    throw new NotFoundException('Password is incorrect'); 
  }
 
    if (createAuthDto.inviteToken && createAuthDto.inviteToken !== null){
      const {email, projectId, isSigned} = await this.jwtService.verifyAsync(createAuthDto.inviteToken)
      if (email != user.email){
        return new NotFoundException('Email does not match')
      }
      console.log("there is token")
      console.log(user._id)
      console.log(new Types.ObjectId((user._id).toString()))
      await this.projectService.addUser(new Types.ObjectId((user._id).toString()), projectId)
      
      
    }
    const token = await this.jwtService.signAsync({sub:user._id.toString(), role:user.role})
    return {
      ...user, 
      token
    }
    
  }

  async validateToken(token:string){
    const payload = this.jwtService.verify(token)
    return payload


  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
