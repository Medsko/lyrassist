-- A saved Metaphor Collision "X is Y" (tenor/vehicle after I.A. Richards:
-- the tenor is the subject, the vehicle the image it collides with).
CREATE TABLE metaphor (
    id         BIGSERIAL PRIMARY KEY,
    tenor_id   BIGINT NOT NULL REFERENCES word (id),
    vehicle_id BIGINT NOT NULL REFERENCES word (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenor_id, vehicle_id)
);
