import { HomeService } from './home.service';
export declare class HomeController {
    private readonly homeService;
    constructor(homeService: HomeService);
    getHomePageData(cityId?: string): Promise<{
        banners: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            displayOrder: number;
            imageUrl: string;
            linkUrl: string | null;
            status: import(".prisma/client").$Enums.BannerStatus;
        }[];
        movies: {
            nowShowing: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                title: string;
                status: import(".prisma/client").$Enums.MovieStatus;
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
            }[];
            comingSoon: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                title: string;
                status: import(".prisma/client").$Enums.MovieStatus;
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
            cityId: string;
            address: string;
            amenities: string[];
        })[];
    }>;
}
