-- Google Calendar push sync metadata (watch channel + revision counter)
CREATE TABLE IF NOT EXISTS calendar_sync (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
