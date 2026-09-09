# Repository guidance

Read [AGENTS.md](AGENTS.md) for coding conventions and validation requirements. Read
[docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md) before structural decisions and
[docs/grid.md](docs/grid.md) before layout changes.

The current application is implemented in feature modules for Auth, Dashboard, Video
Management, and RDI. Entry and provider composition live under `src/app/`; nested lazy
routing lives under `src/routes/`. Shared navigation and page layout are reused across features.

[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) documents ownership, import boundaries,
state flow, and current integration gaps. [README.md](README.md) covers setup and deployment.

Run `npm run check` after changes. It validates architecture boundaries, runs ESLint,
type-checks, and builds the app. Do not add dependencies without agreement or run database
installation scripts as part of frontend work.

`npm run test:smoke` checks routing, sessions, and the CMS editor against a running local
server with mocked API responses. See README for browser and server configuration.
