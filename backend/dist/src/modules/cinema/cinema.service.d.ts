import { PrismaService } from '../prisma/prisma.service';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateMatrixDto } from './dto/update-matrix.dto';
export declare class CinemaService {
    private prisma;
    constructor(prisma: PrismaService);
    createCinema(createCinemaDto: CreateCinemaDto): Promise<{
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string;
        amenities: string[];
        cityId: string;
    }>;
    findAllCinemas(cityId?: string): Promise<({
        city: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            displayOrder: number;
        };
        halls: {
            id: string;
            name: string;
            screenType: import(".prisma/client").$Enums.ScreenType;
        }[];
    } & {
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string;
        amenities: string[];
        cityId: string;
    })[]>;
    findOneCinema(id: string): Promise<{
        city: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            displayOrder: number;
        };
        halls: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            screenType: import(".prisma/client").$Enums.ScreenType;
            roomMatrix: import("@prisma/client/runtime/library").JsonValue;
            cinemaId: string;
        }[];
    } & {
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string;
        amenities: string[];
        cityId: string;
    }>;
    createHall(createHallDto: CreateHallDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        screenType: import(".prisma/client").$Enums.ScreenType;
        roomMatrix: import("@prisma/client/runtime/library").JsonValue;
        cinemaId: string;
    }>;
    getHallMatrix(hallId: string): Promise<{
        hallId: string;
        name: string;
        screenType: import(".prisma/client").$Enums.ScreenType;
        cinemaName: string;
        matrix: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateHallMatrix(hallId: string, updateMatrixDto: UpdateMatrixDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        screenType: import(".prisma/client").$Enums.ScreenType;
        roomMatrix: import("@prisma/client/runtime/library").JsonValue;
        cinemaId: string;
    }>;
}
