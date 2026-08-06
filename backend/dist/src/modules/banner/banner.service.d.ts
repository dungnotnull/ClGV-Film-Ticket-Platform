import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
export declare class BannerService {
    private prisma;
    constructor(prisma: PrismaService);
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
