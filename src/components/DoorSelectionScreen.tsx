import { Door } from '../types';
import { ChurchLogo } from './shared/ChurchLogo';
import { Button } from './shared/Button';

interface DoorSelectionScreenProps {
  doors: Door[];
  selectedIds: string[];
  onSelectionChange: (doorIds: string[]) => void;
  onNext: () => void;
  onCancel: () => void;
}

export function DoorSelectionScreen({
  doors,
  selectedIds,
  onSelectionChange,
  onNext,
  onCancel
}: DoorSelectionScreenProps) {
  const handleToggle = (doorId: string) => {
    if (selectedIds.includes(doorId)) {
      onSelectionChange(selectedIds.filter(id => id !== doorId));
    } else {
      onSelectionChange([...selectedIds, doorId]);
    }
  };

  const formatDoorName = (name: string): string => {
    // Remove " Door" suffix if present
    return name.endsWith(' Door') ? name.slice(0, -5) : name;
  };

  return (
    <div className="screen">
      <div className="logo-section">
        <ChurchLogo />
      </div>

      <div className="content-section with-spacing">
        <h1 className="selection-heading">Which doors?</h1>

        <div className="door-list">
          {doors.map(door => (
            <label key={door.id} className="door-checkbox">
              <input
                type="checkbox"
                checked={selectedIds.includes(door.id)}
                onChange={() => handleToggle(door.id)}
              />
              <span className="door-name">{formatDoorName(door.name)}</span>
            </label>
          ))}
        </div>

        <div className="action-buttons">
          <button className="cancel-link" onClick={onCancel}>
            Cancel
          </button>
          <Button
            label="Next ›"
            onClick={onNext}
            variant="next"
            disabled={selectedIds.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
