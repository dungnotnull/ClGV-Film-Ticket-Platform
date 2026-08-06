import { PrismaService } from '../prisma/prisma.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
export declare class ShowtimeService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createShowtimeDto: CreateShowtimeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cinemaId: string;
        startTime: Date;
        endTime: Date;
        basePrice: number;
        movieId: string;
        hallId: string;
    }>;
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
        endTime: Date;
        basePrice: number;
        movieId: string;
        hallId: string;
    })[]>;
    getShowtimeSeats(showtimeId: string): Promise<{
        cinema: {
            name: string;
        };
        hall: {
            name: string;
            screenType: import(".prisma/client").$Enums.ScreenType;
        };
        movie: {
            title: string;
        };
        seats: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            row: string;
            col: number;
            type: import(".prisma/client").$Enums.SeatType;
            priceModifier: number;
            status: import(".prisma/client").$Enums.SeatStatus;
            expiresAt: Date | null;
            showtimeId: string;
            seatId: string;
            heldByUserId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cinemaId: string;
        startTime: Date;
        endTime: Date;
        basePrice: number;
        movieId: string;
        hallId: string;
    }>;
}
