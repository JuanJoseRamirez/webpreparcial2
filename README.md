# README — Travel API (NestJS)

## Descripción general

Este proyecto implementa una API REST en NestJS que permite:

* Gestionar países (Countries), con almacenamiento local tipo caché.
* Consultar países desde la API externa RestCountries cuando no existan en la base de datos.
* Crear y consultar planes de viaje (TravelPlans) asociados a países.
* Usar DTOs y validación para asegurar la integridad de los datos.

## Cómo ejecutar el proyecto

### 1. Instalación de dependencias

Ejecutar:

```bash
npm install
```

### 2. Configuración de la base de datos

El proyecto utiliza SQLite.
La base de datos se crea automáticamente como `database.sqlite`.

La configuración se encuentra en `app.module.ts`:

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

La API quedará disponible en:

```
http://localhost:3000
```

---

## Módulos del proyecto

### CountriesModule

* Consulta países en la base de datos.
* Si un país no existe, lo obtiene de la API RestCountries y lo guarda.
* Funciona como sistema de caché local.

### TravelPlansModule

* Crea planes de viaje asociados a un país existente.
* Si el país no está en la base local, lo obtiene automáticamente desde CountriesModule.
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

La API externa se consulta mediante un provider especializado que:

* Recibe un código alpha-3.
* Consume `https://restcountries.com/v3.1/alpha/{code}`.
* Extrae únicamente los campos necesarios.
* Devuelve los datos formateados para insertar en la base.
* Evita que CountriesService dependa directamente de HTTP o URLs externas.

---

## Endpoints

### Countries

**Listar países**

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

Ejemplo de body:

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

1. Consultar un país no existente:

   ```
   GET /countries/JPN
   ```

   Debe obtenerse desde la API externa.

2. Consultar el mismo país nuevamente:

   ```
   GET /countries/JPN
   ```

   Debe obtenerse desde la base local (caché).

3. Crear un plan de viaje:

   ```
   POST /travel-plans
   ```

   Si el país no existe, debe crearse automáticamente.

4. Listar planes:

   ```
   GET /travel-plans
   ```

5. Consultar un plan por ID:

   ```
   GET /travel-plans/1
   ```

## Extensión realizada en el parcial

ESe extendió la API original agregando la capacidad de eliminar países desde la caché local mediante un nuevo endpoint protegido con Guard, controlando además que ningún país pueda ser borrado si tiene planes de viaje asociados. Para lograrlo se incorporó un Guard que valida un token enviado por header antes de permitir la operación. También se integró un middleware de logging que registra la actividad de cada petición realizada a las rutas de Countries y TravelPlans, este middleware muestra en consola el método utilizado, la ruta, el código de estado y el tiempo de procesamiento.

---

## Endpoint protegido y Guard de autorización

El endpoint protegido es:

```

DELETE /countries/:alpha3Code

```

Este endpoint solo puede ejecutarse si la petición incluye el header:

```

x-api-key: <token>

```

El Guard (`ApiKeyGuard`) intercepta la petición antes de llegar al controlador, lee el header `x-api-key` y lo compara con la clave definida en la variable de entorno `ADMIN_TOKEN` (o `secret-token` por defecto).  
Si el token no coincide o está ausente, la petición es rechazada con un **401 Unauthorized**.  
Además, dentro del servicio se valida que el país exista y que no posea planes de viaje asociados, evitando eliminaciones inconsistentes.

---

## Middleware de logging

Se implementó un middleware personalizado aplicado al módulo de Countries y TravelPlans.  
Este middleware registra por consola la siguiente información para cada petición:

- Método HTTP utilizado (GET, POST, DELETE, etc.).
- Ruta solicitada.
- Código de estado de la respuesta.
- Tiempo total de procesamiento.

```
