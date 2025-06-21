import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ProjectService } from 'src/project/project.service';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService) {}

  @Post("/login")
  async login(@Body() createAuthDto: CreateAuthDto)
    {
   
    
    console.log("Request Body:", createAuthDto);
    return this.authService.login(createAuthDto, );
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
