-- =============================================================================
-- Migration: 001_rollback_curriculum_hierarchy_and_schedules.sql
-- Description: Reverses the 5-level hierarchy schema in reverse dependency order:
--              contents -> topics -> chapter_schedules -> chapters -> curriculums -> exams
-- =============================================================================

-- Drop in strict reverse dependency order
DROP TABLE IF EXISTS contents CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS chapter_schedules CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS curriculums CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
