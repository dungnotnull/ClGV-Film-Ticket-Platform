import { PrismaService } from '../prisma/prisma.service';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';
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
        cityId: string;
        address: string;
        amenities: string[];
    }>;
    updateCinema(id: string, updateCinemaDto: UpdateCinemaDto): Promise<{
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        cityId: string;
        address: string;
        amenities: string[];
    }>;
    deleteCinema(id: string): Promise<{
        success: boolean;
        message: string;
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
        cityId: string;
        address: string;
        amenities: string[];
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
            cinemaId: string;
            screenType: import(".prisma/client").$Enums.ScreenType;
            roomMatrix: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        cityId: string;
        address: string;
        amenities: string[];
    }>;
    createHall(createHallDto: CreateHallDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        cinemaId: string;
        screenType: import(".prisma/client").$Enums.ScreenType;
        roomMatrix: import("@prisma/client/runtime/library").JsonValue;
    }>;
    deleteHall(hallId: string): Promise<{
        success: boolean;
        message: string;
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
        cinemaId: string;
        screenType: import(".prisma/client").$Enums.ScreenType;
        roomMatrix: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
