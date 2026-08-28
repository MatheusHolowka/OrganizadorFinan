import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🛡️ Helmet para cabeçalhos HTTP de segurança (HSTS, CSP, XSS, Clickjacking, X-Content-Type-Options)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );

  // Limite seguro de payload para mitigar ataques de Memory Exhaustion DoS
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // Prefixo global de API
  app.setGlobalPrefix('api');

  // 🔒 Configuração Segura de CORS
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:4200',
    'http://localhost:3000',
    'https://organizadorfinan.com.br',
    'https://www.organizadorfinan.com.br',
    'https://app.organizadorfinan.com.br',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permite chamadas locais, mobile/CLI sem origin, ou domínios da lista
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('CORS bloqueado por política de segurança'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validação global com class-validator (rejeita payloads maliciosos ou propriedades injetadas)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 FINAN API rodando na porta ${port}/api`);
}
bootstrap();

