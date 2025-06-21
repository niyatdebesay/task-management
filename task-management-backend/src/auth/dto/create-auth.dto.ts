import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateAuthDto {

    @IsNotEmpty()
    @IsEmail()
    email:string

    @IsNotEmpty()
    @MinLength(8)
    password:string

    @IsOptional()
    @IsString()
    inviteToken:string
}
