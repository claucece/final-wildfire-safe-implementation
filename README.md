# Welcome to WildFire Safe!

![Wildfire Safe Icon](https://github.com/claucece/final-wildfire-safe-implementation/blob/main/assets/icon.png)

## Get started

In order to build the app, you will need to:

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```
   
> [!IMPORTANT]
> You will also need an `.env` file with credentials. Instructions and credentials are found in a document shared on the first page of the final report.

In the output, you'll find options to open the app in a:

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You should chose:

```
s: switch to Expo Go
chose the platform
```

## Testing

In order to test, run:

```
npm run test
```

Note that this uses `jest`.

## Linting

In order to diagnose issues in the project, run:

```
npx expo-doctor
```

In order to check the dependencies used:

```
npx expo install --check
```

To check any unused dependencies, you can (not completely accurate):

```
npm install depcheck -g
depcheck
```

To perform general lint:

```
npx expo lint
```

## Performance

In order to analyse bundle performance, you can:

```
EXPO_UNSTABLE_ATLAS=true npx expo start
npx expo-atlas .expo/atlas.jsonl
```

## Deployment considerations

In order to compress some of the media, one can:

```
npx expo-optimize
```

## Locally building

In order to build locally, one can run:

```
eas build --profile development-simulator --platform ios
```

Once it builds, one can run (and chose the latest version):

```
eas build:run -p ios
```

One can also build with `expo go`.

# Project Structure

- **`app/`** → Contains all app screens and navigation logic:
  - **`_layout.tsx`** → Defines the overall layout and navigation structure.
  - **`index.tsx`** → The entry screen (Home screen with prepare tasks).
  - **`firebaseConfig.ts`** → Configuration file for Firebase integration.
  - **`auth/`** → Contains authentication screens (login, signup, logout).
  - **`info/`** → Holds the about and privacy policy screen.
  - **`(tabs)/`** → Contains screens managed within the tab navigation system.
- **`components/`** → Houses reusable UI elements (e.g., buttons).
- **`constants/`** → Stores global configuration values like API URLs, data and color themes.
- **`context/`** → Implements React Context for global state management.
- **`hooks/`** → Custom React hooks to encapsulate logic and reusability.
- **`styles/`** → Contains global CSS styles.
- **`scripts/`** → Includes automation scripts (e.g., setup, deployment).
- **`coverage/`** → Generated reports from code coverage tools.
- **`debug/`** → Temporary debugging logs or profiling outputs.
- **`utils/`** → Utils functions.

# See it in your device

To see it in iOS or Android:
<img width="478" height="648" alt="Screenshot 2026-03-23 at 13 40 19" src="https://github.com/user-attachments/assets/e0faf2f8-aa6f-4b0a-aa16-6a68eaefd721" />

