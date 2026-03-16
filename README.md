# SPBC Door Control

A touch-optimized web application for manually controlling door locks in the church building via the Unifi Access system. Designed to run on a wall-mounted tablet in kiosk mode.

## Running (Development)

```bash
docker compose up
# Visit http://localhost:5173
```

On first load you will be prompted to enter your Unifi Access API key. The key is stored in `localStorage` and persists across reloads.

## Building for Production

```bash
docker compose run --rm npm run build
# Output in dist/
```

## Configuration

### API Base URL

The Unifi Access controller URL is resolved in this priority order:

1. **User override** — value saved via the Advanced Settings field in the Setup screen (stored in `localStorage`)
2. **Build-time env var** — `VITE_API_BASE_URL` set before building
3. **Hardcoded default** — `https://172.28.0.1:12445`

To build targeting a different controller:

```bash
VITE_API_BASE_URL=https://10.0.0.5:12445 docker compose run --rm npm run build
```

Copy `.env.example` to `.env` to set a persistent local default:

```bash
cp .env.example .env
# Edit VITE_API_BASE_URL in .env
```

### API Key

The API key is never baked into the build. It is entered at runtime via the Setup screen and stored in `localStorage`. It is automatically cleared if the controller returns a 401/403.
