export const createTablesSQL = `
-- Events table (UIR JSON + fingerprints)
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  fingerprint_structural TEXT NOT NULL,
  fingerprint_contextual TEXT NOT NULL,
  fingerprint_system TEXT NOT NULL,
  uir_json TEXT NOT NULL,
  ingested_at INTEGER NOT NULL,
  language TEXT NOT NULL,
  error_type TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_fingerprint_system ON events(fingerprint_system);
CREATE INDEX IF NOT EXISTS idx_events_ingested_at ON events(ingested_at);
CREATE INDEX IF NOT EXISTS idx_events_error_type ON events(error_type);

-- Fingerprints table (deduplication metadata)
CREATE TABLE IF NOT EXISTS fingerprints (
  fingerprint TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  resolved BOOLEAN DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_fingerprints_last_seen ON fingerprints(last_seen);
CREATE INDEX IF NOT EXISTS idx_fingerprints_resolved ON fingerprints(resolved);
`;