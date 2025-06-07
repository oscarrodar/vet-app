# Mobile Frontend (Expo + React Native + TypeScript)

This package contains the mobile frontend for the Vet Appointment Management System, built with Expo.

## Prerequisites

- Node.js (version specified in root, ideally >=18)
- npm or yarn
- Expo CLI (or use `npx expo-cli`)
  ```bash
  npm install -g expo-cli
  ```
- A mobile device with the Expo Go app, or an Android/iOS emulator/simulator.

## Setup

1.  Navigate to this directory from the project root:
    ```bash
    cd packages/mobile-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
    or if you prefer yarn:
    ```bash
    yarn install
    ```
    (If you encounter issues, ensure you are in the `packages/mobile-app` directory and try removing `node_modules` and `package-lock.json`/`yarn.lock` before reinstalling.)

## Running the Development Server (Expo Metro Bundler)

To start the Metro Bundler:

```bash
npm start
```
or
```bash
expo start
```

This will open a page in your web browser with a QR code.

-   **On your mobile device**: Open the Expo Go app and scan the QR code.
-   **On an emulator/simulator**: Follow the instructions provided by Expo CLI in the terminal (e.g., press `a` for Android emulator, `i` for iOS simulator).

The app will load on your device/emulator, and you can see live updates as you make changes to the code.

## Building for Production

For information on building standalone apps for the App Store or Google Play, please refer to the official Expo documentation on [Distribution](https://docs.expo.dev/distribution/introduction/). This typically involves using EAS Build.

## API Calls

This app will make calls to the backend API. Ensure the backend server is running and accessible. The API endpoint configuration will typically be managed in a dedicated constants or environment variable file within the app. (Note: Unlike web apps with `http-proxy-middleware` or Vite's proxy, React Native apps usually handle API base URLs explicitly in code or via environment variables managed by Expo's system).
