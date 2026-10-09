CREATE TABLE IF NOT EXISTS sites (
  site_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS site_origins (
  site_id TEXT NOT NULL,
  origin TEXT NOT NULL,
  PRIMARY KEY (site_id, origin)
);

CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  page_path TEXT NOT NULL,
  target TEXT,
  target_host TEXT,
  referrer_host TEXT,
  active_ms INTEGER NOT NULL DEFAULT 0,
  browser TEXT NOT NULL DEFAULT 'Unknown',
  os TEXT NOT NULL DEFAULT 'Unknown',
  device_type TEXT NOT NULL DEFAULT 'Unknown',
  country TEXT,
  region TEXT,
  city TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_site_time
  ON events (site_id, created_at);

CREATE INDEX IF NOT EXISTS idx_events_site_type_time
  ON events (site_id, event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_events_site_session_time
  ON events (site_id, session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_origins_origin
  ON site_origins (origin);

INSERT OR IGNORE INTO sites (site_id, name, enabled)
VALUES ('dkalki-portfolio', 'DKalki Portfolio', 1);

INSERT OR IGNORE INTO site_origins (site_id, origin)
VALUES ('dkalki-portfolio', 'https://krishna.dupatane.portfolio.dkalki.com');
