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

// ── In-memory movie store ──────────────────────────────────
let nextId = 9;
let movies = [
  { id: 1, title: 'Inception',            genre: 'Sci-Fi',    rating: 5, recommendation: 'Yes', poster: null, description: '' },
  { id: 2, title: 'The Dark Knight',      genre: 'Action',    rating: 5, recommendation: 'Yes', poster: null, description: '' },
  { id: 3, title: 'Interstellar',         genre: 'Sci-Fi',    rating: 4, recommendation: 'Yes', poster: null, description: '' },
  { id: 4, title: 'Parasite',             genre: 'Thriller',  rating: 5, recommendation: 'Yes', poster: null, description: '' },
  { id: 5, title: 'The Godfather',        genre: 'Drama',     rating: 5, recommendation: 'Yes', poster: null, description: '' },
  { id: 6, title: 'Pulp Fiction',         genre: 'Crime',     rating: 4, recommendation: 'Yes', poster: null, description: '' },
  { id: 7, title: 'Morbius',              genre: 'Action',    rating: 1, recommendation: 'No',  poster: null, description: '' },
  { id: 8, title: 'The Room',             genre: 'Drama',     rating: 2, recommendation: 'No',  poster: null, description: '' },
];

// Fetch posters + descriptions for seed data on startup
async function loadSeedData() {
  console.log('  Loading movie data from OMDB...');
  for (const movie of movies) {
    const info = await fetchMovieInfo(movie.title);
    movie.poster = info.poster;
    movie.description = info.overview;
  }
  console.log('  ✓ All movie posters and descriptions loaded');
}

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

  if (genre !== undefined)          movie.genre          = genre;
  if (rating !== undefined)         movie.rating         = parseInt(rating, 10);
  if (recommendation !== undefined) movie.recommendation = recommendation;
  if (description !== undefined)    movie.description    = description;

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
app.listen(PORT, async () => {
  console.log(`🎬 CineVault running at http://localhost:${PORT}`);
  await loadSeedData();
});
