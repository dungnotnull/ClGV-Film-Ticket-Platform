import { BannerStatus } from '@prisma/client';
export declare class CreateBannerDto {
    title: string;
    imageUrl: string;
    linkUrl?: string;
    displayOrder?: number;
    status?: BannerStatus;
}
