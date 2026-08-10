import { MovieStatus } from '@prisma/client';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
export declare class MovieController {
    private readonly movieService;
    constructor(movieService: MovieService);
    findAll(status?: MovieStatus, genre?: string, search?: string): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
        reviews: ({
            user: {
                id: string;
                fullName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            movieId: string;
            rating: number;
            comment: string;
        })[];
        showtimes: ({
            cinema: {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                cityId: string;
                address: string;
                amenities: string[];
            };
            hall: {
                id: string;
                name: string;
                screenType: import(".prisma/client").$Enums.ScreenType;
                roomMatrix: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            cinemaId: string;
            startTime: Date;
            movieId: string;
            hallId: string;
            endTime: Date;
            basePrice: number;
        })[];
    } & {
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
    }>;
    create(createMovieDto: CreateMovieDto): Promise<{
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
    }>;
    update(id: string, updateMovieDto: UpdateMovieDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
