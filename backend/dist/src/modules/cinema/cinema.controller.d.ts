import { CinemaService } from './cinema.service';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateMatrixDto } from './dto/update-matrix.dto';
export declare class CinemaController {
    private readonly cinemaService;
    constructor(cinemaService: CinemaService);
    findAllCinemas(cityId?: string): Promise<({
        city: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            displayOrder: number;
            code: string;
        };
        halls: {
            id: string;
            name: string;
            screenType: import(".prisma/client").$Enums.ScreenType;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string;
        phone: string | null;
        amenities: string[];
        cityId: string;
    })[]>;
    findOneCinema(id: string): Promise<{
        city: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            displayOrder: number;
            code: string;
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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string;
        phone: string | null;
        amenities: string[];
        cityId: string;
    }>;
    createCinema(createCinemaDto: CreateCinemaDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string;
        phone: string | null;
        amenities: string[];
        cityId: string;
    }>;
    updateCinema(id: string, updateCinemaDto: UpdateCinemaDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string;
        phone: string | null;
        amenities: string[];
        cityId: string;
    }>;
    deleteCinema(id: string): Promise<{
        success: boolean;
        message: string;
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
    deleteHall(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getHallMatrix(id: string): Promise<{
        hallId: string;
        name: string;
        screenType: import(".prisma/client").$Enums.ScreenType;
        cinemaName: string;
        matrix: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateHallMatrix(id: string, updateMatrixDto: UpdateMatrixDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        screenType: import(".prisma/client").$Enums.ScreenType;
        roomMatrix: import("@prisma/client/runtime/library").JsonValue;
        cinemaId: string;
    }>;
}
