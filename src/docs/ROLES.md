# Onagui Role System Documentation

## Overview

Onagui uses two separate role systems:

1. **Application Roles** - Used for application-level logic and permissions
2. **Database Role** - Used only for schema management, not daily app logic

## Application Roles

Application roles are stored in the `onagui.roles` table and are used to control access to features within the application. These roles are:

- **user** - Basic user with limited permissions
- **subscriber** - Paid subscriber with additional features
- **influencer** - Content creator with special privileges
- **admin** - Application administrator with full app access

Users are assigned roles through the `onagui.user_roles` table. The application checks these roles using the utility functions in `src/utils/roleUtils.ts`.

### Role Utility Functions

- `hasRole(roleName)` - Check if the current user has a specific role
- `isAdmin()` - Check if the current user is an admin
- `isSubscriber()` - Check if the current user is a subscriber
- `isInfluencer()` - Check if the current user is an influencer
- `getUserRoles()` - Get all roles for the current user

## Database Role

The PostgreSQL `admin` database role is separate from the application roles. It has:

- `USAGE` privileges on the `onagui` schema
- `ALL` privileges on all tables, sequences, and functions in the `onagui` schema

This role is used exclusively for database administration and schema management, not for application logic.

## Important Distinctions

1. **Application Admin vs. Database Admin**
   - Application admin role (`onagui.roles` with name='admin') controls application features
   - PostgreSQL admin role controls database schema and structure

2. **Usage Patterns**
   - Use application roles for all app-level logic and UI permissions
   - Use the PostgreSQL admin role only for database schema changes and maintenance

3. **Security**
   - Only `richtheocrypto@gmail.com` has the application admin role
   - The PostgreSQL admin role is managed at the database level, not through the application

## Implementation Details

- Row-Level Security (RLS) policies use application roles to control data access
- The `onagui.has_role()` function is used in RLS policies to check user roles
- The migration file `20240815_roles_and_permissions.sql` sets up both role systems