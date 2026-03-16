## Quick Reference

**Current Status:** ✅ Development complete, ready for hardware testing

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
3. ⏳ Testing with real hardware (current phase)


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

**Phase 7: Real API Integration - COMPLETED ✓**
- Replaced all 5 stubbed methods in UnifiAccessService.ts with real API calls:
  - `getDoors()`: GET /api/v1/developer/doors
  - `unlock()`: PUT /api/v1/developer/doors/{id}/lock_rule with type="custom"
  - `lock()`: PUT /api/v1/developer/doors/{id}/lock_rule with type="lock_early"
  - `getLockStatus()`: GET /api/v1/developer/doors/{id}/lock_rule for each door
  - `addTime()`: Calculates remaining time and re-applies unlock rule with extended duration
- Removed all stubbed state (locked, unlockedDoorIds, unlockUntil, doors array)
- All data now comes from real Unifi Access API
- Ready for testing with VPN connection to 172.28.0.1
- UI components unchanged - contract maintained via TypeScript interfaces

---

## 🎯 Current Project Status

**✅ DEVELOPMENT COMPLETE** - All phases finished, ready for testing with real hardware

**What's Working:**
- Full UI with wizard flow (Status → Unlock → Door Selection → Duration → Back to Status)
- Real API integration with all 5 service methods implemented
- API key management with localStorage persistence and auto re-auth
- Loading states, error handling, confirmation dialogs
- Background status polling (every 15 seconds)
- Touch-optimized tablet layout with responsive design

**What's Next:**
- Testing with real Unifi Access hardware (requires VPN connection)
- Verify API field names match assumptions (especially `expires_at`)
- Test physical door unlock/lock operations
- Fine-tune based on real-world behavior

**Known Unknowns:**
- Exact API response format (currently assumes `expires_at` field name)
- Whether CORS will be an issue (unlikely on local network)
- Whether self-signed SSL cert will cause issues (should work with fetch)
- Actual door ID for "Main Door" (currently hardcoded as '1' in App.tsx line 92)

**Testing Checklist:**
- [ ] Verify API connectivity with curl
- [ ] Confirm door list loads from API
- [ ] Check actual door IDs and update default selection if needed
- [ ] Test unlock operation on physical doors
- [ ] Test lock operation
- [ ] Verify countdown timer accuracy
- [ ] Test "Add 15 minutes" functionality
- [ ] Verify status polling updates correctly
- [ ] Test error handling (invalid API key, network errors)
- [ ] Confirm API field names match assumptions

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
- **Expected doors**: Main Door, Sanctuary Door, Rear Door, Kitchen Door (actual list determined by API)
- **Default selection**:
  - Currently hardcoded as door ID '1' in `App.tsx` line 92
  - ⚠️ May need update after testing to match actual "Main Door" ID from API
  - Could also be changed to match by name instead of ID
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

### Testing with Real Hardware - Next Priority
Now that API integration is complete, test with real Unifi Access system:

1. **Connect to VPN** to access 172.28.0.1
2. **Test API manually** to verify connectivity:
   ```bash
   curl -k https://172.28.0.1:12445/api/v1/developer/doors \
     -H "Authorization: Bearer {api_key}"
   ```
3. **Start development server**: `docker compose up`
4. **Enter API key** via setup screen on first load
5. **Verify door list loads** from real API
6. **Test full workflow**:
   - Verify doors unlock when requested
   - Verify physical doors actually unlock
   - Check countdown timer shows correct expiration time
   - Test "Add 15 minutes" functionality
   - Test "Lock" button locks all doors
   - Verify status polling updates every 15 seconds
7. **Handle potential issues**:
   - **CORS**: If blocked, may need to disable in browser or add proxy
   - **SSL certificates**: Self-signed cert should work with fetch()
   - **API field names**: May need to adjust if different than expected
   - **Lock rule response format**: Verify `expires_at` field name matches
8. **Fine-tune based on testing**:
   - Adjust field names if API response differs (currently assumes `expires_at`)
   - Verify "Main Door" ID for default selection
   - Test edge cases (network errors, expired tokens, etc.)

### Production Deployment
- Create production build: `docker compose run --rm npm run build`
- Deploy `dist/` folder to web server or serve locally
- Configure iPad in kiosk mode:
  - Use Guided Access or kiosk app (e.g., Kiosk Pro)
  - Set homepage to app URL
  - Disable sleep, auto-lock
  - Enable auto-reload on crash (if available)
- Enter API key via setup screen on first launch

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
│   └── logo.png                        # Church logo (from window_logo.png)
├── wireframes/                         # UI mockups (reference)
├── api.key                             # API token (in .gitignore)
├── api_reference.pdf                   # Unifi Access API docs
├── index.html                          # HTML entry point
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript config
├── vite.config.ts                      # Vite config
├── Dockerfile                          # Node dev container
├── docker-compose.yml                  # Dev environment
├── .gitignore                          # Git exclusions (includes api.key)
└── CLAUDE.md                           # This file
```

## Troubleshooting

### Common Issues During Testing

**API Connection Errors:**
- ✓ Check VPN is connected (required to access 172.28.0.1)
- ✓ Verify API key is correct (test with curl first)
- ✓ Check network connectivity to Unifi Access controller

**Field Name Mismatches:**
- If lock status shows incorrectly, check API response format
- Current code assumes `expires_at` (snake_case) for expiration timestamp
- May need to change to `expiresAt` (camelCase) depending on actual API response
- Use browser DevTools Network tab to inspect actual responses

**CORS Errors:**
- Unlikely on local network, but if they occur:
  - Option 1: Disable CORS in kiosk browser with `--disable-web-security` flag
  - Option 2: Add simple proxy server (not ideal, adds complexity)
- Unifi Access likely doesn't enforce CORS on local network

**Self-Signed SSL Certificate Issues:**
- Browser `fetch()` should handle self-signed certs
- If issues occur, can configure browser to accept cert
- In production, kiosk mode can disable cert warnings

**Doors Not Unlocking:**
- Verify door IDs are correct (check API response from GET /doors)
- Test unlock manually with curl first
- Check if `interval` field accepts minutes (confirmed in docs)
- Verify lock rule is created (check with GET /doors/{id}/lock_rule)

**Lock Button Not Working:**
- May need to adjust `lock()` implementation
- Current implementation uses `type: "lock_early"` for all doors
- If this doesn't work, try alternative approaches:
  - Delete lock rules with DELETE endpoint
  - Set interval to 0
  - Query actual door state to determine locked status

**Status Polling Shows Wrong State:**
- Check `getLockStatus()` logic for parsing lock rules
- Verify field names match actual API response
- May need to adjust how we detect "unlocked" state
- Check if 404 is actually returned for locked doors

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

**lock()** - Locks all doors (ends custom unlock early)
- Endpoint: `PUT /api/v1/developer/doors/{id}/lock_rule` (for each door)
- Body: `{"type": "lock_early"}`
- Uses `Promise.all()` for parallel execution

**getLockStatus()** - Queries current lock state
- Endpoint: `GET /api/v1/developer/doors/{id}/lock_rule` (for each door)
- Checks for active custom rules with `type: "custom"` and `expires_at` field
- Assumes 404 or missing rule means door is locked
- Returns earliest expiration time across all unlocked doors

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

### Known API Assumptions

These assumptions are based on API documentation and may need adjustment during testing:

- **Expiration field name**: Currently assumes `expires_at` (snake_case)
  - May need to change to `expiresAt` (camelCase) if API uses different format
- **Lock rule types**: Uses `"custom"` for temporary unlock, `"lock_early"` for locking
- **Missing rules**: Treats 404 or error responses as "door is locked"
- **Self-signed SSL**: Browser `fetch()` should handle self-signed certs without special config

## Important Notes

- **Always update CLAUDE.md** following all decisions and important guidance and whenever progress is made
- **API key security**: `api.key` file is in .gitignore - never commit to version control
- **API key storage**: Stored in browser localStorage, auto-clears on auth errors (401/403)
- **VPN required**: Must be connected to VPN to access 172.28.0.1 for real API calls
- **Development server**: Runs on port 5173 via Docker (`docker compose up`)
- **All styling**: Single App.css file for simplicity
- **No stubbed data**: All door data and lock status comes from real API