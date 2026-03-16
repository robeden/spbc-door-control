import { useState } from 'react';
import { ChurchLogo } from './shared/ChurchLogo';
import { Button } from './shared/Button';

interface SetupScreenProps {
  onSave: (apiKey: string, baseUrl: string) => void;
  defaultBaseUrl?: string;
}

export function SetupScreen({ onSave, defaultBaseUrl = 'https://172.28.0.1:12445' }: SetupScreenProps) {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSave(apiKey.trim(), baseUrl.trim());
    }
  };

  return (
    <div className="screen">
      <div className="logo-section">
        <ChurchLogo />
      </div>

      <div className="content-section with-spacing">
        <div className="setup-container">
          <h1>Setup Required</h1>
          <p className="setup-description">
            Enter your Unifi Access API key to continue.
          </p>

          <form onSubmit={handleSubmit} className="setup-form">
            <div className="form-group">
              <label htmlFor="apiKey">API Key</label>
              <input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API key"
                autoFocus
                required
              />
            </div>

            <button
              type="button"
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '▼' : '▶'} Advanced Settings
            </button>

            {showAdvanced && (
              <div className="form-group">
                <label htmlFor="baseUrl">API Base URL</label>
                <input
                  id="baseUrl"
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://172.28.0.1:12445"
                  required
                />
              </div>
            )}

            <div className="action-buttons">
              <Button
                label="Save"
                onClick={() => {}}
                variant="unlock"
                disabled={!apiKey.trim()}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
