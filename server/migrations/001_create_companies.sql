CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    date_create TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        raw JSONB
);