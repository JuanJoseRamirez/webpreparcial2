import { Controller, Get, Param } from '@nestjs/common';
import { CountriesService } from './countries.service';

@Controller('countries')
export class CountriesController {
  constructor(private readonly service: CountriesService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Get(':code')
  async getOne(@Param('code') code: string) {
    return this.service.findByCode(code);
  }
}
