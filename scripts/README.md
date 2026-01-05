# Admin User Creation Script

This script creates an admin user for the YouZell admin portal.

## Prerequisites

1. Make sure your MongoDB database is running and accessible
2. Ensure `DATABASE_URL` is set in your environment file (`env/.env.development` or `env/.env.production`)

## Usage

### Option 1: Using npm script (Recommended)

```bash
npm run create-admin
```

### Option 2: Direct execution

```bash
node scripts/create-admin-user.js
```

## Configuration

You can customize the admin user by setting environment variables in your `.env` file:

```env
ADMIN_EMAIL=admin@youzell.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Admin User
```

If not set, the script will use these defaults:
- **Email**: `admin@youzell.com`
- **Password**: `Admin@123`
- **Name**: `Admin User`

## Default Credentials

After running the script, you can login to the admin portal with:

- **Email**: `admin@youzell.com` (or your custom ADMIN_EMAIL)
- **Password**: `Admin@123` (or your custom ADMIN_PASSWORD)

⚠️ **Important**: Change the default password after first login!

## Notes

- The script will check if an admin user with the same email already exists
- If the user exists, it will not create a duplicate
- The admin user will be created with `is_verified: true` and `is_active: true`

