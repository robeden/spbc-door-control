import { ChurchLogo } from './shared/ChurchLogo';
import { Button } from './shared/Button';

interface DurationSelectionScreenProps {
  selectedDuration: number;
  onDurationChange: (duration: number) => void;
  onUnlock: () => void;
  onCancel: () => void;
}

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
];

export function DurationSelectionScreen({
  selectedDuration,
  onDurationChange,
  onUnlock,
  onCancel
}: DurationSelectionScreenProps) {
  return (
    <div className="screen">
      <div className="logo-section">
        <ChurchLogo />
      </div>

      <div className="content-section with-spacing">
        <h1 className="selection-heading">How long?</h1>

        <div className="duration-list">
          {DURATION_OPTIONS.map(option => (
            <label key={option.value} className="duration-option">
              <input
                type="radio"
                name="duration"
                value={option.value}
                checked={selectedDuration === option.value}
                onChange={() => onDurationChange(option.value)}
              />
              <span className="duration-label">{option.label}</span>
            </label>
          ))}
        </div>

        <div className="action-buttons">
          <button className="cancel-link" onClick={onCancel}>
            Cancel
          </button>
          <Button label="Unlock" onClick={onUnlock} variant="unlock" />
        </div>
      </div>
    </div>
  );
}
