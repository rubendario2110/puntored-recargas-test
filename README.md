# puntored-recargas-test
PuntoRed – Backend Recargas (NestJS + TS + DDD)

**Stack**: NestJS 10, TypeScript, TypeORM, SQLite (default) , JWT, class-validator, Jest, Supertest.  
**Arquitectura**: DDD (Domain / Application / Infrastructure) , Ingeniería Segura. Incluye evento `RechargeSucceeded` con bus en memoria.

## Diseño DDD + C4 Model
- **Contexto (C4 Nivel 1)**  
  - `Usuarios Web` interactúan con el futuro frontend que consume la `API de Recargas`.  
  - `Operadores / Servicios Externos` (futuros integradores) recibirán eventos del dominio; hoy se simulan en memoria.  
  - `SQLite / PostgreSQL` almacenan transacciones de recarga.

   ![alt text](context.drawio.png)

- **Contenedores (C4 Nivel 2)**  
  - `Backend NestJS`: servicio REST JWT que implementa autenticación y recargas.  
  - `Base de Datos`: persistencia relacional (SQLite local).  
  - `Event Bus In-Memory`: entrega eventos de dominio (`RechargeSucceededEvent`) a listeners internos.

  ![alt text](container.png)

- **Componentes (C4 Nivel 3)**  
  - `Domain`: entidades (`Recharge`, `Transaction`), VO y eventos con reglas de negocio puras.  
  - `Application`: casos de uso (`BuyRechargeUseCase`, `GetHistoryUseCase`) que orquestan repositorios y event bus.  
  - `Infrastructure`: adaptadores entrantes (controllers, guards) y salientes (TypeORM repo, auth service, logger).  
  - `Common`: configuración (`AppModule`, `env.validation`) y utilidades transversales (logger estructurado, interceptores).
  ![alt text](components.png)

- **Relaciones clave**  
  - Controllers → Casos de uso → Repositorios (puertos) mantienen el dominio desacoplado de la infraestructura.  
  - Casos de uso → EventBus permite evolucionar hacia integraciones asincrónicas.  
  - Logger estructurado se comparte para observabilidad consistente en todas las capas.
- **Diagrama de Secuencia**  
  ![alt text](sequence.png)
## Cómo ejecutar
```bash
npm i -g @nestjs/cli
npm install
cp .env.example .env
npm run start:dev
```

### Probar
```bash
# Login
curl -s -X POST http://localhost:3000/auth/login -H 'Content-Type: application/json'   -d '{"username":"testuser","password":"password123"}'

# Usar el token en:
curl -s -X POST http://localhost:3000/recharges/buy -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json'   -d '{"amount":5000,"phoneNumber":"3101234567"}'

curl -s -X GET http://localhost:3000/recharges/history -H "Authorization: Bearer $TOKEN"
```

## Scripts
- `npm run start:dev` – servidor con watch
- `npm run test` – unit tests
- `npm run test:e2e` – e2e tests

## Logs estructurados (Patrón MCD)
El logger global (`StructuredLogger`) sigue el patrón **Mensaje / Contexto / Detalles (MCD)** y emite eventos JSON.  
Cada petición HTTP se registra mediante un interceptor con un `requestId` (se reutiliza el encabezado `x-request-id` si existe).  
El mismo logger se inyecta en controllers, casos de uso, repositorios y servicios de dominio para registrar hitos del flujo sin perder trazabilidad.

Ejemplo:
```json
{"timestamp":"2025-10-29T13:30:00.000Z","level":"INFO","message":"http_request_completed","context":"HTTP","details":{"requestId":"f3c4e9d8-2b6a-4af7-a1d7-9132d2a1f9e0","method":"POST","url":"/recharges/buy","statusCode":201,"durationMs":32}}
```

## Despliegue en Railway (Postgres)
1. **Crear servicios**: en Railway agrega el repositorio como servicio Node.js y añade un plugin de Postgres gratuito.
2. **Variables de entorno**  
   - `JWT_SECRET`: clave para firmar los JWT.  
   - `DATABASE_URL`: cadena provista por Railway (`postgresql://usuario:password@host:puerto/db`).  
   - `DB_SSL=true`: Railway exige conexiones SSL; el módulo TypeORM usa `rejectUnauthorized: false`.  
   - `PORT`: Railway la inyecta automáticamente, pero puedes fijar `PORT=3000` como respaldo.  
   - Opcionalmente ajusta `DB_SYNCHRONIZE=false` si administras migraciones manuales; para demos puede quedar en `true`.
3. **Build & start**: configura `npm install` como comando de build y `npm run start` como comando de arranque.
4. **Dependencias**: ejecuta `npm install` tras actualizar el repositorio para tomar `pg`, el driver de Postgres.
5. **Migraciones / SQL**: crea la tabla `transactions` ejecutando `docs/sql/transactions.postgres.sql`:
   ```bash
   railway connect
   \i docs/sql/transactions.postgres.sql
   ```
   Alternativa no interactiva:
   ```bash
   railway run psql "$DATABASE_URL" -f docs/sql/transactions.postgres.sql
   ```
6. **Verificación**: usa la colección Postman contra la URL pública que entrega Railway para validar el despliegue.

## Decisiones tecnicas
- `NestJS + DDD`: separacion clara entre dominio, aplicacion e infraestructura para facilitar pruebas y cambios.
- `TypeORM + SQLite`: motor liviano por defecto; la interfaz `ITransactionRepository` permite migrar sin tocar el dominio.
- `StructuredLogger`: logs JSON con el patron Mensaje/Contexto/Detalles que habilita observabilidad consistente.
- `EventBus` en memoria: desacopla los casos de uso de futuras integraciones asincronas.
- `class-validator` + `ValidationPipe`: todos los DTOs se validan antes de llegar al dominio, reduciendo superficie de error.

## Seguridad
- **Autenticacion JWT**: `/auth/login` emite tokens firmados con `JWT_SECRET`; `JwtAuthGuard` protege los endpoints de recargas.
- **Validacion de entorno**: `env.validation.ts` asegura que secretos y configuraciones criticas existan antes de arrancar.
- **Saneamiento de entrada**: `ValidationPipe` usa `whitelist` y `forbidNonWhitelisted` para rechazar payloads inesperados.
- **Proteccion en logs**: utilidades de mascara ocultan identificadores y numeros sensibles antes de registrarlos.
- **Config externa**: secretos, puerto HTTP y ubicacion de la base se definen via `.env`, evitando hardcodear credenciales.

## Estructura del proyecto
```
src/
  main.ts                                # Bootstrap Nest, aplica middlewares y levanta segun PORT
  application/
    dto/
      buy-recharge.request.dto.ts        # DTO de entrada para compras de recarga
      transaction.response.dto.ts        # DTO de salida para historial de transacciones
    use-cases/
      buy-recharge.usecase.ts            # Orquesta la compra, persiste y emite evento de exito
      get-history.usecase.ts             # Consulta el historial de recargas para un usuario
  domain/
    entities/
      recharge.ts                        # Entidad de dominio con reglas para crear recargas
      transaction.ts                     # Entidad de transaccion persistible
    events/
      recharge-succeeded.event.ts        # Evento de dominio disparado al completar una recarga
    repositories/
      transaction.repository.ts          # Puerto que define las operaciones de persistencia
    value-objects/
      amount.vo.ts                       # Value object que valida limites de monto
      phone-number.vo.ts                 # Value object que normaliza numero celular
  infrastructure/
    auth/
      auth.controller.ts                 # Endpoints de login y validacion basica
      auth.module.ts                     # Modulo de autenticacion y wiring de dependencias
      hardcoded-user.service.ts          # Servicio que expone usuarios de prueba
      jwt.guard.ts                       # Guardia que protege rutas verificando JWT
      jwt.strategy.ts                    # Estrategia Passport para validar tokens emitidos
    common/
      app.module.ts                      # Modulo raiz, configura TypeORM, ConfigModule y logger
      env.validation.ts                  # Validacion de variables de entorno criticas
      event-bus.service.ts               # Bus in-memory que publica eventos de dominio
      logger/
        http-logging.interceptor.ts      # Interceptor que genera logs por cada solicitud HTTP
        logger.module.ts                 # Modulo que expone StructuredLogger como singleton
        mask.util.ts                     # Utilidades para enmascarar identificadores sensibles
        structured-logger.ts             # Logger estructurado con soporte para niveles y detalles
    recharges/
      recharges.controller.ts            # Controlador REST para comprar y consultar recargas
      recharges.module.ts                # Modulo que cablea casos de uso y repositorio concreto
      transaction.orm-entity.ts          # Entidad TypeORM que mapea la tabla `transactions`
      transaction.typeorm.repository.ts  # Implementacion concreta del puerto con TypeORM

test/
  unit/
    amount.vo.spec.ts                    # Pruebas de los value objects de monto
    buy-recharge.usecase.spec.ts         # Caso de uso de compra con repositorios mockeados
    get-history.usecase.spec.ts          # Caso de uso de historial sin tocar la base real
    phone-number.vo.spec.ts              # Validaciones del value object de telefono
  e2e/
    app.e2e-spec.ts                      # Flujo extremo a extremo: login, compra, historial y errores

docs/
  postman/
    puntored-recargas.postman_collection.json  # Coleccion importable con los requests basicos
  sql/
    transactions.postgres.sql            # Script de creacion de tabla/indices para Postgres Railway
```
## Coleccion Postman
- Ruta: `docs/postman/puntored-recargas.postman_collection.json`.
- Variables de entorno: `baseUrl` (por defecto `http://localhost:3000`) y `accessToken` (rellenar con el JWT de Login).
- Requests incluidos: **Login**, **Comprar recarga** y **Historial de recargas**; ejecutalos en orden para probar el flujo completo.
