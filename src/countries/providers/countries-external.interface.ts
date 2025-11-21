export interface CountriesExternalService {
  getCountryByCode(code: string): Promise<any>;
}
