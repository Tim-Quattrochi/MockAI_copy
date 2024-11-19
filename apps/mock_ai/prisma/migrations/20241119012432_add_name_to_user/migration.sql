/*
  Warnings:

  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/

-- Add the name column with a default value
ALTER TABLE "User" ADD COLUMN "name" TEXT NOT NULL DEFAULT 'Unknown';

