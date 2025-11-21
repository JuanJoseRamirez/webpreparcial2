import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

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

  @UseGuards(ApiKeyGuard)
  @Delete(':code')
  async remove(@Param('code') code: string) {
    await this.service.deleteByCode(code);
    return { message: `Country ${code.toUpperCase()} deleted` };
  }
}
