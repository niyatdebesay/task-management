import { IsDate, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator"

export class CreateProjectDto {
    @IsNotEmpty()
    @MinLength(3)
    name:string

    @IsOptional()
    @IsString()
    description:string

    @IsString()
    @IsNotEmpty()
    owner:string

    @IsOptional()
    @IsDate()
    deadline:string


}
