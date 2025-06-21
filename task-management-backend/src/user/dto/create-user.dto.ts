import { Optional } from '@nestjs/common';
import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username:string;

    @IsNotEmpty()
    @IsEmail()
    email:string;

    @IsNotEmpty()
    @MinLength(8)
    password:string;

    @Optional()
    @IsString()
    inviteToken:string

}
