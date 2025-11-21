import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TravelPlan } from './travel-plan.entity';
import { CreateTravelPlanDto } from './dto/create-travel-plan.dto';
import { CountriesService } from '../countries/countries.service';

@Injectable()
export class TravelPlansService {
  constructor(
    @InjectRepository(TravelPlan)
    private repository: Repository<TravelPlan>,
    private countriesService: CountriesService,
  ) {}

  async create(dto: CreateTravelPlanDto) {
    // verificar país
    await this.countriesService.findByCode(dto.countryCode);

    const plan = this.repository.create(dto);
    return this.repository.save(plan);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  async countByCountryCode(code: string): Promise<number> {
    return this.repository.count({ where: { countryCode: code } });
  }
}
