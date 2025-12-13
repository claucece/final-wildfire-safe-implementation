# Welcome to WildFire Safe!

![image](https://github.com/claucece/final-wildfire-safe-implementation/app/assets/icon.png)

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
  - **`index.tsx`** → The entry screen (Home screen).
  - **`firebaseConfig.ts`** → Configuration file for Firebase integration.
  - **`auth/`** → Contains authentication screens (login, signup, logout).
  - **`info/`** → Holds the about screen.
  - **`(modal)/`** → Stores modal components for overlays and pop-ups.
  - **`(tabs)/`** → Contains screens managed within the tab navigation system.
- **`components/`** → Houses reusable UI elements (e.g., buttons).
- **`constants/`** → Stores global configuration values like API URLs, data and color themes.
- **`context/`** → Implements React Context for global state management.
- **`hooks/`** → Custom React hooks to encapsulate logic and reusability.
- **`styles/`** → Contains global CSS styles.
- **`scripts/`** → Includes automation scripts (e.g., setup, deployment).
- **`coverage/`** → Generated reports from code coverage tools.
- **`debug/`** → Temporary debugging logs or profiling outputs.

# See it in your device

To see it in iOS or Android (beware you are not in "silent mode", if you are disable it):
<img width="488" alt="Screenshot 2025-03-09 at 23 50 00" src="https://github.com/user-attachments/assets/039ca5ed-f651-4628-8cfc-5a14188d193a" />
