CREATE TABLE customers
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_name VARCHAR(255) NOT NULL,

    authorized_person VARCHAR(255),

    phone VARCHAR(50),

    tax_number VARCHAR(100) UNIQUE,

    address TEXT,

    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP,

    updated_at TIMESTAMP
);