"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./modules/prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const city_module_1 = require("./modules/city/city.module");
const cinema_module_1 = require("./modules/cinema/cinema.module");
const banner_module_1 = require("./modules/banner/banner.module");
const movie_module_1 = require("./modules/movie/movie.module");
const showtime_module_1 = require("./modules/showtime/showtime.module");
const home_module_1 = require("./modules/home/home.module");
const redis_module_1 = require("./modules/redis/redis.module");
const websocket_module_1 = require("./modules/websocket/websocket.module");
const combo_module_1 = require("./modules/combo/combo.module");
const voucher_module_1 = require("./modules/voucher/voucher.module");
const cgv_card_module_1 = require("./modules/cgv-card/cgv-card.module");
const payment_module_1 = require("./modules/payment/payment.module");
const booking_module_1 = require("./modules/booking/booking.module");
const ticket_module_1 = require("./modules/ticket/ticket.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const users_module_1 = require("./modules/users/users.module");
const upload_module_1 = require("./modules/upload/upload.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            websocket_module_1.WebsocketModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            upload_module_1.UploadModule,
            city_module_1.CityModule,
            cinema_module_1.CinemaModule,
            banner_module_1.BannerModule,
            movie_module_1.MovieModule,
            showtime_module_1.ShowtimeModule,
            home_module_1.HomeModule,
            combo_module_1.ComboModule,
            voucher_module_1.VoucherModule,
            cgv_card_module_1.CGVCardModule,
            payment_module_1.PaymentModule,
            booking_module_1.BookingModule,
            ticket_module_1.TicketModule,
            analytics_module_1.AnalyticsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map