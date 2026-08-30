/*
# Add project tracking fields & update for Ghaziabad district

## Changes to `projects` table
- Add `estimated_days` (int) — planned project duration in days
- Add `actual_days` (int) — actual time taken so far
- Add `implementing_agency` (text) — executing agency name
- Add `location` (text) — human-readable location within district

## Changes to `constituencies` table
- Add `district` (text) — district name for dashboard display

## Notes
1. Non-destructive — only adds columns, no data loss.
2. Amounts stay in the existing numeric columns; the app will display in Lakhs.
*/

ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_days integer;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_days integer;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS implementing_agency text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS location text;

ALTER TABLE constituencies ADD COLUMN IF NOT EXISTS district text;
