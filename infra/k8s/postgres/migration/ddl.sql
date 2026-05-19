CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sourceId VARCHAR(255) UNIQUE, -- The original ID from Shopee/Amazon
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g., 'Hydrating Serums', 'Gen Z Skincare'
    brand VARCHAR(100),
    price DECIMAL(10, 2),
    salesVolume INT, -- Penting buat Pricing & Trend Engine
    scrapedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE marketSignals (
    id SERIAL PRIMARY KEY,
    productId INT REFERENCES products(id) ON DELETE CASCADE, --Can be NULL if the threat is a brand-wide PR disaster or FDA news
    signalText TEXT NOT NULL,
    sourceType VARCHAR(50) NOT NULL, --('review', 'tiktok', 'fda_news', 'pdf')
    sourceUrl TEXT,
    sentimentScore DECIMAL(3, 2), -- Generic score (-1.0 to 1.0) replaces 1-5 stars so it works for news/social too
    signalDate DATE DEFAULT CURRENT_DATE,
    embedding vector(384));

CREATE INDEX ON marketSignals USING hnsw (embedding vector_cosine_ops);

CREATE TABLE categoryInsights (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'processing', --'processing', 'completed', 'failed'
    lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gtmIntelligence JSONB,       
    financeIntelligence JSONB,   
    securityCompliance JSONB);