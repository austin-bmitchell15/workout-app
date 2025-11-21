# Workout Tracker

A mobile application to track your workouts, built with React Native and Expo.

## Features

- User authentication (Sign up, Sign in)
- Log workouts with exercises and sets
- View workout history
- Create and manage workout templates

## Technologies

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Supabase](https://supabase.io/) for backend and authentication
- [React Navigation](https://reactnavigation.org/) for navigation
- [TypeScript](https://www.typescriptlang.org/)

## Project Structure

The project is organized into the following directories:

- `src/app`: Contains the main application logic, including screens and navigation.
- `src/components`: Contains reusable components used throughout the application.
- `src/constants`: Contains constants such as theme colors.
- `src/services`: Contains services, such as the Supabase client.
- `assets`: Contains static assets such as images and fonts.

## Get started

1.  Install dependencies

    ```bash
    npm install
    ```

2.  Set up your environment variables. Create a `.env` file in the root of the project and add the following:

    ```
    EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

3.  Start the app

    ```bash
    npx expo start
    ```

## Running Tests

To run the unit tests, use the following command:

```bash
npm test
```
