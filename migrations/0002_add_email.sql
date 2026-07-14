-- Add visitor email for confirmation messages
ALTER TABLE messages ADD COLUMN email TEXT;
ALTER TABLE bookings ADD COLUMN email TEXT;

CREATE INDEX IF NOT EXISTS messages_email_idx ON messages (email);
CREATE INDEX IF NOT EXISTS bookings_email_idx ON bookings (email);
