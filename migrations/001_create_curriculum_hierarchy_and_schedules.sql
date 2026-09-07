-- =============================================================================
-- Migration: 001_create_curriculum_hierarchy_and_schedules.sql
-- Description: Establishes the 5-level product hierarchy:
--              Exam -> Curriculum -> Chapter -> Topic -> Content
--              with Chapter-level 1:1 Schedules.
-- Compatibility: PostgreSQL (9.5+) / SQLite 3 (with JSON extension)
-- =============================================================================

-- Enable UUID extension if available (PostgreSQL)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'uuid-ossp') THEN
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 1. EXAMS (Master Exam Tracks)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(128) UNIQUE,
    country VARCHAR(100),
    region_code VARCHAR(10),
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_region ON exams(region_code);

-- -----------------------------------------------------------------------------
-- 2. CURRICULUMS (Curriculum versions & tracks per Exam)
-- Rule: One Exam -> Many Curriculums (1:N)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS curriculums (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    version VARCHAR(32) DEFAULT 'v1.0',
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(32) NOT NULL DEFAULT 'published', -- 'draft', 'published', 'archived'
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_curriculums_exam_id ON curriculums(exam_id);
CREATE INDEX IF NOT EXISTS idx_curriculums_status ON curriculums(status);

-- -----------------------------------------------------------------------------
-- 3. CHAPTERS (Structured Syllabus Modules / Weeks)
-- Rule: One Curriculum -> Many Chapters (1:N)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chapters (
    id VARCHAR(64) PRIMARY KEY,
    curriculum_id VARCHAR(64) NOT NULL REFERENCES curriculums(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    chapter_number INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    estimated_duration_hours NUMERIC(5, 2) DEFAULT 0.00,
    order_index INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chapters_curriculum_id ON chapters(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(curriculum_id, order_index);

-- -----------------------------------------------------------------------------
-- 4. CHAPTER_SCHEDULES (Study Pacing, Windows & Deadlines)
-- Rule: One Chapter -> Exactly One Schedule (1:1 UNIQUE)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chapter_schedules (
    id VARCHAR(64) PRIMARY KEY,
    chapter_id VARCHAR(64) NOT NULL UNIQUE REFERENCES chapters(id) ON DELETE CASCADE,
    schedule_type VARCHAR(32) NOT NULL DEFAULT 'fixed_dates', -- 'fixed_dates', 'relative_days', 'self_paced'
    start_date DATE,
    end_date DATE,
    target_duration_days INTEGER DEFAULT 7,
    recommended_study_hours INTEGER DEFAULT 14,
    milestone_name VARCHAR(255),
    unlock_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_chapter_schedule_chapter_id ON chapter_schedules(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_schedules_dates ON chapter_schedules(start_date, end_date);

-- -----------------------------------------------------------------------------
-- 5. TOPICS (Granular Learning Units under a Chapter)
-- Rule: One Chapter -> Many Topics (1:N)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS topics (
    id VARCHAR(64) PRIMARY KEY,
    chapter_id VARCHAR(64) NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    topic_number INTEGER NOT NULL DEFAULT 1,
    summary TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    estimated_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_topics_chapter_id ON topics(chapter_id);
CREATE INDEX IF NOT EXISTS idx_topics_order ON topics(chapter_id, order_index);

-- -----------------------------------------------------------------------------
-- 6. CONTENTS (Polymorphic Mixed Learning Assets under a Topic)
-- Rule: One Topic -> Many Content items of mixed types (1:N)
-- Supported types: 'video', 'photo', 'pdf', 'ppt', 'live_session'
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contents (
    id VARCHAR(64) PRIMARY KEY,
    topic_id VARCHAR(64) NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    content_type VARCHAR(32) NOT NULL CHECK (
        content_type IN ('video', 'photo', 'pdf', 'ppt', 'live_session')
    ),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_free_preview BOOLEAN NOT NULL DEFAULT FALSE,
    media_url TEXT,
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contents_topic_id ON contents(topic_id);
CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(content_type);
CREATE INDEX IF NOT EXISTS idx_contents_order ON contents(topic_id, order_index);
