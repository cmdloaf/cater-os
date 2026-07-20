# Vero Mobile

Placeholder. Not yet initialised.

The mobile app is for staff working an event rather than for office users: the
day-of view of the Banquet Event Order, checklist completion, photo capture and
timestamped sign-offs — largely offline, in a venue with poor signal.

## Planned setup

- React Native via **Expo** (managed workflow)
- Expo Router, matching the file-based routing model already used by `apps/web`
- The same Supabase Auth session as the web app
- `@vero/shared` for types and enums, so the API contract is defined once

## When it is initialised

```bash
npx create-expo-app@latest apps/mobile --template
```

It joins the npm workspace automatically — the root `package.json` already
globs `apps/*`, so a `package.json` appearing here is enough. Nothing needs to
be registered by hand.

Do not start this before the API exists. The mobile client is a consumer of the
backend, and building it against a schema that is still moving costs more than
it saves.
