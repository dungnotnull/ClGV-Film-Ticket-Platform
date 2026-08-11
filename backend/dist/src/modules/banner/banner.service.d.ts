import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
export declare class BannerService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createBannerDto: CreateBannerDto): Promise<{
        id: string;
        title: string;
        status: import(".prisma/client").$Enums.BannerStatus;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string;
        linkUrl: string | null;
        displayOrder: number;
    }>;
    findActive(): Promise<{
        id: string;
        title: string;
        status: import(".prisma/client").$Enums.BannerStatus;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string;
        linkUrl: string | null;
        displayOrder: number;
    }[]>;
    findAll(): Promise<{
        id: string;
        title: string;
        status: import(".prisma/client").$Enums.BannerStatus;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string;
        linkUrl: string | null;
        displayOrder: number;
    }[]>;
    remove(id: string): Promise<{
        id: string;
        title: string;
        status: import(".prisma/client").$Enums.BannerStatus;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string;
        linkUrl: string | null;
        displayOrder: number;
    }>;
}
