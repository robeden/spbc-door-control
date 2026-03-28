import { useState, useEffect } from 'react';
import { Door, LockStatus, AuthenticationError } from './types';
import { unifiAccessService } from './services/UnifiAccessService';
import { StatusScreen } from './components/StatusScreen';
import { DoorSelectionScreen } from './components/DoorSelectionScreen';
import { DurationSelectionScreen } from './components/DurationSelectionScreen';
import { SetupScreen } from './components/SetupScreen';
import { ConfirmDialog } from './components/shared/ConfirmDialog';

type Screen = 'status' | 'doorSelect' | 'duration';

function renderError(message: string, baseUrl: string) {
  const phrase = 'site certificate';
  const idx = message.indexOf(phrase);
  if (idx === -1) return message;
  return (
    <>
      {message.slice(0, idx)}
      <a href={baseUrl} target="_blank" rel="noreferrer">{phrase}</a>
      {message.slice(idx + phrase.length)}
    </>
  );
}

function App() {
  const [needsSetup, setNeedsSetup] = useState(!unifiAccessService.hasApiKey());
  const [screen, setScreen] = useState<Screen>('status');
  const [lockStatus, setLockStatus] = useState<LockStatus | null>(null);
  const [doors, setDoors] = useState<Door[]>([]);
  const [selectedDoorIds, setSelectedDoorIds] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLockConfirm, setShowLockConfirm] = useState(false);

  // Handle API key setup
  const handleSetupComplete = (apiKey: string, baseUrl: string) => {
    unifiAccessService.setApiKey(apiKey, baseUrl);
    setNeedsSetup(false);
    setError(null);
  };

  // Handle authentication errors
  const handleAuthError = (err?: unknown) => {
    unifiAccessService.clearApiKey();
    setNeedsSetup(true);
    setLockStatus(null);
    const detail = err instanceof Error ? err.message : null;
    setError(detail
      ? `Authentication failed: ${detail}`
      : 'Authentication failed. Please enter your API key again.'
    );
  };

  // Fetch initial data
  useEffect(() => {
    if (needsSetup) return;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [doorsData, statusData] = await Promise.all([
          unifiAccessService.getDoors(),
          unifiAccessService.getLockStatus()
        ]);
        setDoors(doorsData);
        setLockStatus(statusData);
        setError(null);
      } catch (err) {
        if (err instanceof AuthenticationError) {
          handleAuthError(err);
        } else {
          const message = err instanceof Error ? err.message : String(err);
          setError(`Failed to load door information: ${message}. Ensure the site certificate is trusted.`);
          console.error('Error loading initial data:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [needsSetup]);

  // Poll lock status every 15 seconds (only on status screen)
  useEffect(() => {
    if (needsSetup || screen !== 'status') return;

    const pollStatus = async () => {
      try {
        const status = await unifiAccessService.getLockStatus();
        setLockStatus(status);
      } catch (err) {
        if (err instanceof AuthenticationError) {
          handleAuthError(err);
        } else {
          console.error('Error polling status:', err);
          // Don't set error for polling failures, just log them
        }
      }
    };

    const interval = setInterval(pollStatus, 15000);
    return () => clearInterval(interval);
  }, [needsSetup, screen]);

  // Wizard flow handlers
  const handleStartUnlock = () => {
    const mainDoor = doors.find(d => d.name === 'Main Door') ?? doors[0];
    setSelectedDoorIds(mainDoor ? [mainDoor.id] : []);
    setSelectedDuration(60);
    setError(null);
    setScreen('doorSelect');
  };

  const handleDoorSelectionNext = () => {
    setScreen('duration');
  };

  const handleDurationUnlock = async () => {
    try {
      setLoading(true);
      setError(null);

      await unifiAccessService.unlock({
        doorIds: selectedDoorIds,
        durationMinutes: selectedDuration
      });

      const status = await unifiAccessService.getLockStatus();
      setLockStatus(status);
      setScreen('status');
    } catch (err) {
      if (err instanceof AuthenticationError) {
        handleAuthError(err);
      } else {
        setError('Failed to unlock doors. Please try again.');
        console.error('Error unlocking doors:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLockRequest = () => {
    setShowLockConfirm(true);
  };

  const handleLockConfirm = async () => {
    setShowLockConfirm(false);
    try {
      setLoading(true);
      setError(null);

      await unifiAccessService.lock();
      const status = await unifiAccessService.getLockStatus();
      setLockStatus(status);
    } catch (err) {
      if (err instanceof AuthenticationError) {
        handleAuthError(err);
      } else {
        setError('Failed to lock doors. Please try again.');
        console.error('Error locking doors:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLockCancel = () => {
    setShowLockConfirm(false);
  };

  const handleAddTime = async () => {
    try {
      setLoading(true);
      setError(null);

      await unifiAccessService.addTime(15);
      const status = await unifiAccessService.getLockStatus();
      setLockStatus(status);
    } catch (err) {
      if (err instanceof AuthenticationError) {
        handleAuthError(err);
      } else {
        setError('Failed to add time. Please try again.');
        console.error('Error adding time:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setScreen('status');
  };

  // Show setup screen if API key is not configured
  if (needsSetup) {
    return (
      <div className="app">
        <SetupScreen
          onSave={handleSetupComplete}
          defaultBaseUrl={unifiAccessService.getBaseUrl()}
          authError={error}
        />
      </div>
    );
  }

  if (!lockStatus) {
    return (
      <div className="app loading">
        {error ? (
          <>
            <p className="error-message">{renderError(error, unifiAccessService.getBaseUrl())}</p>
            <button className="link-button" onClick={handleAuthError}>Clear API Key</button>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      {screen === 'status' && (
        <StatusScreen
          status={lockStatus}
          onUnlock={handleStartUnlock}
          onLock={handleLockRequest}
          onAddTime={handleAddTime}
        />
      )}

      {screen === 'doorSelect' && (
        <DoorSelectionScreen
          doors={doors}
          selectedIds={selectedDoorIds}
          onSelectionChange={setSelectedDoorIds}
          onNext={handleDoorSelectionNext}
          onCancel={handleCancel}
        />
      )}

      {screen === 'duration' && (
        <DurationSelectionScreen
          selectedDuration={selectedDuration}
          onDurationChange={setSelectedDuration}
          onUnlock={handleDurationUnlock}
          onCancel={handleCancel}
        />
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">One moment...</div>
        </div>
      )}

      {error && screen === 'status' && (
        <div className="error-message">{renderError(error, unifiAccessService.getBaseUrl())}</div>
      )}

      {showLockConfirm && (
        <ConfirmDialog
          title="Lock All Doors?"
          message="This will immediately secure all unlocked doors."
          onConfirm={handleLockConfirm}
          onCancel={handleLockCancel}
        />
      )}
    </div>
  );
}

export default App;
