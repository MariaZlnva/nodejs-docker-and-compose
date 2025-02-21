import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Wish } from 'src/wishes/entities/wish.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { ConfigService } from '@nestjs/config';
import { hashValue } from 'src/helpers/hash';
import { UserWishesDto } from './dto/user-wishes.dto';

@Injectable()
export class UsersService {
  saltRounds: number;
  public removeSensitiveData(
    user: User,
    fieldsToRemove: string[] = ['password', 'email'],
  ): User {
    const sanitizedUser = { ...user };
    fieldsToRemove.forEach((field) => {
      if (sanitizedUser[field]) {
        delete sanitizedUser[field];
      }
    });
    return sanitizedUser;
  }

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.saltRounds = this.configService.get<number>('saltRounds');
  }

  async findOne(query: Partial<User>): Promise<User> {
    const user = await this.usersRepository.findOne({ where: query });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;
    const exists = await this.usersRepository.exists({
      where: [{ username }, { email }],
    });
    if (exists) {
      throw new ConflictException(
        'Пользователь с таким email или username уже зарегистрирован',
      );
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      password: await hashValue(password),
    });
    const newUser = await this.usersRepository.save(user);
    return this.removeSensitiveData(newUser, ['password']);
  }

  async updateUser(
    user: User,
    updateUserDto: UpdateUserDto,
  ): Promise<UserProfileResponseDto> {
    const { username, password, email } = updateUserDto;

    if (username) {
      const userWithUsername = await this.usersRepository.findOne({
        where: [{ username }],
      });
      if (userWithUsername) {
        throw new ConflictException(
          'Пользователь с таким username уже существует',
        );
      }
    }
    if (email) {
      const userWithEmail = await this.usersRepository.findOne({
        where: [{ email }],
      });
      if (userWithEmail && userWithEmail.id !== user.id) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
    }
    if (password) {
      updateUserDto.password = await hashValue(password);
    }
    const userUpdate = await this.findOne({ id: user.id });
    const updatedUser = await this.usersRepository.save({
      ...userUpdate,
      ...updateUserDto,
    });
    return this.removeSensitiveData(updatedUser, ['password']);
  }

  async findMyWishes(userId: number): Promise<Wish[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: [
        'wishes',
        'wishes.owner',
        'wishes.offers',
        'wishes.offers.item',
        'wishes.offers.user',
      ],
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (user.wishes) {
      user.wishes.forEach((wish) => {
        delete wish.owner.email;
        delete wish.owner.password;
        wish.offers.forEach((offer) => {
          delete offer.user.email;
          delete offer.user.password;
        });
      });
    }

    return user.wishes;
  }

  async findMany(query: string): Promise<UserProfileResponseDto[]> {
    const users = await this.usersRepository.find({
      where: [{ username: query }, { email: query }],
    });
    const usersWithoutPassword = users.map((user) => {
      return this.removeSensitiveData(user, ['password']);
    });
    return usersWithoutPassword;
  }

  async findWishes(userId: number): Promise<UserWishesDto[]> {
    const user = await this.usersRepository.findOne({
      relations: [
        'wishes',
        'wishes.offers',
        'wishes.offers.user',
        'wishes.offers.user.wishes',
        'wishes.offers.user.offers',
        'wishes.offers.user.wishlists',
        'wishes.offers.item',
      ],
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (user?.wishes) {
      user.wishes.forEach((wish) => {
        wish.offers.forEach((offer) => {
          delete offer.user.password;
        });
      });
    }
    return user.wishes;
  }
}
