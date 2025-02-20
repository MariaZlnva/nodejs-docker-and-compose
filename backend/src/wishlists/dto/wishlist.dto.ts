import { IsInt, IsDate, IsString, IsUrl } from 'class-validator';
import { UserPublicProfileResponseDto } from 'src/users/dto/user-public-profile-response.dto';

export class WishlistDto {
  @IsInt()
  id: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  name: string;
  
  @IsUrl()
  image: string;
  owner: UserPublicProfileResponseDto;
}
