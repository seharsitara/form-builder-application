import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FormsModule } from './forms/forms.module';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RootController } from './root.controller';
import { ResponsesModule } from './responses/responses.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, FormsModule, ResponsesModule],
  controllers: [HealthController, RootController],
  providers: [],
})
export class AppModule {}
