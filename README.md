# puntored-recargas-test
PuntoRed – Backend Recargas (NestJS + TS + DDD)

**Stack**: NestJS 10, TypeScript, TypeORM, SQLite (default) , JWT, class-validator, Jest, Supertest.  
**Arquitectura**: DDD (Domain / Application / Infrastructure) , Ingeniería Segura. Incluye evento `RechargeSucceeded` con bus en memoria.

## Diseño DDD + C4 Model
- **Contexto (C4 Nivel 1)**  
  - `Usuarios Web` interactúan con el futuro frontend que consume la `API de Recargas`.  
  - `Operadores / Servicios Externos` (futuros integradores) recibirán eventos del dominio; hoy se simulan en memoria.  
  - `SQLite / PostgreSQL` almacenan transacciones de recarga.

- **Contenedores (C4 Nivel 2)**  
  - `Backend NestJS`: servicio REST JWT que implementa autenticación y recargas.  
  - `Base de Datos`: persistencia relacional (SQLite local).  
  - `Event Bus In-Memory`: entrega eventos de dominio (`RechargeSucceededEvent`) a listeners internos.

- **Componentes (C4 Nivel 3)**  
  - `Domain`: entidades (`Recharge`, `Transaction`), VO y eventos con reglas de negocio puras.  
  - `Application`: casos de uso (`BuyRechargeUseCase`, `GetHistoryUseCase`) que orquestan repositorios y event bus.  
  - `Infrastructure`: adaptadores entrantes (controllers, guards) y salientes (TypeORM repo, auth service, logger).  
  - `Common`: configuración (`AppModule`, `env.validation`) y utilidades transversales (logger estructurado, interceptores).

- **Relaciones clave**  
  - Controllers → Casos de uso → Repositorios (puertos) mantienen el dominio desacoplado de la infraestructura.  
  - Casos de uso → EventBus permite evolucionar hacia integraciones asincrónicas.  
  - Logger estructurado se comparte para observabilidad consistente en todas las capas.

  ![alt text](image.png)