import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/infrastructure/common/app.module';
import { BuyRechargeUseCase } from '../../src/application/use-cases/buy-recharge.usecase';
import request from 'supertest';

describe('E2E', () => {
  let app: INestApplication;
  const http = () => app.getHttpServer();
  const loginRequest = () =>
    request(http())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password123' });
  const getAccessToken = async () => {
    const { body } = await loginRequest().expect(201);
    return body.access_token as string;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('login -> 201 y devuelve token', async () => {
    const { body } = await loginRequest().expect(201);
    expect(body.access_token).toBeDefined();
  });

  it('recharge buy -> 201 y luego history -> 200', async () => {
    const token = await getAccessToken();

    const { body: buy } = await request(http())
      .post('/recharges/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000, phoneNumber: '3101234567' })
      .expect(201);

    expect(buy.id).toBeDefined();

    const { body: history } = await request(http())
      .get('/recharges/history')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
  });

  it('rechaza acceso sin token -> 401', async () => {
    await request(http()).get('/recharges/history').expect(401);
  });

  it('rechaza payload inválido -> 400', async () => {
    const token = await getAccessToken();
    await request(http())
      .post('/recharges/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 999, phoneNumber: '399' })
      .expect(400);
  });

  it('maneja error inesperado -> 500', async () => {
    const token = await getAccessToken();
    const usecase = app.get(BuyRechargeUseCase);
    const spy = jest.spyOn(usecase, 'execute').mockRejectedValue(new Error('boom'));
    try {
      await request(http())
        .post('/recharges/buy')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 5000, phoneNumber: '3101234567' })
        .expect(500);
    } finally {
      spy.mockRestore();
    }
  });
});
