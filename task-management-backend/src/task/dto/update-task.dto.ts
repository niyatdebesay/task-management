import { IsArray, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ObjectId } from "mongoose";
import { Status } from "src/project/enum/status.enum";
import { User } from "src/user/schemas/user.schema";
export class UpdateTaskDto {
    
    @IsOptional()
    @IsString()
    title?: string; 

    @IsOptional()
    @IsString()
    description?: string; 

   
    @IsArray()
    @IsString({ each: true })
    assignedTo: any[]; 

    @IsOptional()
    @IsEnum(Status)
    status?: Status;

    @IsOptional()
    @IsDate()
    deadline?: Date; 

    @IsString()
    project?:string
}

