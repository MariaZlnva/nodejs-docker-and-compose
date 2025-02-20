import { IsBoolean, IsDate, IsInt, IsNotEmpty } from 'class-validator';
import { UserProfileResponseDto } from 'src/users/dto/user-profile-response.dto';
import { WishResponseDto } from 'src/wishes/dto/wish-response.dto';

export class OfferResponseDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;

  item: WishResponseDto;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  @IsBoolean()
  hidden: boolean;

  user: UserProfileResponseDto;
}
