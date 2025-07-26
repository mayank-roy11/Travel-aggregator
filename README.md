# Travel Aggregator Monorepo

This project contains both the backend (Express.js) and frontend (React) for a travel aggregator application, managed in a single monorepo.

## Project Structure

- `backend/` - Express.js API
- `frontend/` - React frontend
- `node_modules/` - Installed dependencies
- `.env` - Environment variables

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up your environment variables in `.env`.
3. Start both backend and frontend:
   ```sh
   npm start
   ```

## Scripts
- `npm run start:backend` - Start backend only
- `npm run start:frontend` - Start frontend only
- `npm start` - Start both concurrently

## License
MIT 