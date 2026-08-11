import { PrismaService } from '../prisma/prisma.service';
export declare class HomeService {
    private prisma;
    constructor(prisma: PrismaService);
    getHomePageData(cityId?: string): Promise<{
        banners: {
            id: string;
            title: string;
            status: import(".prisma/client").$Enums.BannerStatus;
            createdAt: Date;
            updatedAt: Date;
            imageUrl: string;
            linkUrl: string | null;
            displayOrder: number;
        }[];
        movies: {
            nowShowing: {
                id: string;
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
                createdAt: Date;
                updatedAt: Date;
            }[];
            comingSoon: {
                id: string;
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
                createdAt: Date;
                updatedAt: Date;
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
        })[];
    }>;
}
