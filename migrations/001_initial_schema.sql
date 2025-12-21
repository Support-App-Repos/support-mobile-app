-- Initial Database Schema Migration
-- This is a reference SQL file for creating the database schema
-- Adjust according to your database system (PostgreSQL, MySQL, etc.)

-- Enable UUID extension (PostgreSQL)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    profile_image_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
    ('Products', 'products'),
    ('Events', 'events'),
    ('Services', 'services'),
    ('Properties', 'properties');

-- ============================================
-- EVENT TYPES TABLE
-- ============================================
CREATE TABLE event_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_url TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_types_category ON event_types(category_id);
CREATE INDEX idx_event_types_slug ON event_types(slug);

-- Insert default event types
INSERT INTO event_types (name, slug, category_id)
SELECT 'Party', 'party', id FROM categories WHERE slug = 'events'
UNION ALL
SELECT 'Meeting', 'meeting', id FROM categories WHERE slug = 'events'
UNION ALL
SELECT 'Workshop', 'workshop', id FROM categories WHERE slug = 'events';

-- ============================================
-- SERVICE TYPES TABLE
-- ============================================
CREATE TABLE service_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_url TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_types_category ON service_types(category_id);
CREATE INDEX idx_service_types_slug ON service_types(slug);

-- Insert default service types
INSERT INTO service_types (name, slug, category_id)
SELECT 'Professional Service', 'professional-service', id FROM categories WHERE slug = 'services'
UNION ALL
SELECT 'Medical', 'medical', id FROM categories WHERE slug = 'services'
UNION ALL
SELECT 'Home Service', 'home-service', id FROM categories WHERE slug = 'services'
UNION ALL
SELECT 'Beauty', 'beauty', id FROM categories WHERE slug = 'services';

-- ============================================
-- REGIONS TABLE
-- ============================================
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    country_code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regions_name ON regions(name);
CREATE INDEX idx_regions_country ON regions(country);

-- Insert sample regions
INSERT INTO regions (name, country, country_code) VALUES
    ('New York', 'United States', 'US'),
    ('Los Angeles', 'United States', 'US'),
    ('Chicago', 'United States', 'US'),
    ('Houston', 'United States', 'US'),
    ('Phoenix', 'United States', 'US'),
    ('Philadelphia', 'United States', 'US'),
    ('San Antonio', 'United States', 'US'),
    ('San Diego', 'United States', 'US');

-- ============================================
-- LISTINGS TABLE
-- ============================================
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    event_type_id UUID REFERENCES event_types(id) ON DELETE SET NULL,
    service_type_id UUID REFERENCES service_types(id) ON DELETE SET NULL,
    
    -- Common fields
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2),
    price_type VARCHAR(50), -- 'Free', 'Paid', 'Per Seat', 'Per Hour'
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    venue VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'sold', 'expired', 'archived'
    views_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    
    -- Event-specific fields
    event_date DATE,
    event_time TIME,
    duration VARCHAR(50),
    max_capacity INTEGER,
    organizer_name VARCHAR(255),
    organizer_contact VARCHAR(50),
    organizer_email VARCHAR(255),
    tags TEXT,
    
    -- Service-specific fields
    business_name VARCHAR(255),
    specialization VARCHAR(255),
    years_of_experience INTEGER,
    
    -- Property-specific fields
    bedrooms INTEGER,
    bathrooms INTEGER,
    square_feet INTEGER,
    year_built INTEGER
);

CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_published ON listings(published_at);
CREATE INDEX idx_listings_location ON listings(location);
CREATE INDEX idx_listings_event_date ON listings(event_date);

-- Full-text search index (PostgreSQL)
CREATE INDEX idx_listings_search ON listings USING GIN(to_tsvector('english', title || ' ' || description));

-- ============================================
-- LISTING PHOTOS TABLE
-- ============================================
CREATE TABLE listing_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    photo_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listing_photos_listing ON listing_photos(listing_id);
CREATE INDEX idx_listing_photos_order ON listing_photos(listing_id, photo_order);

-- ============================================
-- LISTING REGIONS TABLE (Many-to-Many)
-- ============================================
CREATE TABLE listing_regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(listing_id, region_id)
);

CREATE INDEX idx_listing_regions_listing ON listing_regions(listing_id);
CREATE INDEX idx_listing_regions_region ON listing_regions(region_id);

-- ============================================
-- PAYMENT PLANS TABLE
-- ============================================
CREATE TABLE payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'monthly', 'onetime'
    price DECIMAL(10,2) NOT NULL,
    listing_fee DECIMAL(10,2) DEFAULT 0,
    processing_fee DECIMAL(10,2) DEFAULT 0,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_plans_type ON payment_plans(type);

-- Insert default payment plans
INSERT INTO payment_plans (name, type, price, listing_fee, processing_fee, features) VALUES
    ('Monthly Subscription', 'monthly', 29.99, 10.00, 1.00, '["Unlimited listings", "Priority support", "Analytics dashboard"]'::jsonb),
    ('One-time Payment', 'onetime', 49.99, 10.00, 1.00, '["Single listing", "30 days visibility", "Basic support"]'::jsonb);

-- ============================================
-- PROMO CODES TABLE
-- ============================================
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(50) NOT NULL, -- 'percentage', 'fixed'
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_valid ON promo_codes(valid_from, valid_until);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE RESTRICT,
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_listing ON subscriptions(listing_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(listing_id, user_id)
);

CREATE INDEX idx_reviews_listing ON reviews(listing_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ============================================
-- BROWSING HISTORY TABLE
-- ============================================
CREATE TABLE browsing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    view_duration INTEGER
);

CREATE INDEX idx_browsing_history_user ON browsing_history(user_id);
CREATE INDEX idx_browsing_history_listing ON browsing_history(listing_id);
CREATE INDEX idx_browsing_history_viewed ON browsing_history(viewed_at);

-- ============================================
-- WISHLIST TABLE
-- ============================================
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_wishlist_listing ON wishlist(listing_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================================
-- OTP VERIFICATIONS TABLE
-- ============================================
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL, -- 'login', 'registration', 'password_reset'
    is_verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_phone ON otp_verifications(phone_number);
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);

-- ============================================
-- USER RECENT REGIONS TABLE
-- ============================================
CREATE TABLE user_recent_regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_recent_regions_user ON user_recent_regions(user_id);
CREATE INDEX idx_user_recent_regions_last_used ON user_recent_regions(user_id, last_used_at);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_types_updated_at BEFORE UPDATE ON event_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON service_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_plans_updated_at BEFORE UPDATE ON payment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR CALCULATING AVERAGE RATINGS
-- ============================================
-- Function to update listing rating average and count
CREATE OR REPLACE FUNCTION update_listing_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE listings
    SET 
        rating_average = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM reviews
            WHERE listing_id = NEW.listing_id
        ),
        reviews_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE listing_id = NEW.listing_id
        )
    WHERE id = NEW.listing_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update rating when review is inserted/updated/deleted
CREATE TRIGGER update_listing_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_listing_rating();


