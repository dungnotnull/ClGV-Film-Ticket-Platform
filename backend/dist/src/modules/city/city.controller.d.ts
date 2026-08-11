import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
export declare class CityController {
    private readonly cityService;
    constructor(cityService: CityService);
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string;
            phone: string | null;
            amenities: string[];
            cityId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        displayOrder: number;
        code: string;
    }>;
    create(createCityDto: CreateCityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        displayOrder: number;
        code: string;
    }>;
    update(id: string, updateCityDto: UpdateCityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        displayOrder: number;
        code: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        displayOrder: number;
        code: string;
    }>;
}
