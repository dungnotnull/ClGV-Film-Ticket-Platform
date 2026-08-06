import { ScreenType } from '@prisma/client';
export declare class CreateHallDto {
    cinemaId: string;
    name: string;
    screenType: ScreenType;
    roomMatrix: any;
}
