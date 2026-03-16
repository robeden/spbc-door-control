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

The application follows a UI-first development approach:
1. Build UI with stubbed API service class
2. Implement real Unifi Access API integration later


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

**Phase 7: Real API Integration - READY TO BEGIN**
- Will require VPN connection to 172.28.0.1
- CORS not expected to be an issue (client-side only app on local network)
- API key managed via localStorage (enter once on setup)
- Need to replace stubbed methods in `src/services/UnifiAccessService.ts` with real API calls
- Helper method `makeApiRequest()` already implemented with auth error handling

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
- **Mock doors**: Main Door, Sanctuary Door, Rear Door, Kitchen Door
- **Real API integration**: Door data will come from Unifi Access `/doors` endpoint
- **Door ID '1'**: Hardcoded as Main Door for default selection (update when real API integrated)

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

### Real API Integration (Phase 7) - Next Priority
When ready to connect to real Unifi Access hardware:

1. **Connect to VPN** to access 172.28.0.1
2. **Test API key** manually with curl to verify access
3. **Update UnifiAccessService.ts**:
   - Replace `getDoors()` with real API call to `/api/v1/developer/doors`
   - Map API response to Door[] format
   - Replace `unlock()` to call `/api/v1/developer/doors/{id}/lock_rule` for each door
   - Implement `lock()` (may need to query current unlock rules and clear them)
   - Implement `getLockStatus()` by querying door states
   - Determine real door ID for "Main Door" to update default selection
4. **Handle potential issues**:
   - CORS: If blocked, can disable in kiosk browser with `--disable-web-security`
   - SSL: Using `--insecure` flag is acceptable for local network
   - Error handling: Already implemented for auth errors (401/403)
5. **Test with physical doors**:
   - Verify unlock operations work correctly
   - Test lock operations
   - Verify countdown timer accuracy
   - Test "Add 15 minutes" functionality

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
│   │   └── UnifiAccessService.ts       # API service (currently stubbed)
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

## Important Notes

- Always update the CLAUDE.md file following all decisions and important guidance and whenever progress is made in the plan.
- API key file (`api.key`) is in .gitignore - never commit it to version control
- Mock data configured to match expected real data from Unifi Access
- Development server runs on port 5173 via Docker
- All styling in single App.css file for simplicity