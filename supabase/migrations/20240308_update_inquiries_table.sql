-- Update inquiries table to support admin management
ALTER TABLE inquiries 
ADD COLUMN is_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN responded_at TIMESTAMPTZ;
