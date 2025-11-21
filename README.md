
---

````
# Travel API (NestJS)

## Descripción general
Este proyecto implementa una API REST en NestJS que permite:

- Gestionar países (Countries) con almacenamiento local tipo caché.
- Consultar países desde la API externa RestCountries cuando no existan en la base de datos.
- Crear y consultar planes de viaje (TravelPlans) asociados a países.
- Utilizar DTOs y validación para asegurar la integridad de los datos.

---

## Cómo ejecutar el proyecto

### 1. Instalación de dependencias
Ejecutar:

```bash
npm install
````

### 2. Configuración de la base de datos

El proyecto utiliza SQLite. La base de datos se crea automáticamente como `database.sqlite`.

La configuración se encuentra en `src/app.module.ts`:

```ts
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
});
```

No requiere pasos adicionales.

### 3. Ejecutar la API

```bash
npm run start:dev
```

La API estará disponible en:

```
http://localhost:3000
```

---

## Módulos del proyecto

### CountriesModule

* Consulta países en la base de datos local.
* Si un país no existe, lo obtiene desde la API RestCountries y lo almacena.
* Actúa como sistema de caché.

### TravelPlansModule

* Permite crear planes de viaje.
* Verifica que el país exista; si no existe, lo obtiene automáticamente mediante CountriesModule.
* Permite listar y consultar planes por ID.

---

## Modelo de datos

### Country

* code (string)
* name (string)
* region (string)
* subregion (string)
* capital (string)
* population (number)
* flagUrl (string)
* createdAt (date)
* updatedAt (date)

### TravelPlan

* id (number)
* countryCode (string)
* title (string)
* startDate (string)
* endDate (string)
* notes (string, opcional)
* createdAt (date)

---

## Provider externo (RestCountries)

El proyecto incluye un provider encargado de consultar:

```
https://restcountries.com/v3.1/alpha/{code}
```

Este provider:

* Recibe un código alpha-3.
* Obtiene los datos del país desde RestCountries.
* Extrae únicamente los campos necesarios.
* Devuelve los datos listos para guardar en la base.
* Permite que CountriesService no dependa directamente de la API externa.

---

## Endpoints

### Countries

**Listar todos los países**

```
GET /countries
```

**Consultar país por código alpha-3**

```
GET /countries/:code
```

Ejemplo:

```
GET /countries/COL
```

---

### Travel Plans

**Crear un plan de viaje**

```
POST /travel-plans
```

Body ejemplo:

```json
{
  "countryCode": "COL",
  "title": "Vacaciones Bogotá",
  "startDate": "2025-07-10",
  "endDate": "2025-07-20",
  "notes": "Llevar chaqueta"
}
```

**Listar planes**

```
GET /travel-plans
```

**Consultar plan por ID**

```
GET /travel-plans/:id
```

---

## Pruebas básicas sugeridas

1. Consultar un país no cacheado:

   ```
   GET /countries/JPN
   ```

   Debe obtenerse desde la API externa.

2. Consultar el mismo país nuevamente:

   ```
   GET /countries/JPN
   ```

   Debe obtenerse desde la base local.

3. Crear un plan de viaje:

   ```
   POST /travel-plans
   ```

   Si el país no existe, debe consultarse y guardarse automáticamente.

4. Listar planes:

   ```
   GET /travel-plans
   ```

5. Consultar un plan por ID:

   ```
   GET /travel-plans/1
   ```

---

```

---

```
