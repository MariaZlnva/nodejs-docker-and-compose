import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { JwtGuard } from 'src/auth/guadrs/jwt.guard';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferResponseDto } from './dto/offer-response.dto';

@UseGuards(JwtGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  createOffer(@Req() req, @Body() createOfferDto: CreateOfferDto) {
    const userId = req.user.id;
    return this.offersService.createOffer(userId, createOfferDto);
  }

  @Get()
  getOffers() {
    return this.offersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') offerId: number): Promise<OfferResponseDto> {
    return await this.offersService.findOne(offerId);
  }
}
