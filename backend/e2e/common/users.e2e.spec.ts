import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { getRepository } from 'typeorm';
import { User } from '../../src/common/entities/user.entity';

const signUpPayload = `
  {
    firstname: "Christopher",
    lastname: "Fouquier",
    email: "christopher.fouquier+100@adfab.fr",
    password: "1Password$",
    passwordConfirmation: "1Password$",
    cgu: true
  }
`;

describe('Users', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.init();
    await new Promise((resolve, reject) => {
      setTimeout(() => resolve('done!'), 1000);
    });
  });

  it(`SignUp - OK`, async () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signup(input: ${signUpPayload}) {
            email
          }
        }`})
      .expect(200)
      .then(({ body }: any) => {
        expect(body.data.signup.email).toBe('christopher.fouquier+100@adfab.fr');
      });
  });

  it(`SignUp - Password mismatch`, async () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
        signup(input:   {
          firstname: "Christopher",
          lastname: "Fouquier",
          email: "christopher.fouquier+100@adfab.fr",
          password: "1Password$",
          passwordConfirmation: "1Password$croute",
          cgu: true
        }) {
          email
        }
      }`})
      .expect(200)
      .then(({ body }: any) => {
        const { errors } = body;
        const [error] = errors;
        expect(error.message).toBe('api.error.signup.password_mismatch');
      });
  });

  it(`SignUp - Email already exist`, async () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
        signup(input: ${signUpPayload}) {
          email
        }
      }`})
      .expect(200)
      .then(({ body }: any) => {
        const { errors } = body;
        const [error] = errors;
        expect(error.message).toBe('api.error.signup_email_exist');
      });
  });

  it(`SignIn - Enabled`, async () => {
    const user: User = await getRepository(User).findOne({ email: 'christopher.fouquier+100@adfab.fr' });
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          activateUser(confirmationToken: "${user.emailConfirmationToken}")
        }`
      })
      .expect(200)
      .then(({ body }: any) => {
        expect(body.data.activateUser).toBe(true);
      });
  });

  it(`SignIn - OK`, async () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
        signin(input: {
          email: "christopher.fouquier+100@adfab.fr",
          password: "1Password$"
        }) {
          email
        }
      }`})
      .expect(200)
      .then(({ body }: any) => {
        expect(body.data.signin.email).toBe('christopher.fouquier+100@adfab.fr');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
