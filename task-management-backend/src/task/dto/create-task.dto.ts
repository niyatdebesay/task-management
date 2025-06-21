import { IsArray, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ObjectId } from "mongoose";
import { Status } from "src/project/enum/status.enum";

export class CreateTaskDto {

   

    @IsNotEmpty()
    
    title:string


    @IsOptional()
    @IsString()
    description:string

    @IsArray()
    @IsOptional()
    @IsString({each:true})
    assignedTo:string[];

    @IsOptional()
    @IsEnum(Status)
    status:Status

    @IsOptional()
    @IsDate()
    deadline:Date



    @IsString()
    @IsNotEmpty()
    createdBy:string

    @IsNotEmpty()
    project:string

}


