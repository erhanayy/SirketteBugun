-- Initialize Photo Limit Parameters
INSERT INTO parameters (id, code, data_int)
VALUES 
    (gen_random_uuid(), 'PhotoCountPerPost', 3),
    (gen_random_uuid(), 'PremiumPhotoCountPerPost', 10)
ON CONFLICT (code) DO NOTHING;
