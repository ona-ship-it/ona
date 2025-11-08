-- Insert mock profiles
-- Note: These are mock UUIDs and should be replaced with actual auth.users IDs when available

-- VIP User
INSERT INTO profiles (id, username, full_name, avatar_url, bio, created_at, email, userType, isVerified, linkX, balance, currency, followers, following, referralCode, referralCount)
VALUES 
('00000000-0000-0000-0000-000000000001', 'vipuser', 'VIP User', 'https://i.pravatar.cc/150?img=1', 'VIP user with premium features', '2023-01-15T10:30:00Z', 'vip@example.com', 'vip', TRUE, TRUE, '1500.00', 'USD', 5000, 250, 'VIP2023', 20);

-- Influencer
INSERT INTO profiles (id, username, full_name, avatar_url, bio, created_at, email, userType, isVerified, linkX, balance, currency, followers, following, referralCode, referralCount)
VALUES 
('00000000-0000-0000-0000-000000000002', 'influencer', 'Top Influencer', 'https://i.pravatar.cc/150?img=2', 'Digital content creator and trendsetter', '2023-02-10T14:20:00Z', 'influencer@example.com', 'influencer', TRUE, TRUE, '2500.00', 'USD', 10000, 500, 'INFL2023', 50);

-- Active User
INSERT INTO profiles (id, username, full_name, avatar_url, bio, created_at, email, userType, isVerified, linkX, balance, currency, followers, following, referralCode, referralCount)
VALUES 
('00000000-0000-0000-0000-000000000003', 'activeuser', 'Active User', 'https://i.pravatar.cc/150?img=3', 'Regular active platform user', '2023-03-20T14:45:00Z', 'active@example.com', 'active', FALSE, FALSE, '350.00', 'USD', 120, 180, 'ACT2023', 5);

-- New User
INSERT INTO profiles (id, username, full_name, avatar_url, bio, created_at, email, userType, isVerified, linkX, balance, currency, followers, following, referralCode, referralCount)
VALUES 
('00000000-0000-0000-0000-000000000004', 'newuser', 'New User', 'https://i.pravatar.cc/150?img=4', 'Just joined the platform', '2023-05-05T09:15:00Z', 'new@example.com', 'new', FALSE, FALSE, '50.00', 'USD', 10, 25, 'NEW2023', 0);

-- Subscriber
INSERT INTO profiles (id, username, full_name, avatar_url, bio, created_at, email, userType, isVerified, linkX, balance, currency, followers, following, referralCode, referralCount)
VALUES 
('00000000-0000-0000-0000-000000000005', 'subscriber', 'Loyal Subscriber', 'https://i.pravatar.cc/150?img=5', 'Long-term subscriber and supporter', '2023-04-12T11:30:00Z', 'subscriber@example.com', 'subscriber', TRUE, FALSE, '750.00', 'USD', 300, 150, 'SUB2023', 12);