import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private wishesRepository: Repository<Wish>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  private removeSensitiveData(wishes: Wish[]) {
    return wishes.map((wish) => {
      if (wish.owner) {
        delete wish.owner.password;
        delete wish.owner.email;
      }
      return wish;
    });
  }
  private removeSensitiveDataUser(user: User) {
    delete user.password;
    delete user.email;
    return user;
  }

  async create(user: User, createWishDto: CreateWishDto) {
    const { password, ...restUser } = user;
    const createdWish = await this.wishesRepository.save({
      ...createWishDto,
      owner: restUser,
    });
    return createdWish;
  }

  async findOne(wishId: number): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: { id: wishId },
      relations: {
        owner: true,
        offers: {
          user: true,
        },
      },
    });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (wish.owner) {
      this.removeSensitiveDataUser(wish.owner);
    }
    if (wish.offers) {
      wish.offers.forEach((offer) => {
        if (offer.user) {
          this.removeSensitiveDataUser(offer.user);
        }
      });
    }
    return wish;
  }

  async updateOne(
    wishId: number,
    updateWishDto: UpdateWishDto,
    userId: number,
  ) {
    const wishToBeUpdated = await this.findOne(wishId);
    if (wishToBeUpdated.owner.id !== userId) {
      throw new BadRequestException('Чужой подарок нельзя редактировать');
    }
    if (wishToBeUpdated.raised > 0) {
      throw new BadRequestException(
        'Данные подарка нельзя редактировать, поскольку на него уже скидываются',
      );
    }
    await this.wishesRepository.update({ id: wishId }, updateWishDto);
    const updatedWish = await this.findOne(wishId);
    return updatedWish;
  }

  async removeOne(wishId: number, user: User) {
    const wishToBeRemoved = await this.findOne(wishId);
    if (wishToBeRemoved.owner.id !== user.id) {
      throw new BadRequestException('Чужой подарок удалить нельзя');
    }
    if (wishToBeRemoved.offers && wishToBeRemoved.offers.length > 0) {
      throw new BadRequestException('На подарок уже скинулись, удалить нельзя');
    }
    await this.wishesRepository.remove(wishToBeRemoved);
    this.removeSensitiveDataUser(wishToBeRemoved.owner);
    return wishToBeRemoved;
  }

  async copiesWish(userId: number, wishId: number) {
    const wishToBeCopied = await this.findOne(wishId);
    if (!wishToBeCopied) {
      throw new NotFoundException('Подарок не найден');
    }
    if (wishToBeCopied.owner.id === userId) {
      throw new BadRequestException('Свой подарок нельзя скопировать к себе');
    }
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { wishes: true },
    });
    const isUserHasWish = user.wishes.some((wish) =>
      wish.name.includes(wishToBeCopied.name),
    );
    if (isUserHasWish) {
      throw new ConflictException('Этот подарок уже есть у Вас');
    }
    const { name, link, image, price, description } = wishToBeCopied;

    this.create(user, {
      name,
      link,
      image,
      price,
      description,
    });
    await this.wishesRepository.increment({ id: wishId }, 'copied', 1);
    return {};
  }

  async getLast(): Promise<Wish[]> {
    console.log('synchronise=>', process.env.NODE_ENV === 'production' ? false : true)
    console.log('NODE_ENV=>', process.env.NODE_ENV)
    const wishes = await this.wishesRepository.find({
      order: { createdAt: 'DESC' },
      skip: 0,
      take: 40,
      relations: ['owner'],
    });

    return this.removeSensitiveData(wishes);
  }

  async getTop(): Promise<Wish[]> {
    const wishes = await this.wishesRepository.find({
      order: { copied: 'DESC' },
      skip: 0,
      take: 20,
      relations: ['owner'],
    });

    return this.removeSensitiveData(wishes);
  }
}
