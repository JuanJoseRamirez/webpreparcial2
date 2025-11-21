import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './country.entity';
import { RestCountriesProvider } from './providers/rest-countries.provider';
import { TravelPlan } from '../travel-plans/travel-plan.entity';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private repository: Repository<Country>,

    @InjectRepository(TravelPlan)
    private travelPlanRepository: Repository<TravelPlan>,

    private externalProvider: RestCountriesProvider,
  ) {}

  findAll() {
    return this.repository.find();
  }

  async findByCode(code: string) {
    const codeUpper = code.toUpperCase();

    // 1. consultar en DB
    let country = await this.repository.findOne({ where: { code: codeUpper } });

    if (country) {
      return { source: 'cache', country };
    }

    // 2. consultar API externa
    const data = await this.externalProvider.getCountryByCode(codeUpper);

    // 3. guardar
    const newCountry = this.repository.create(data);
    await this.repository.save(newCountry);

    return { source: 'api', country: newCountry };
  }

  async deleteByCode(code: string) {
    const codeUpper = code.toUpperCase();

    const country = await this.repository.findOne({ where: { code: codeUpper } });
    if (!country) {
      throw new NotFoundException(`Country ${codeUpper} not found`);
    }

    // Verificar si existen planes asociados
    const plansCount = await this.travelPlanRepository.count({
    where: { countryCode: codeUpper },
    });
    if (plansCount > 0) {
      throw new BadRequestException(`Cannot delete country ${codeUpper}: ${plansCount} travel plan(s) associated`);
    }

    await this.repository.remove(country);
    return;
  }
}

