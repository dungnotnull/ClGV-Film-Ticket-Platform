import { PrismaService } from '../prisma/prisma.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
export declare class CityService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCityDto: CreateCityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        displayOrder: number;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        code: string;
        displayOrder: number;
        cinemaCount: number;
    }[]>;
    findOne(id: string): Promise<{
        cinemas: {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string;
            amenities: string[];
            cityId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        displayOrder: number;
    }>;
    update(id: string, updateCityDto: UpdateCityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        displayOrder: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        displayOrder: number;
    }>;
}
