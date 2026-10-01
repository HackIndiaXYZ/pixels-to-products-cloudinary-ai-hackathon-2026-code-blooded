-- Word timings per segment (for exactly-timed Moment captions) and the transcript's detected language.
ALTER TABLE segments ADD COLUMN words JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE lectures ADD COLUMN language TEXT;
