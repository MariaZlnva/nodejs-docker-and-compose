import { WishlistDto } from 'src/wishlists/dto/wishlist.dto';
import { WishResponseDto } from 'src/wishes/dto/wish-response.dto';
import { Exclude } from 'class-transformer';
import { Offer } from 'src/offers/entities/offer.entity';
import { IsDate, IsInt, IsString, IsUrl } from 'class-validator';

export class UserDto {
  @IsInt()
  id: number;

  @IsString()
  username: string;

  @IsString()
  about: string;

  @IsUrl()
  avatar: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  wishes: WishResponseDto[];
  offers: Offer[];
  wishlists: WishlistDto[];
  
  @Exclude()
  password: string;

  @Exclude()
  email: string;
}
