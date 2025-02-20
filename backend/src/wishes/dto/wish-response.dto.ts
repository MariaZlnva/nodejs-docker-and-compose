import { IsDate, IsInt, IsString, IsUrl } from 'class-validator';
import { Offer } from 'src/offers/entities/offer.entity';
import { UserPublicProfileResponseDto } from 'src/users/dto/user-public-profile-response.dto';

export class WishResponseDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsUrl()
  link: string;

  @IsUrl()
  image: string;

  @IsInt()
  price: number;

  @IsInt()
  raised: number;

  @IsInt()
  copied: number;

  @IsString()
  description: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
  owner: UserPublicProfileResponseDto;
  offers: Offer[];
}
