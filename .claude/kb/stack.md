# Stack & Toolchain

## Language & Runtime
- **TypeScript** ~5.9.2, strict mode enabled
- **Node** 20 (CI), Yarn package manager
- **React** 19.1.0 / **React Native** 0.81.5
- **Expo** ~54.0.22 (new architecture enabled, React Compiler enabled)

## Framework
- **expo-router** ~6.0.14 — file-based routing
  - Typed routes experiment: `true`
  - React Compiler experiment: `true`
- **@react-navigation** — bottom tabs, native stack, elements

## Backend
- **Supabase** @supabase/supabase-js ^2.79.0
  - Auth + PostgreSQL
  - AsyncStorage session persistence (native), localStorage (web)
  - Auto-refresh tokens, app-state listener for foreground/background

## Key Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| react-native-reanimated | ~4.1.1 | Animations (spring on exercise cards) |
| expo-haptics | ~15.0.7 | Haptic feedback on finish/cancel |
| @gorhom/bottom-sheet | ^5.2.6 | Bottom sheet modals |
| @react-native-async-storage/async-storage | ^2.2.0 | Session persistence |
| @expo/vector-icons | — | Icon components |

## Dev Toolchain
| Tool | Config File | Notes |
|------|------------|-------|
| ESLint | `eslint.config.js` | Flat config, eslint-config-expo + prettier |
| Prettier | `.prettierrc.json` | singleQuote, trailingComma all, semi |
| Husky | `.husky/` | Pre-commit hook runs lint-staged |
| lint-staged | `package.json` | Prettier → ESLint on `*.{js,jsx,ts,tsx}` |
| Babel | `babel.config.js` | babel-preset-expo + reanimated plugin |

## Environment Variables
File: `.env` (in .gitignore — do not commit)
```
EXPO_PUBLIC_SUPABASE_API_KEY=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_SECRET_KEY=sb_publishable_...
```
Test mocks (in `jest.setup.js`):
```js
process.env.EXPO_PUBLIC_SUPABASE_API_KEY = 'https://mock-url.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_SECRET_KEY = 'mock-key';
```

## TypeScript Config
- Extends `expo/tsconfig.base`
- Path alias: `@/*` → `./src/*`
- Includes: `expo-env.d.ts`, `.expo/types/**/*.ts`

## Prettier Rules (`.prettierrc.json`)
```json
{
  "arrowParens": "avoid",
  "bracketSameLine": true,
  "bracketSpacing": true,
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "endOfLine": "auto"
}
```
