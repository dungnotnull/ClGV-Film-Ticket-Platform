import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
export declare class BannerController {
    private readonly bannerService;
    constructor(bannerService: BannerService);
    findActive(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayOrder: number;
        title: string;
        status: import(".prisma/client").$Enums.BannerStatus;
        imageUrl: string;
        linkUrl: string | null;
    }[]>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayOrder: number;
        title: string;
        status: import(".prisma/client").$Enums.BannerStatus;
        imageUrl: string;
        linkUrl: string | null;
    }[]>;
    create(createBannerDto: CreateBannerDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayOrder: number;
        title: string;
        status: import(".prisma/client").$Enums.BannerStatus;
        imageUrl: string;
        linkUrl: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayOrder: number;
        title: string;
        status: import(".prisma/client").$Enums.BannerStatus;
        imageUrl: string;
        linkUrl: string | null;
    }>;
}
