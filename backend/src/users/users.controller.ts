import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { JwtGuard } from 'src/auth/guadrs/jwt.guard';
import { Wish } from 'src/wishes/entities/wish.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersDto } from './dto/find-user.dto';
import { UserPublicProfileResponseDto } from './dto/user-public-profile-response.dto';
import { UserWishesDto } from './dto/user-wishes.dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('find')
  findMany(
    @Body() findUserDto: FindUsersDto,
  ): Promise<UserProfileResponseDto[]> {
    return this.usersService.findMany(findUserDto.query);
  }

  @Get('me')
  async getMe(@Req() req): Promise<UserProfileResponseDto> {
    const userId = req.user.id;
    const user = await this.usersService.findOne({ id: userId });
    return this.usersService.removeSensitiveData(user, ['password']);
  }

  @Patch('me')
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ): Promise<UserPublicProfileResponseDto> {
    if (Object.keys(updateUserDto).length === 0) {
      throw new BadRequestException('Нет данных для обновления');
    }
    const user = req.user;
    return await this.usersService.updateUser(user, updateUserDto);
  }

  @Get('me/wishes')
  getMeWishes(@Req() req): Promise<Wish[]> {
    const userId = req.user.id;
    return this.usersService.findMyWishes(userId);
  }

  @Get(':username')
  async findByUsername(
    @Param('username') username: string,
  ): Promise<UserPublicProfileResponseDto> {
    const user = await this.usersService.findOne({ username });
    return this.usersService.removeSensitiveData(user);
  }

  @Get(':username/wishes')
  async findWishesByUsername(
    @Param('username') username: string,
  ): Promise<UserWishesDto[]> {
    const { id } = await this.usersService.findOne({ username });
    return await this.usersService.findWishes(id);
  }
}
