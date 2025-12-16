CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT
);

INSERT INTO settings (key, value) VALUES ('registration_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
