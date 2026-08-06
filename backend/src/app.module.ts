import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CityModule } from './modules/city/city.module';
import { CinemaModule } from './modules/cinema/cinema.module';
import { BannerModule } from './modules/banner/banner.module';
import { MovieModule } from './modules/movie/movie.module';
import { ShowtimeModule } from './modules/showtime/showtime.module';
import { HomeModule } from './modules/home/home.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { MembershipModule } from './modules/membership/membership.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CityModule,
    CinemaModule,
    BannerModule,
    MovieModule,
    ShowtimeModule,
    HomeModule,
    AnalyticsModule,
    TicketModule,
    MembershipModule,
  ],
})
export class AppModule {}
