const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = 3000;

// ── OMDB API (Using public free key) ───────────────────────
const OMDB_KEY = 'trilogy';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Helper: fetch poster + plot from OMDB ──────────────────
function fetchMovieInfo(title) {
  return new Promise((resolve) => {
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_KEY}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.Response === 'True') {
            resolve({
              poster: (json.Poster && json.Poster !== 'N/A') ? json.Poster : null,
              overview: (json.Plot && json.Plot !== 'N/A') ? json.Plot : '',
            });
          } else {
            resolve({ poster: null, overview: '' });
          }
        } catch {
          resolve({ poster: null, overview: '' });
        }
      });
    }).on('error', () => resolve({ poster: null, overview: '' }));
  });
}

// ── Hardcoded Seed Data (Fully Hydrated for Vercel) ────────
let nextId = 9;
let movies = [
  { id: 1, title: 'Inception', genre: 'Action', rating: 5, recommendation: 'Yes', poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg', description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO, but his tragic past may doom the project and his team to disaster.' },
  { id: 2, title: 'The Dark Knight', genre: 'Action', rating: 5, recommendation: 'Yes', poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg', description: 'When a menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman, James Gordon and Harvey Dent must work together to put an end to the madness.' },
  { id: 3, title: 'Interstellar', genre: 'Adventure', rating: 5, recommendation: 'Yes', poster: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_SX300.jpg', description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.' },
  { id: 4, title: 'Parasite', genre: 'Drama', rating: 5, recommendation: 'Yes', poster: 'https://m.media-amazon.com/images/M/MV5BYjk1Y2U4MjQtY2ZiNS00OWQyLWI3MmYtZWUwNmRjYWRiNWNhXkEyXkFqcGc@._V1_SX300.jpg', description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.' },
  { id: 5, title: 'The Godfather', genre: 'Crime', rating: 5, recommendation: 'Yes', poster: 'https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_SX300.jpg', description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.' },
  { id: 6, title: 'Pulp Fiction', genre: 'Crime', rating: 5, recommendation: 'Yes', poster: 'https://m.media-amazon.com/images/M/MV5BYTViYTE3ZGQtNDBlMC00ZTAyLTkyODMtZGRiZDg0MjA2YThkXkEyXkFqcGc@._V1_SX300.jpg', description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.' },
  { id: 7, title: 'Morbius', genre: 'Action', rating: 1, recommendation: 'No', poster: 'https://m.media-amazon.com/images/M/MV5BY2UzYzFiZWUtOGU5ZC00YTIxLWFlNGUtMGU1YmI4OWUzN2FmXkEyXkFqcGc@._V1_SX300.jpg', description: 'Biochemist Michael Morbius tries to cure himself of a rare blood disease, but he inadvertently infects himself with a form of vampirism instead.' },
  { id: 8, title: 'The Room', genre: 'Drama', rating: 2, recommendation: 'No', poster: 'https://m.media-amazon.com/images/M/MV5BYmNkMThiODYtZTAzMC00ODJkLTg5MmEtMWIyMGFlZDlkYmNlXkEyXkFqcGc@._V1_SX300.jpg', description: "In San Francisco, an amiable banker's seemingly perfect life is turned upside down when his deceitful bride-to-be embarks on a passionate affair with his best friend." }
];

// ── GET /movies ───────────────────────────────────────────
app.get('/movies', (req, res) => {
  let result = movies;
  if (req.query.rating) {
    const rating = parseInt(req.query.rating, 10);
    if (!isNaN(rating)) {
      result = result.filter(m => m.rating === rating);
    }
  }
  res.json(result);
});

// ── POST /movies ──────────────────────────────────────────
app.post('/movies', async (req, res) => {
  const { title, genre, rating, recommendation, description } = req.body;

  if (!title || !genre || rating == null || !recommendation) {
    return res.status(400).json({ error: 'All fields are required: title, genre, rating, recommendation' });
  }

  // Fetch poster from TMDB
  const info = await fetchMovieInfo(title);

  const movie = {
    id: nextId++,
    title,
    genre,
    rating: parseInt(rating, 10),
    recommendation,
    description: description || info.overview || '',
    poster: info.poster,
  };

  movies.push(movie);
  res.status(201).json(movie);
});

// ── PATCH /movies/:id ─────────────────────────────────────
app.patch('/movies/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const movie = movies.find(m => m.id === id);

  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' });
  }

  const { title, genre, rating, recommendation, description } = req.body;

  if (title !== undefined && title !== movie.title) {
    movie.title = title;
    const info = await fetchMovieInfo(title);
    movie.poster = info.poster;
    if (!movie.description) movie.description = info.overview || '';
  }

  if (genre !== undefined) movie.genre = genre;
  if (rating !== undefined) movie.rating = parseInt(rating, 10);
  if (recommendation !== undefined) movie.recommendation = recommendation;
  if (description !== undefined) movie.description = description;

  res.json(movie);
});

// ── DELETE /movies/:id ────────────────────────────────────
app.delete('/movies/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = movies.findIndex(m => m.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Movie not found' });
  }

  const deleted = movies.splice(index, 1);
  res.json(deleted[0]);
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🎬 CineVault running at http://localhost:${PORT}`);
});
