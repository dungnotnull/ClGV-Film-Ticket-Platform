import { PrismaService } from '../prisma/prisma.service';
export declare class HomeService {
    private prisma;
    constructor(prisma: PrismaService);
    getHomePageData(cityId?: string): Promise<{
        banners: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            displayOrder: number;
            title: string;
            status: import(".prisma/client").$Enums.BannerStatus;
            imageUrl: string;
            linkUrl: string | null;
        }[];
        movies: {
            nowShowing: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                titleOriginal: string | null;
                director: string | null;
                cast: string | null;
                genres: string[];
                durationMinutes: number;
                releaseDate: Date;
                posterUrl: string;
                trailerUrl: string | null;
                ageRating: import(".prisma/client").$Enums.AgeRating;
                languageType: string;
                status: import(".prisma/client").$Enums.MovieStatus;
                description: string;
            }[];
            comingSoon: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                titleOriginal: string | null;
                director: string | null;
                cast: string | null;
                genres: string[];
                durationMinutes: number;
                releaseDate: Date;
                posterUrl: string;
                trailerUrl: string | null;
                ageRating: import(".prisma/client").$Enums.AgeRating;
                languageType: string;
                status: import(".prisma/client").$Enums.MovieStatus;
                description: string;
            }[];
        };
        cities: {
            id: string;
            name: string;
            code: string;
            cinemaCount: number;
        }[];
        featuredCinemas: ({
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
            address: string;
            amenities: string[];
            cityId: string;
        })[];
    }>;
}
