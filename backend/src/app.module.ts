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
import { RedisModule } from './modules/redis/redis.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { ComboModule } from './modules/combo/combo.module';
import { VoucherModule } from './modules/voucher/voucher.module';
import { CGVCardModule } from './modules/cgv-card/cgv-card.module';
import { PaymentModule } from './modules/payment/payment.module';
import { BookingModule } from './modules/booking/booking.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { UsersModule } from './modules/users/users.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RedisModule,
    WebsocketModule,
    AuthModule,
    UsersModule,
    UploadModule,
    CityModule,
    CinemaModule,
    BannerModule,
    MovieModule,
    ShowtimeModule,
    HomeModule,
    ComboModule,
    VoucherModule,
    CGVCardModule,
    PaymentModule,
    BookingModule,
    TicketModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
