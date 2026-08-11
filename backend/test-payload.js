const fetch = require('node-fetch') || globalThis.fetch;
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZDA0YzRkMS1iYThkLTRlOTgtOTg1ZC00ZDBkMGUzYjRhMzgiLCJlbWFpbCI6ImFkbWluQGNsZ3Yudm4iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODYzMzM2MzEsImV4cCI6MTc4NjQyMDAzMX0.r4TGUa5i4LUJ2oHlJjjDFfwZUCN7o2QyVBYw9tnqmKc';
fetch('http://localhost:4000/api/v1/admin/showtimes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    "movieId": "e6741022-cd38-4f76-8b72-0a0f6cb7b34f",
    "cinemaId": "941b4e6f-77b2-4449-aa89-9b2184594f04",
    "hallId": "e4b988e8-6dab-4523-9c0d-17b37385666b",
    "startTime": "2027-08-10T16:25:00.000Z",
    "endTime": "2027-08-10T18:25:00.000Z",
    "basePrice": 120000
  })
}).then(res => res.json()).then(console.log).catch(console.error);
