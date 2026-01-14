import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FormsModule } from './forms/forms.module';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RootController } from './root.controller';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, FormsModule],
  controllers: [HealthController, RootController],
  providers: [],
})
export class AppModule {}
