CREATE TABLE collections
(

    id UUID PRIMARY KEY,

    customer_id UUID NOT NULL,

    amount NUMERIC(19,2) NOT NULL,

    collection_date DATE NOT NULL,

    maturity_date DATE,

    description VARCHAR(500),

    payment_type VARCHAR(50) NOT NULL,

    status VARCHAR(50) NOT NULL,

    active BOOLEAN NOT NULL,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_collection_customer
        FOREIGN KEY (customer_id)
            REFERENCES customers(id)
);