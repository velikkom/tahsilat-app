ALTER TABLE collections
    ADD COLUMN collected_by UUID;

ALTER TABLE collections
    ADD CONSTRAINT fk_collection_collected_by
        FOREIGN KEY (collected_by)
        REFERENCES users (id);

CREATE INDEX idx_collections_collected_by
    ON collections (collected_by);
