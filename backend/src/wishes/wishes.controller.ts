import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { WishesService } from './wishes.service';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtGuard } from 'src/auth/guadrs/jwt.guard';
import { Wish } from './entities/wish.entity';

@Controller('wishes')
export class WishesController {
  constructor(private wishesService: WishesService) {}

  @Get('last')
  getLast(): Promise<Wish[]> {
    return this.wishesService.getLast();
  }

  @Get('top')
  getTop(): Promise<Wish[]> {
    return this.wishesService.getTop();
  }

  @UseGuards(JwtGuard)
  @Post()
  create(@Req() req, @Body() createWishDto: CreateWishDto) {
    const user = req.user;
    return this.wishesService.create(user, createWishDto);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) wishId: number) {
    return this.wishesService.findOne(wishId);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) wishId: number,
    @Body() updateWishDto: UpdateWishDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.wishesService.updateOne(wishId, updateWishDto, userId);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) wishId: number, @Req() req) {
    const user = req.user;
    return this.wishesService.removeOne(wishId, user);
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  copy(@Req() req, @Param('id', ParseIntPipe) wishId: number) {
    const userId = req.user.id;
    return this.wishesService.copiesWish(userId, wishId);
  }
}
