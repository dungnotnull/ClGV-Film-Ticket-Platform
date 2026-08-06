import { MovieStatus, AgeRating } from '@prisma/client';
export declare class CreateMovieDto {
    title: string;
    titleOriginal?: string;
    director?: string;
    cast?: string;
    genres?: string[];
    durationMinutes: number;
    releaseDate: string;
    posterUrl: string;
    trailerUrl?: string;
    ageRating?: AgeRating;
    languageType?: string;
    status?: MovieStatus;
    description: string;
}
