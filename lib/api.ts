/**
 * API Entry Point
 *
 * This file serves as the main entry point for all API calls in the application.
 * Instead of having all endpoints in one file, they are now organized into domain-specific folders:
 *
 * - lib/api/auth/        - Authentication related endpoints
 * - lib/api/ambassador/  - Ambassador management endpoints
 * - lib/api/shared/      - Shared utilities, types, and the core apiCall function
 *
 * Each folder contains an index.ts that exports its endpoints and types.
 * This file simply re-exports everything from those folders for backwards compatibility.
 *
 * To add new API endpoints:
 * 1. Create a new folder in lib/api/ (e.g., lib/api/admin/)
 * 2. Add your endpoints and types in that folder's index.ts
 * 3. Export from that folder in lib/api/index.ts
 */

export * from "./api";
