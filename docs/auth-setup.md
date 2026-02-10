# Authentication Setup Guide

## Creating Admin Users

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create New User"
3. Enter email and password
4. The user will automatically be added to admin_users with 'reviewer' role

## Promoting to Admin

```sql
UPDATE admin_users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Enabling MFA for a User

1. User logs in to admin portal
2. Navigate to Settings → Security
3. Click "Enable MFA"
4. Scan QR code with authenticator app
5. Enter verification code

## Session Management

- Sessions expire after 8 hours
- Users must re-authenticate after expiry
- MFA is verified once per session

## Deactivating Users

```sql
UPDATE admin_users SET is_active = false WHERE email = 'user@example.com';
```
