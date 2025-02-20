import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { SignupUserResponseDto } from './dto/signup-user-response.dto';
import { LocalGuard } from './guadrs/local.guard';
import { SigninUserResponseDto } from './dto/signin-user-response.dto';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalGuard)
  @Post('signin')
  async signin(@Req() req): Promise<SigninUserResponseDto> {
    return this.authService.auth(req.user);
  }

  @Post('signup')
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<SignupUserResponseDto> {
    return await this.usersService.create(createUserDto);
  }
}
