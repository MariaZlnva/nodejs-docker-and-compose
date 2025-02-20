import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { WishlistDto } from './dto/wishlist.dto';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { Wishlist } from './entities/wishlist.entity';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    @InjectRepository(Wish) private wishesRepository: Repository<Wish>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<WishlistDto[]> {
    const wishlistList = await this.wishlistsRepository.find({
      relations: {
        owner: true,
        items: true,
      },
    });
    if (!wishlistList) {
      throw new NotFoundException('Список не найден');
    }

    wishlistList.forEach((wishlist) => {
      delete wishlist.owner.password;
      delete wishlist.owner.email;
    });
    return wishlistList;
  }

  async create(createWishlistDto: CreateWishlistDto, userId: number) {
    const { name, image, itemsId } = createWishlistDto;
    const owner = await this.userRepository.findOneBy({ id: userId });
    if (!owner) {
      throw new NotFoundException(`Пользователь не найден`);
    }
    delete owner.password;
    delete owner.email;
    const items = await this.wishesRepository.find({
      where: { id: In(itemsId) },
    });
    if (!items) {
      throw new NotFoundException(`Не найдены подарки`);
    }

    const newWishlist = await this.wishlistsRepository.save({
      name,
      image,
      owner,
      items,
    });
    return newWishlist;
  }

  async findOne(id: number) {
    const wishlist = await this.wishlistsRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
    if (!wishlist) {
      throw new NotFoundException('Список не найден');
    }
    delete wishlist.owner.password;
    delete wishlist.owner.email;
    return wishlist;
  }

  async update(
    userId: number,
    listId: number,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishlist = await this.findOne(listId);
    if (!wishlist) {
      throw new NotFoundException('Список не найден');
    }
    if (userId !== wishlist.owner.id) {
      throw new ForbiddenException('Нельзя редактировать чужой список');
    }
    const updatedList = await this.wishlistsRepository.save({
      ...wishlist,
      ...updateWishlistDto,
    });
    delete updatedList.owner.password;
    delete updatedList.owner.email;
    return updatedList;
  }

  async removeOne(userId: number, listId: number) {
    const wishlist = await this.findOne(listId);
    if (!wishlist) {
      throw new NotFoundException('Список не найден');
    }

    if (userId !== wishlist.owner.id) {
      throw new ForbiddenException('Нельзя удалить чужой список');
    }

    wishlist.items = [];
    await this.wishlistsRepository.save(wishlist);

    const deletedList = await this.wishlistsRepository.remove(wishlist);

    if (deletedList.owner) {
      delete deletedList.owner.password;
      delete deletedList.owner.email;
    }

    return deletedList;
  }
}
