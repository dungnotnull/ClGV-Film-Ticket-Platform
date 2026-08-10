import { ShowtimeService } from './showtime.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
export declare class ShowtimeController {
    private readonly showtimeService;
    constructor(showtimeService: ShowtimeService);
    findAll(movieId?: string, cinemaId?: string, date?: string): Promise<({
        cinema: {
            id: string;
            name: string;
            address: string;
        };
        hall: {
            id: string;
            name: string;
            screenType: import(".prisma/client").$Enums.ScreenType;
            roomMatrix: import("@prisma/client/runtime/library").JsonValue;
        };
        movie: {
            id: string;
            title: string;
            durationMinutes: number;
            posterUrl: string;
            ageRating: import(".prisma/client").$Enums.AgeRating;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cinemaId: string;
        startTime: Date;
        movieId: string;
        hallId: string;
        endTime: Date;
        basePrice: number;
    })[]>;
    getShowtimeSeats(id: string): Promise<{
        seats: {
            status: import(".prisma/client").$Enums.SeatStatus;
            heldByUserId: string;
            priceModifier: number;
            price: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.SeatType;
            expiresAt: Date | null;
            col: number;
            row: string;
            showtimeId: string;
            seatId: string;
        }[];
        cinema: {
            name: string;
        };
        hall: {
            name: string;
            screenType: import(".prisma/client").$Enums.ScreenType;
            roomMatrix: import("@prisma/client/runtime/library").JsonValue;
        };
        movie: {
            title: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cinemaId: string;
        startTime: Date;
        movieId: string;
        hallId: string;
        endTime: Date;
        basePrice: number;
    }>;
    create(createShowtimeDto: CreateShowtimeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cinemaId: string;
        startTime: Date;
        movieId: string;
        hallId: string;
        endTime: Date;
        basePrice: number;
    }>;
}
