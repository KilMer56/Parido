# Parido Server

This is the server component for the Parido game.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3001
```

## Development

To run the server in development mode with hot reload:
```bash
npm run dev
```

## Production

To build and run the server in production:
```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev`: Run the server in development mode with hot reload
- `npm run build`: Build the TypeScript code
- `npm start`: Run the built server
- `npm run lint`: Run ESLint to check code quality 