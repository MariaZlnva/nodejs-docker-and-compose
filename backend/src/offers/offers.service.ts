import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { UsersService } from 'src/users/users.service';
import { OfferResponseDto } from './dto/offer-response.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private offerRepository: Repository<Offer>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Wish) private wishesRepository: Repository<Wish>,
    private usersService: UsersService,
  ) {}

  private mapOfferToResponseDto(offer: Offer): OfferResponseDto {
    const user = this.usersService.removeSensitiveData(offer.user, [
      'password',
    ]);
    return {
      ...offer,
      user: user,
    };
  }

  async createOffer(userId: number, createOfferDto: CreateOfferDto) {
    const { itemId, amount } = createOfferDto;
    const wish = await this.wishesRepository.findOne({
      where: { id: itemId },
      relations: { owner: true },
    });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (wish.owner.id === userId) {
      throw new BadRequestException('На свой подарок скидываться нельзя');
    }
    if (wish.price === wish.raised) {
      throw new BadRequestException('Средства для покупки набраны :)');
    }

    if (Number(wish.raised) + amount > Number(wish.price)) {
      throw new BadRequestException('Сумма превышает стоимость подарка');
    }
    await this.wishesRepository.update(wish.id, {
      raised: Number(wish.raised) + amount,
    });

    const user = await this.usersRepository.findOne({
      relations: { wishes: true },
      where: { id: userId },
    });

    await this.offerRepository.save({
      ...createOfferDto,
      user: user,
      item: wish,
    });
    return {};
  }

  async findAll() {
    const offers = await this.offerRepository.find({
      relations: [
        'user',
        'item',
        'user.wishes',
        'user.offers',
        'user.wishlists',
      ],
    });
    if (!offers) {
      throw new NotFoundException('Offers не найдены');
    }
    const offersSanitized = offers.map((offer) =>
      this.mapOfferToResponseDto(offer),
    );
    return offersSanitized;
  }

  async findOne(offerId: number): Promise<OfferResponseDto> {
    const offer = await this.offerRepository.findOne({
      relations: [
        'user',
        'item',
        'user.wishes',
        'user.offers',
        'user.wishlists',
      ],
      where: {
        id: offerId,
      },
    });
    if (!offer) {
      throw new NotFoundException('Offer не найден');
    }
    const offerSanitized = this.mapOfferToResponseDto(offer);
    return offerSanitized;
  }
}
