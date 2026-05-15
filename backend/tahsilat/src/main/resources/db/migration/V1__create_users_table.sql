CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(100),

    last_name VARCHAR(100),

    email VARCHAR(150) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    role VARCHAR(50) NOT NULL,

    active BOOLEAN DEFAULT TRUE
);