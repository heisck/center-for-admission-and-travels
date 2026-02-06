# Admin Authentication Setup

## Environment Variables

To secure your admin authentication, you need to set the following environment variables:

### Required Variables

```env
ADMIN_EMAIL="info@catravels.com"
ADMIN_PASSWORD_HASH="$2b$10$Wm4jtx/WLSadjyybMcdDfOqWmqm0KXS8zHpplasFldevl/p9KX2w6"
```

### Current Credentials

- **Email**: `info@catravels.com`
- **Password**: `catravels1q2we3w22wr54`

The password hash above corresponds to the password `catravels1q2we3w22wr54`.

## Setup Instructions

1. **Create a `.env.local` file** in your project root (if it doesn't exist)
2. **Add the environment variables**:
   ```env
   ADMIN_EMAIL="info@catravels.com"
   ADMIN_PASSWORD_HASH="$2b$10$Wm4jtx/WLSadjyybMcdDfOqWmqm0KXS8zHpplasFldevl/p9KX2w6"
   ```

3. **For production (Render/Vercel)**:
   - Go to your deployment platform's environment variables settings
   - Add `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`
   - Redeploy your application

## Changing the Password

To change the admin password:

1. **Generate a new hash**:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your_new_password', 10).then(hash => console.log(hash))"
   ```

2. **Update the environment variable**:
   ```env
   ADMIN_PASSWORD_HASH="your_new_hash_here"
   ```

3. **Restart your application** (or redeploy)

## Security Notes

- ✅ Passwords are hashed using bcrypt (10 rounds)
- ✅ Credentials are stored in environment variables (not in code)
- ✅ Password comparison uses secure bcrypt comparison
- ✅ Session tokens are generated securely
- ⚠️ Make sure `.env.local` is in your `.gitignore` file
- ⚠️ Never commit `.env.local` or `.env` files to version control

## Login

Use the following credentials to log in:
- **Email**: `info@catravels.com`
- **Password**: `catravels1q2we3w22wr54`
