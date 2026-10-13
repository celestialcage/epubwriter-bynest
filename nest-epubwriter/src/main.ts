import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');

  // // 💡 CORS 설정
  // app.enableCors({
  //   // 허용할 프론트엔드 도메인 주소 (React 19 Vite/CRA 기본 포트 설정)
  //   origin: [
  //     'http://localhost:5173', // Vite 기본 포트
  //     'http://127.0.0.1:5173',
  //   ],
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   // credentials: true, // 쿠키나 Authorization 헤더를 주고받을 때 필수
  // });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('개인 문서 관리 프로젝트 API')
    .setDescription('문서 및 폴더 관리 API 명세서')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // http://localhost:3000/api-docs 로 접속 가능

  await app.listen(process.env.PORT ?? 3010);
}
bootstrap();
