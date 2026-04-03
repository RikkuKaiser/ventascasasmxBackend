import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateInmuebleDto } from './dto/create-inmueble.dto';
import { InmueblesService } from './inmuebles.service';

@Controller('inmuebles')
export class InmueblesController {
  constructor(private readonly inmuebles: InmueblesService) {}

  @Get()
  findAll() {
    return this.inmuebles.findAll();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreateInmuebleDto) {
    return this.inmuebles.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inmuebles.findOne(id);
  }
}
