import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Country } from './country.entity';
import { RestCountriesProvider } from './providers/rest-countries.provider';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private repository: Repository<Country>,
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
}

