import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { JwtGuard } from 'src/auth/guadrs/jwt.guard';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@UseGuards(JwtGuard)
@Controller('wishlistlists')
export class WishlistsController {
  constructor(private wishlistsService: WishlistsService) {}

  @Get()
  getAll() {
    return this.wishlistsService.findAll();
  }

  @Post()
  create(@Body() createWishlistDto: CreateWishlistDto, @Req() req) {
    const userId = req.user.id;
    return this.wishlistsService.create(createWishlistDto, userId);
  }

  @Get(':id')
  getOne(@Param('id') listId: number) {
    return this.wishlistsService.findOne(listId);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') listId: number,
    @Body() updateWishList: UpdateWishlistDto,
  ) {
    const userId = req.user.id;
    return this.wishlistsService.update(userId, listId, updateWishList);
  }

  @Delete(':id')
  removeOne(@Param('id') listId: number, @Req() req) {
    const userId = req.user.id;
    return this.wishlistsService.removeOne(userId, listId);
  }
}
