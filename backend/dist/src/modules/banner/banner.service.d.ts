import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
export declare class BannerService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createBannerDto: CreateBannerDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        displayOrder: number;
        imageUrl: string;
        linkUrl: string | null;
        status: import(".prisma/client").$Enums.BannerStatus;
    }>;
    findActive(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        displayOrder: number;
        imageUrl: string;
        linkUrl: string | null;
        status: import(".prisma/client").$Enums.BannerStatus;
    }[]>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        displayOrder: number;
        imageUrl: string;
        linkUrl: string | null;
        status: import(".prisma/client").$Enums.BannerStatus;
    }[]>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        displayOrder: number;
        imageUrl: string;
        linkUrl: string | null;
        status: import(".prisma/client").$Enums.BannerStatus;
    }>;
}
