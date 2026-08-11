import { PrismaClient, MovieStatus, AgeRating } from '@prisma/client';

const prisma = new PrismaClient();

const upcomingMovies = [
  { title: "Spider-Man: Beyond the Spider-Verse", director: "Joaquim Dos Santos", year: 2026, runtime: 140, poster: "8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", genres: ["Animation", "Action", "Adventure"] },
  { title: "Captain America: Brave New World", director: "Julius Onah", year: 2026, runtime: 135, poster: "r2J02Z2OpNTctfOSN1Ydgii51I3.jpg", genres: ["Action", "Sci-Fi"] },
  { title: "Thunderbolts", director: "Jake Schreier", year: 2026, runtime: 125, poster: "qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg", genres: ["Action", "Adventure"] },
  { title: "Fantastic Four: First Steps", director: "Matt Shakman", year: 2026, runtime: 130, poster: "fiVW06jE7z9YnO4trhaMEdclSiC.jpg", genres: ["Action", "Sci-Fi"] },
  { title: "Superman: Legacy", director: "James Gunn", year: 2026, runtime: 150, poster: "gPbM0MK8CP8A174rmUwGsADNYKD.jpg", genres: ["Action", "Sci-Fi", "Adventure"] },
  { title: "The Batman Part II", director: "Matt Reeves", year: 2026, runtime: 165, poster: "rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg", genres: ["Action", "Crime", "Drama"] },
  { title: "Avatar: Fire and Ash", director: "James Cameron", year: 2026, runtime: 180, poster: "NNxYkU70HPurnNCSiCjYAmacwm.jpg", genres: ["Action", "Adventure", "Sci-Fi"] },
  { title: "Avengers: Doomsday", director: "Anthony & Joe Russo", year: 2026, runtime: 160, poster: "iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg", genres: ["Action", "Adventure", "Sci-Fi"] },
  { title: "Avengers: Secret Wars", director: "Anthony & Joe Russo", year: 2027, runtime: 175, poster: "drznQL2sB5435rQ2x6hA8mY54yQ.jpg", genres: ["Action", "Adventure", "Sci-Fi"] },
  { title: "Jurassic World: Rebirth", director: "Gareth Edwards", year: 2026, runtime: 135, poster: "mXLOHHc1Zeuwsl4xYKjMacHIp43.jpg", genres: ["Action", "Adventure", "Sci-Fi"] },
  { title: "TRON: Ares", director: "Joachim Rønning", year: 2026, runtime: 120, poster: "b0Ej6fnXAP8fK75hlyi2jKqdhHz.jpg", genres: ["Sci-Fi", "Action"] },
  { title: "Fast X: Part 2", director: "Louis Leterrier", year: 2026, runtime: 130, poster: "5gzzkR7y3hnY8AD1wXjCnVlHba5.jpg", genres: ["Action", "Crime", "Thriller"] },
  { title: "Minecraft: The Movie", director: "Jared Hess", year: 2026, runtime: 105, poster: "c90QwaAhnRAcK1vE5XBi5tYl5n9.jpg", genres: ["Action", "Adventure", "Family"] },
  { title: "Blade", director: "Yann Demange", year: 2026, runtime: 120, poster: "vBZ0qvaRxqEhZwl6LWmru9qYmi.jpg", genres: ["Action", "Horror", "Sci-Fi"] },
  { title: "How to Train Your Dragon (Live Action)", director: "Dean DeBlois", year: 2026, runtime: 115, poster: "aQPeznSu7XDTrrdCtT5eT708AyL.jpg", genres: ["Action", "Adventure", "Family"] },
  { title: "Moana (Live Action)", director: "Thomas Kail", year: 2026, runtime: 120, poster: "A4j8S6moOU2nnCE5prmPZt3FPh.jpg", genres: ["Adventure", "Family", "Fantasy"] },
  { title: "Supergirl: Woman of Tomorrow", director: "Craig Gillespie", year: 2026, runtime: 125, poster: "9GBhzXMFjgcZ3FdR9w3bUMMTvw5.jpg", genres: ["Action", "Sci-Fi", "Adventure"] },
  { title: "Dune: Messiah", director: "Denis Villeneuve", year: 2027, runtime: 165, poster: "mBaXZ95R2OxueZhvQbcEWy2DqyO.jpg", genres: ["Sci-Fi", "Drama", "Adventure"] },
  { title: "Mickey 17", director: "Bong Joon Ho", year: 2026, runtime: 139, poster: "vcZWJGvB5xdy0fXfGzBfHw7OaA9.jpg", genres: ["Sci-Fi", "Drama"] },
  { title: "Zootopia 2", director: "Byron Howard", year: 2026, runtime: 110, poster: "7lTnXOy0iNtBWC2Zk5Z3J3R0B7L.jpg", genres: ["Animation", "Comedy", "Family"] }
];

async function main() {
  console.log('🌱 Starting 20 COMING SOON movies seeding...');

  // Note: We don't delete existing movies, just append 20 upcoming movies
  // So the user will have 30 showing and 20 coming soon.

  for (const item of upcomingMovies) {
    // Random future date in 2026 or 2027
    const releaseDate = new Date(`${item.year}-06-15`);
    const posterUrl = `https://image.tmdb.org/t/p/w500/${item.poster}`;

    await prisma.movie.create({
      data: {
        title: item.title,
        titleOriginal: item.title,
        director: item.director,
        cast: 'Various Actors',
        genres: item.genres,
        durationMinutes: item.runtime,
        releaseDate: releaseDate,
        posterUrl: posterUrl,
        trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ageRating: AgeRating.T16,
        languageType: 'SUB',
        status: MovieStatus.COMING_SOON, // <--- TRẠNG THÁI SẮP CHIẾU
        description: `This is an upcoming blockbuster movie: ${item.title}.`,
      },
    });
  }

  console.log('✅ Successfully seeded 20 COMING SOON movies with TMDB images!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
