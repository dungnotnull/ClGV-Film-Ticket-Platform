import { PrismaClient, MovieStatus, AgeRating } from '@prisma/client';

const prisma = new PrismaClient();

const realisticMovies = [
  { title: "The Dark Knight", director: "Christopher Nolan", year: 2008, runtime: 152, poster: "qJ2tW6WMUDux911r6m7haRef0WH.jpg", genres: ["Action", "Crime", "Drama"] },
  { title: "Inception", director: "Christopher Nolan", year: 2010, runtime: 148, poster: "9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", genres: ["Action", "Sci-Fi", "Thriller"] },
  { title: "Interstellar", director: "Christopher Nolan", year: 2014, runtime: 169, poster: "gEU2QlsUUHXjNpeVD8BfFvN02O1.jpg", genres: ["Adventure", "Drama", "Sci-Fi"] },
  { title: "Avengers: Endgame", director: "Anthony Russo, Joe Russo", year: 2019, runtime: 181, poster: "or06FN3Dka5tukK1e9sl16pB3iy.jpg", genres: ["Adventure", "Sci-Fi", "Action"] },
  { title: "Spider-Man: No Way Home", director: "Jon Watts", year: 2021, runtime: 148, poster: "1g0dhYtq4irTY1R80vFAeA0r307.jpg", genres: ["Action", "Adventure", "Sci-Fi"] },
  { title: "Avatar", director: "James Cameron", year: 2009, runtime: 162, poster: "jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg", genres: ["Action", "Adventure", "Fantasy"] },
  { title: "Avatar: The Way of Water", director: "James Cameron", year: 2022, runtime: 192, poster: "t6HIqrHeCP37qeV2cThk08qW4y.jpg", genres: ["Science Fiction", "Action", "Adventure"] },
  { title: "Titanic", director: "James Cameron", year: 1997, runtime: 194, poster: "9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg", genres: ["Drama", "Romance"] },
  { title: "The Matrix", director: "Lana Wachowski, Lilly Wachowski", year: 1999, runtime: 136, poster: "f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", genres: ["Action", "Sci-Fi"] },
  { title: "Joker", director: "Todd Phillips", year: 2019, runtime: 122, poster: "udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", genres: ["Crime", "Thriller", "Drama"] },
  { title: "Fight Club", director: "David Fincher", year: 1999, runtime: 139, poster: "pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", genres: ["Drama"] },
  { title: "Forrest Gump", director: "Robert Zemeckis", year: 1994, runtime: 142, poster: "arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", genres: ["Comedy", "Drama", "Romance"] },
  { title: "Pulp Fiction", director: "Quentin Tarantino", year: 1994, runtime: 154, poster: "d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", genres: ["Thriller", "Crime"] },
  { title: "The Shawshank Redemption", director: "Frank Darabont", year: 1994, runtime: 142, poster: "q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", genres: ["Drama", "Crime"] },
  { title: "Gladiator", director: "Ridley Scott", year: 2000, runtime: 155, poster: "ty8TGRuvJLPUmAR1H1nRlsgwfc7.jpg", genres: ["Action", "Drama", "Adventure"] },
  { title: "The Godfather", director: "Francis Ford Coppola", year: 1972, runtime: 175, poster: "3bhkrj58Vtu7enYsRolD1fZdja1.jpg", genres: ["Drama", "Crime"] },
  { title: "The Lord of the Rings: The Return of the King", director: "Peter Jackson", year: 2003, runtime: 201, poster: "rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg", genres: ["Adventure", "Fantasy", "Action"] },
  { title: "Oppenheimer", director: "Christopher Nolan", year: 2023, runtime: 180, poster: "8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", genres: ["Drama", "History"] },
  { title: "Dune", director: "Denis Villeneuve", year: 2021, runtime: 155, poster: "d5NXSklXo0qyIYkgV94XAgMIckC.jpg", genres: ["Science Fiction", "Adventure"] },
  { title: "The Batman", director: "Matt Reeves", year: 2022, runtime: 176, poster: "74xTEgt7R36Fpooo50r9T25onhq.jpg", genres: ["Crime", "Mystery", "Thriller"] },
  { title: "Top Gun: Maverick", director: "Joseph Kosinski", year: 2022, runtime: 130, poster: "62HCnUTziyWcpDaBO2i1DX17ljH.jpg", genres: ["Action", "Drama"] },
  { title: "Black Panther", director: "Ryan Coogler", year: 2018, runtime: 134, poster: "uxzzxijgPIY7slzFvMotPv8wjKA.jpg", genres: ["Action", "Adventure", "Fantasy"] },
  { title: "Parasite", director: "Bong Joon Ho", year: 2019, runtime: 132, poster: "7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", genres: ["Comedy", "Thriller", "Drama"] },
  { title: "John Wick", director: "Chad Stahelski", year: 2014, runtime: 101, poster: "fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg", genres: ["Action", "Thriller"] },
  { title: "Mad Max: Fury Road", director: "George Miller", year: 2015, runtime: 120, poster: "8tZYtuWezp8JbcsvHYO0O46tFbo.jpg", genres: ["Action", "Adventure", "Science Fiction"] },
  { title: "Jurassic Park", director: "Steven Spielberg", year: 1993, runtime: 127, poster: "oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg", genres: ["Adventure", "Science Fiction"] },
  { title: "Star Wars: Episode IV - A New Hope", director: "George Lucas", year: 1977, runtime: 121, poster: "6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg", genres: ["Adventure", "Action", "Science Fiction"] },
  { title: "The Silence of the Lambs", director: "Jonathan Demme", year: 1991, runtime: 118, poster: "uS9m8OBk1A8eM9I042bx8XXpqAq.jpg", genres: ["Crime", "Drama", "Thriller"] },
  { title: "Se7en", director: "David Fincher", year: 1995, runtime: 127, poster: "6yoghtyTpznpBik8EngEmJskVPh.jpg", genres: ["Crime", "Mystery", "Thriller"] },
  { title: "Léon: The Professional", director: "Luc Besson", year: 1994, runtime: 110, poster: "wHqGb8J6tXEEuvHXHWKsRmOUg36.jpg", genres: ["Crime", "Drama", "Action"] }
];

async function main() {
  console.log('🌱 Starting 30 movies seeding...');

  // Xoá rác cũ
  await prisma.showtimeSeat.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.movie.deleteMany();

  for (const item of realisticMovies) {
    const releaseDate = new Date(`${item.year}-01-01`);
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
        status: MovieStatus.NOW_SHOWING,
        description: `This is a realistic description for the movie ${item.title}.`,
      },
    });
  }

  console.log('✅ Successfully seeded 30 movies with realistic TMDB images!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
