import { LockStatus } from '../types';
import { ChurchLogo } from './shared/ChurchLogo';
import { Button } from './shared/Button';

interface StatusScreenProps {
  status: LockStatus;
  onUnlock: () => void;
  onLock: () => void;
  onAddTime: () => void;
}

export function StatusScreen({ status, onUnlock, onLock, onAddTime }: StatusScreenProps) {
  const getTimeDisplay = (): string => {
    if (!status.unlockUntil) return '';

    const date = new Date(status.unlockUntil);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12

    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="screen">
      <div className="logo-section">
        <ChurchLogo />
      </div>

      <div className="content-section">
        <div className="status-content">
          <div className="status-text">
            <h1>Doors are</h1>
            <span className={`status-word ${status.locked ? 'locked' : 'unlocked'}`}>
              {status.locked ? 'LOCKED' : 'UNLOCKED'}
            </span>
          </div>

          {!status.locked && status.unlockedDoors && status.unlockUntil && (
            <div className="status-middle">
              <div className="unlock-info">
                <div className="door-names">
                  {status.unlockedDoors.join(', ')}
                </div>
                <div className="time-info">
                  until {getTimeDisplay()}
                </div>
              </div>

              <button className="add-time-link" onClick={onAddTime}>
                Add 15 minutes
              </button>
            </div>
          )}

          <div className="action-buttons">
            {status.locked ? (
              <Button label="Unlock" onClick={onUnlock} variant="unlock" />
            ) : (
              <Button label="Lock" onClick={onLock} variant="lock" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
