# Graduation Gateway

A unified Graduation Clearance System with React frontend and Express backend.

## Structure

- `src/`: React frontend source code
- `server/`: Express backend source code
- `public/`: Static assets for the frontend
- `dist/`: Build artifacts (after running `npm run build`)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or via URI)

### Installation

```sh
npm install
```

### Development

To run both the frontend and backend in development mode with hot-reload:

```sh
npm run dev
```

The frontend will be available at `http://localhost:8080` and will proxy API requests to `http://localhost:4000`.

### Production

To build and run the project in production mode:

```sh
npm run build
npm start
```

The application will be served from `http://localhost:4000`.

## Scripts

- `npm run dev`: Start both frontend and backend in development mode
- `npm run build`: Build both frontend and backend for production
- `npm start`: Start the production server
- `npm test`: Run vitest for frontend
- `npm run lint`: Run ESLint for the project
