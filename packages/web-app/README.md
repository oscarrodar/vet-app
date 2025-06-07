# Web Frontend (Vite + React + TypeScript)

This package contains the web frontend for the Vet Appointment Management System.

## Prerequisites

- Node.js (version specified in root, ideally >=18, though react-router-dom v7+ prefers Node 20. v6 was used for broader compatibility).
- npm

## Setup

1.  Navigate to this directory from the project root:
    ```bash
    cd packages/web-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
    (If you encounter issues, ensure you are in the `packages/web-app` directory and try removing `node_modules` and `package-lock.json` before reinstalling.)

## Running the Development Server

To start the development server (typically on `http://localhost:3001` as configured in `vite.config.ts`):

```bash
npm run dev
```

The application will open in your default web browser. The Vite server supports Hot Module Replacement (HMR).

## Building for Production

To create a production build:

```bash
npm run build
```

The production-ready files will be located in the `dist` directory.

## Linting

To run ESLint:

```bash
npm run lint
```

## API Proxy

The development server is configured to proxy API requests starting with `/api` to the backend server (assumed to be running on `http://localhost:3000`). This configuration can be found in `vite.config.ts`. Make sure your backend server is running when developing the frontend.
