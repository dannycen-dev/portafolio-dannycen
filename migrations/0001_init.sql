-- Contact leads + booking appointments for dannydev.space
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  locale TEXT,
  source_path TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  gmail_message_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS messages_status_idx ON messages (status);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date TEXT NOT NULL,
  slot TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Merida',
  locale TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  google_event_id TEXT,
  meet_link TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS bookings_date_slot_unique
  ON bookings (date, slot)
  WHERE status != 'cancelled';

CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings (date);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status);
