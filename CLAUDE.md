## Quick Reference

**Current Status:** ✅ Tested and working with real hardware

**Start Development Server:**
```bash
docker compose up
# Visit http://localhost:5173
```

**Test API Connectivity (requires VPN):**
```bash
# List doors
curl -k https://172.28.0.1:12445/api/v1/developer/doors \
  -H "Authorization: Bearer $(cat api.key)"

# Unlock a door for 2 minutes
curl -k -X PUT https://172.28.0.1:12445/api/v1/developer/doors/{id}/lock_rule \
  -H "Authorization: Bearer $(cat api.key)" \
  -H "Content-Type: application/json" \
  -d '{"type": "custom", "interval": 2}'
```

**Key Files:**
- `src/services/UnifiAccessService.ts` - Real API implementation (all 5 methods)
- `src/App.tsx` - Main wizard flow logic
- `src/App.css` - All styling
- `api.key` - API token (gitignored, in localStorage when running)

---

## Project Overview

This project is a client-side web application that implements manual control of door 
locks. The application allows manually locking and unlocking doors in a church building.
When unlocking it allows for selection of which doors will be unlocked and for how long.

The application will be used on a tablet mounted on the wall in a "kiosk" mode. It should
be optimized for touch operation and assume the URL bar is never used.

Functionality includes:
 - Reporting the current lock status and during of unlock, if applicable.
 - Lock, if unlocked.
 - Unlock, if locked. When unlocking, the doors to unlock and unlock duration are
   selectable. This process is performed in a wizard-like flow.
 - When unlocked, 15 minutes can be added to the duration.


## Tech Stack

 - **Frontend Framework**: React with TypeScript
 - **Build Tool**: Vite
 - **Development**: Docker containers for Node/NPM tooling

Development approach used:
1. ✅ Built UI with stubbed API service class
2. ✅ Implemented real Unifi Access API integration
3. ✅ Tested with real hardware — fully working


## Development Setup

Docker containers should be used for dev tools such as NPM so that installing software on
the host system is not necessary.


## Important Context

### Unifi Access

The system controls locks using the Unifi Access system from Ubiquiti. Calls should be
made via the REST API documented in `api_reference.pdf` or
[here on the internet](https://assets.identity.ui.com/unifi-access/api_reference.pdf). 
Some useful command examples are:

List doors:
```
curl --silent --insecure https://172.28.0.1:12445/api/v1/developer/doors -H "Accept: application/json" -H "Authorization: Bearer {token}"
```

Unlock for 2 minutes:
```
curl --silent --insecure -X PUT https://172.28.0.1:12445/api/v1/developer/doors/64ded900-3dfe-4b49-b002-428972422c65/lock_rule -H "Accept: application/json" -H "Authorization: Bearer {token}" -H "content-type: application/json" --data '{"type": "custom", "interval": 2}'
```

In order to communicate with this environment, VPN must be connected. If you are unable
to communicate with 172.28.0.1, you will need to ask me to connect to the VPN.


## Implementation Status

**Phase 1: Project Setup - COMPLETED**
- Vite React TypeScript project initialized
- Docker development environment configured
- Dependencies installed

**Phase 2-6: UI Implementation - COMPLETED & TESTED ✓**
- TypeScript type definitions created (Door, LockStatus, UnlockRequest)
- Stubbed UnifiAccessService implemented with in-memory state
- Shared components created (Button, ChurchLogo, ConfirmDialog)
- Screen components created (StatusScreen, DoorSelectionScreen, DurationSelectionScreen)
- Main App logic implemented with wizard flow state management
- Touch-friendly CSS styling applied
- Full wizard flow tested and working (Lock → Unlock → Door Select → Duration → Status)
- Countdown timer and "Add 15 minutes" functionality verified

**Phase 2.1: UI/UX Refinements - COMPLETED ✓**
- Redesigned layout for landscape tablet (1180x820): Logo left (40%), content right (60%)
- Removed centered card layout, now uses full screen
- Updated status screen to match wireframes:
  - Removed colored status indicator boxes
  - Shows door names as inline comma-separated text
  - Changed countdown timer to "until HH:MM AM/PM" format (12-hour notation)
  - Cleaner, minimal design
- Refined door and duration selection screens:
  - Simplified checkbox/radio button styling
  - Changed Cancel from text link to solid red button
  - Added "Next ›" arrow to Next button
- Added loading states with overlay spinner during API calls
- Added error handling with user-friendly error messages
- Added confirmation dialog for Lock action to prevent accidental locking
- Responsive design: Switches to vertical layout on portrait or smaller screens

**Phase 2.2: Final UI Polish - COMPLETED ✓**
- Adjusted logo positioning: doubled distance from left edge (80px padding-left)
- Changed time display to 12-hour format with AM/PM
- Moved checkboxes 175px to the right for better visual alignment
- Updated button styling to solid colors:
  - Unlock/Next buttons: Green (#349861) with white text
  - Lock/Cancel buttons: Red (#b12834) with white text
  - Disabled state: Gray with reduced opacity
- Styled "Add 15 minutes" link: Blue (#35729e), bold, no underline

**Phase 2.3: Layout Alignment Refinements - COMPLETED ✓**
- Status screen layout aligned with logo edges:
  - "Doors are LOCKED/UNLOCKED" text aligned near top of logo (90px vertical padding)
  - "Unlock"/"Lock" button aligned near bottom of logo (90px vertical padding)
  - Middle components (door names, time, add time link) distributed between
- Moved radio buttons 175px to the right to match checkbox positioning
- Changed checkbox and radio button accent color to #35729e (matching link blue)
- Aligned "Which doors?" and "How long?" headers with left edge of checkboxes/radio buttons

**Phase 2.4: Additional UI Polish & Data Configuration - COMPLETED ✓**
- Changed Cancel button in unlock workflow to outlined style:
  - White background with red (#b12834) border and text
  - Maintains consistency while reducing visual weight
- Updated mock door data to match real system:
  - Main Door, Sanctuary Door, Rear Door, Kitchen Door
  - Door names stored with " Door" suffix but displayed without it in checkboxes
  - Example: "Main Door" displays as just "Main" in UI
- Main Door pre-selected by default when starting unlock workflow
- Changed default unlock duration from 15 minutes to 1 hour
- Enhanced .gitignore to exclude api.key and other sensitive files
- Background status polling optimized:
  - Polls every 15 seconds (reduced from 5 seconds)
  - Only polls when on status screen (pauses during wizard flow)
  - Updates silently without loading indicators

**Phase 6: API Key Management - COMPLETED ✓**
- Implemented localStorage-based API key storage
- Created SetupScreen for initial API key entry
- Added authentication error detection and re-auth flow
- API key persists across page reloads (stored in localStorage)
- Auto-clears and re-prompts for API key on 401/403 errors
- Added AuthenticationError custom error class
- Included optional advanced settings (base URL configuration)

**Phase 7: Real API Integration - COMPLETED & TESTED ✓**
- Replaced all 5 stubbed methods in UnifiAccessService.ts with real API calls:
  - `getDoors()`: GET /api/v1/developer/doors
  - `unlock()`: PUT /api/v1/developer/doors/{id}/lock_rule with type="custom"
  - `lock()`: Queries each door's rule type, then uses type="reset" (custom rules) or type="lock_early" (keep_unlock/schedule rules)
  - `getLockStatus()`: GET /api/v1/developer/doors/{id}/lock_rule for each door
  - `addTime()`: Calculates remaining time and re-applies unlock rule with extended duration
- Removed all stubbed state (locked, unlockedDoorIds, unlockUntil, doors array)
- All data now comes from real Unifi Access API
- Tested with real hardware — all operations confirmed working
- UI components unchanged - contract maintained via TypeScript interfaces

**Phase 8: Hardware Testing & Bug Fixes - COMPLETED ✓**
- Discovered API response format: all responses wrapped in `{code, data, msg}`
- Confirmed expiration field is `ended_time` (epoch seconds), not `expires_at`
- Confirmed locked state: `type: ""`, `ended_time: 0`
- Confirmed `lock_early` fails (CODE_SYSTEM_ERROR) for custom rules; use `type: "reset"` instead
- Confirmed `keep_unlock` type exists for schedule-based unlocks — requires `lock_early` to cancel
- Fixed default door pre-selection to match by name ("Main Door") instead of hardcoded ID
- Added error details to auth failure redirects
- Added "Clear API Key" recovery link on error screen
- Added "Test" link in setup advanced settings for API connectivity verification
- Confirmed 3 active doors: Main Door, Kitchen Door, Rear Door (Rear has keep_unlock schedule)

**Phase 9: Production Deployment & Polish - COMPLETED ✓**
- GitHub Pages deployment via GitHub Actions (pushes to main auto-deploy)
  - Live URL: `https://robeden.github.io/spbc-door-control/`
  - Vite base path set to `/spbc-door-control/`
  - ChurchLogo uses module import (not absolute path) so Vite resolves it correctly
- PWA support for Safari "Add to Home Screen":
  - `public/manifest.json` with standalone display mode
  - `public/icon-512.png` (512×512 stained glass window icon, white background)
  - iOS meta tags: apple-touch-icon, apple-mobile-web-app-capable, apple-mobile-web-app-title
- CORS confirmed working from cross-origin host (comet.local → 172.28.0.1); GitHub Pages works
- Added `cert/` to `.gitignore` to protect private key from accidental commits
- UI: increased font and button sizes ~15-20% across the board
- UI: lock confirmation dialog simplified — removed redundant "Are you sure?" sentence
- Error handling: network load failure message now includes "Ensure the site certificate is trusted."
  with a tappable link to the API base URL to allow easy cert acceptance

---

## 🎯 Current Project Status

**✅ COMPLETE & WORKING** - Tested with real hardware, all features confirmed

**What's Working:**
- Full UI with wizard flow (Status → Unlock → Door Selection → Duration → Back to Status)
- Real API integration with all 5 service methods confirmed working
- API key management with localStorage persistence and auto re-auth
- Loading states, error handling, confirmation dialogs
- Background status polling (every 15 seconds)
- Touch-optimized tablet layout with responsive design
- Lock/unlock of physical doors confirmed
- "Add 15 minutes" functionality confirmed
- Error recovery: "Clear API Key" link on error screen
- Deployed to GitHub Pages: `https://robeden.github.io/spbc-door-control/`
- PWA-ready for Safari "Add to Home Screen" with custom icon

**What's Next:**
- Install on iPad: open `https://robeden.github.io/spbc-door-control/` in Safari → Share → Add to Home Screen
- Enable Guided Access on iPad for kiosk mode
- Trust the Unifi controller certificate in iPad Settings (see Troubleshooting)

**Confirmed API Facts:**
- All responses wrapped in `{code, data, msg}` — extract `.data`
- Expiration field: `ended_time` (Unix epoch seconds, multiply by 1000 for JS Date)
- Locked state: `type: ""`, `ended_time: 0`
- Our unlock rule: `type: "custom"` — cancel with `type: "reset"`
- Schedule unlock: `type: "keep_unlock"` — cancel with `type: "lock_early"`
- Active doors: Main Door, Kitchen Door, Rear Door (Rear has permanent keep_unlock schedule)
- CORS: not an issue on local network ✓

## Architecture & Design

### Application Architecture

**Component Hierarchy:**
```
App.tsx (main state & wizard flow)
├── SetupScreen (API key entry)
├── StatusScreen (locked/unlocked status)
├── DoorSelectionScreen (multi-select doors)
├── DurationSelectionScreen (select unlock time)
└── Shared Components
    ├── Button (reusable button)
    ├── ChurchLogo (logo display)
    └── ConfirmDialog (modal confirmation)
```

**State Management:**
- Single App.tsx component manages all wizard flow state
- No external state management library (React useState only)
- Service layer (UnifiAccessService) is stateless singleton
- API key stored in localStorage, loaded on service initialization

**Data Flow:**
```
User Action → App.tsx Handler → UnifiAccessService Method → Unifi Access API
                                                              ↓
User sees result ← App.tsx updates state ← Promise resolves ← API Response
```

**Error Handling:**
- `makeApiRequest()` helper catches HTTP errors
- 401/403 → throws `AuthenticationError` → clears API key → shows setup screen
- Other errors → throws generic `Error` → shows error message to user
- Network errors caught in try/catch blocks in App.tsx

**Polling Mechanism:**
- useEffect in App.tsx sets up 15-second interval
- Only polls when on status screen (pauses during wizard flow)
- Silent updates (no loading spinner during polls)
- Clears interval on unmount or screen change

## Design Decisions

### Security & Authentication
- **API Key Management**: localStorage-based storage (Option 2 from security analysis)
  - Rationale: Simple, no rebuild required for key rotation, persists across reloads
  - Auto-clears on auth errors (401/403) and re-prompts for key
  - Acceptable risk: API is network-isolated (VPN required), physical security of tablet
- **No proxy server needed**: Direct API calls from browser
  - Network isolation provides security layer
  - CORS not expected to be configured on Unifi Access
  - If CORS issues arise, can disable in kiosk browser mode
- **No user authentication**: Physical access to tablet is the security boundary
  - Confirmation dialog prevents accidental lock operations
  - Future enhancement: could add PIN code if needed

### UI/UX Design Choices
- **Landscape tablet layout**: 40% logo / 60% content split optimized for 1180x820 (iPad landscape)
- **Color scheme**:
  - Green (#349861): Unlock/Next actions
  - Red (#b12834): Lock/Cancel actions
  - Blue (#35729e): Links and interactive elements (checkboxes, radio buttons)
- **12-hour time format**: More user-friendly than 24-hour
- **Door name display**: Remove " Door" suffix in UI for cleaner appearance
- **Default selections**: Main Door pre-selected, 1 hour default duration
- **Status screen alignment**: Content vertically distributed between logo edges for balanced appearance

### Data Configuration
- **Door data source**: Real-time from Unifi Access API (`GET /api/v1/developer/doors`)
- **Active doors**: Main Door, Kitchen Door, Rear Door (3 doors; Rear has permanent keep_unlock schedule)
- **Default selection**: Matches door named "Main Door" by name; falls back to first door if not found
- **Door name display**: Names with " Door" suffix display without suffix in UI checkboxes
- **Default unlock duration**: 1 hour (60 minutes)

## Running the Application

Start the development server:
```bash
docker compose up
```

Visit: http://localhost:5173

To run npm commands:
```bash
docker compose run --rm npm <command>
```

## Next Steps

### Production Deployment

Deployment is via GitHub Pages — push to `main` triggers an automatic build and deploy.

**Live URL:** `https://robeden.github.io/spbc-door-control/`

**iPad Setup:**
1. Connect iPad to VPN
2. Open `https://robeden.github.io/spbc-door-control/` in Safari
3. Trust the Unifi controller certificate:
   - Tap the "site certificate" link in the error message, or navigate to `https://172.28.0.1:12445` directly
   - Accept the certificate warning in Safari
   - Permanently trust it: Settings → General → About → Certificate Trust Settings → enable the certificate
4. Return to the app and enter the API key via the Setup screen
5. Add to Home Screen: Share → Add to Home Screen
6. Enable Guided Access for kiosk mode

**Local build (if needed):**
```bash
docker compose run --rm npm run build
# Output in dist/
```

### Future Enhancements (Optional)
- Add audit logging of all door operations
- Add smooth screen transitions/animations
- Add session timeout (auto-return to status screen after inactivity)
- Add PIN code authentication if physical security is insufficient
- Add rate limiting on lock/unlock operations
- Test and optimize on actual iPad hardware

## File Structure

```
spbc-door-control/
├── src/
│   ├── components/
│   │   ├── StatusScreen.tsx           # Lock/unlock status display
│   │   ├── DoorSelectionScreen.tsx    # Multi-select doors
│   │   ├── DurationSelectionScreen.tsx # Select unlock duration
│   │   ├── SetupScreen.tsx            # API key entry
│   │   └── shared/
│   │       ├── Button.tsx              # Reusable button component
│   │       ├── ChurchLogo.tsx          # Logo display
│   │       └── ConfirmDialog.tsx       # Confirmation modal
│   ├── services/
│   │   └── UnifiAccessService.ts       # API service (real implementation)
│   ├── types/
│   │   └── index.ts                    # TypeScript interfaces
│   ├── App.tsx                         # Main app with wizard logic
│   ├── App.css                         # All styling
│   ├── main.tsx                        # Vite entry point
│   └── vite-env.d.ts                   # Vite types
├── public/
│   ├── logo.png                        # Church logo (used in app UI)
│   ├── icon-512.png                    # PWA/home screen icon (512×512)
│   └── manifest.json                   # Web app manifest for PWA support
├── wireframes/                         # UI mockups (reference)
├── api.key                             # API token (in .gitignore)
├── api_reference.pdf                   # Unifi Access API docs
├── index.html                          # HTML entry point
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript config
├── vite.config.ts                      # Vite config
├── Dockerfile                          # Node dev container
├── .github/
│   └── workflows/
│       └── deploy.yml                  # GitHub Actions: build & deploy to Pages
├── docker-compose.yml                  # Dev environment
├── .gitignore                          # Git exclusions (includes api.key, cert/)
└── CLAUDE.md                           # This file
```

## Troubleshooting

### Common Issues

**"Load failed" / Certificate Error:**
- Browser fetch is blocked by the Unifi controller's self-signed certificate
- Tap the "site certificate" link in the error message to open the controller URL in Safari
- Accept the certificate warning, then reload the app
- For permanent trust on iPad: Settings → General → About → Certificate Trust Settings → enable the cert
- Alternatively, install the cert from the `cert/` directory via AirDrop/email and enable it in Settings

**API Connection Errors / Stuck on Setup Screen:**
- Check VPN is connected (required to access 172.28.0.1)
- Use the "Test" link in Advanced Settings to verify API connectivity
- Use the "Clear API Key" link on the error screen to re-enter credentials
- Auth errors (401) include the failed URL for diagnosis
- Verify the API key matches the one in `api.key`

**Lock Button Not Working:**
- `lock()` queries each door's current rule type before locking
- Custom rules (we set): cancelled with `type: "reset"`
- Schedule rules (keep_unlock): cancelled with `type: "lock_early"`
- `lock_early` fails with CODE_SYSTEM_ERROR if used on custom rules — don't use it for those

**Status Shows Wrong State:**
- Only `type: "custom"` rules are tracked as "unlocked by us"
- `type: "keep_unlock"` (Rear Door schedule) is intentionally ignored by getLockStatus()
- Expiration is `ended_time` field (Unix epoch seconds)

### Debugging Tips

**View API Responses:**
- Open browser DevTools → Network tab
- Filter by "developer" to see Unifi API calls
- Inspect response bodies to verify field names

**Test Individual Methods:**
- Can test service methods directly from browser console:
  ```javascript
  import { unifiAccessService } from './src/services/UnifiAccessService'
  await unifiAccessService.getDoors()
  ```

**Check localStorage:**
- Browser DevTools → Application → Local Storage
- Look for `unifi_api_key` and `unifi_api_base_url`
- Can manually clear to trigger setup screen again

## API Implementation Details

### Unifi Access API Integration

All service methods in `UnifiAccessService.ts` use real API calls via the `makeApiRequest()` helper:

**getDoors()** - Fetches door list
- Endpoint: `GET /api/v1/developer/doors`
- Returns: Array of door objects with `id` and `name` fields
- Maps to `Door[]` interface

**unlock(request)** - Unlocks selected doors temporarily
- Endpoint: `PUT /api/v1/developer/doors/{id}/lock_rule` (for each door)
- Body: `{"type": "custom", "interval": {minutes}}`
- Uses `Promise.all()` for parallel execution

**lock()** - Locks doors based on their current rule type
- Endpoint: `GET` then `PUT /api/v1/developer/doors/{id}/lock_rule` (for each door)
- Queries each door's rule first, then sends appropriate type:
  - `type: "custom"` → lock with `{"type": "reset"}`
  - `type: "keep_unlock"` → lock with `{"type": "lock_early"}`
  - `type: ""` → already locked, skip
- Uses `Promise.all()` for parallel execution

**getLockStatus()** - Queries current lock state
- Endpoint: `GET /api/v1/developer/doors/{id}/lock_rule` (for each door)
- Only tracks `type: "custom"` rules (ones we set) — ignores keep_unlock/schedule rules
- Locked state: `type: ""` and `ended_time: 0`
- Expiration: `ended_time` field (Unix epoch seconds, converted to JS Date via × 1000)
- Returns earliest expiration time across all custom-unlocked doors

**addTime(minutes)** - Extends unlock duration
- Calculates remaining time from current status
- Adds requested minutes to remaining time
- Re-applies unlock rules with new total duration via `unlock()`

### API Service Patterns

**All methods follow these patterns:**

1. **Use makeApiRequest() helper** for all API calls
   - Automatic auth header injection
   - Automatic error detection (401/403 → AuthenticationError)
   - Consistent URL construction

2. **Parallel execution with Promise.all()**
   - `unlock()` unlocks multiple doors in parallel
   - `lock()` locks all doors in parallel
   - `getLockStatus()` queries all doors in parallel
   - Faster than sequential, atomic (all succeed or all fail)

3. **Graceful degradation**
   - Missing lock rules treated as "locked" (404 → not an error)
   - Errors in `getLockStatus()` caught per-door, assume locked

4. **Stateless service**
   - No in-memory state
   - All data comes from API
   - Fresh data on every call

5. **TypeScript contracts**
   - All methods maintain strict interface compliance
   - Return types match types/index.ts definitions
   - UI components unaware of implementation details

### Confirmed API Behaviour

All confirmed through live testing:

- **Response envelope**: All responses are `{code, data, msg}` — always extract `.data`
- **Expiration field**: `ended_time` (Unix epoch seconds) — multiply by 1000 for JS Date
- **Locked state**: `type: ""`, `ended_time: 0`
- **Our unlock rule**: `type: "custom"` with `interval` in minutes
- **Schedule unlock**: `type: "keep_unlock"` (e.g. Rear Door — always unlocked by schedule)
- **Cancelling custom rule**: `type: "reset"` ✓
- **Cancelling schedule rule**: `type: "lock_early"` ✓
- **`lock_early` on custom rule**: Returns CODE_SYSTEM_ERROR — do not use
- **CORS**: Not enforced — confirmed working from cross-origin host (comet.local) and GitHub Pages ✓

## Important Notes

- **Always update CLAUDE.md** following all decisions and important guidance and whenever progress is made
- **API key security**: `api.key` file is in .gitignore - never commit to version control
- **API key storage**: Stored in browser localStorage, auto-clears on auth errors (401/403)
- **VPN required**: Must be connected to VPN to access 172.28.0.1 for real API calls
- **Development server**: Runs on port 5173 via Docker (`docker compose up`)
- **All styling**: Single App.css file for simplicity
- **No stubbed data**: All door data and lock status comes from real API
- **Vite allowed hosts**: `comet.local` added to `vite.config.ts` for tablet access
- **Vite base path**: `/spbc-door-control/` set in `vite.config.ts` for GitHub Pages
- **Build-time config**: `VITE_API_BASE_URL` env var sets the default API host (falls back to `https://172.28.0.1:12445`)
- **cert/ directory**: gitignored — contains the Unifi controller's self-signed certificate files; never commit