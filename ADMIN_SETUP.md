# 🔧 ADMIN SETUP INSTRUCTIONS

## ⚠️ CRITICAL: Email Confirmation Issue Fix

The "Email not confirmed" error happens because Supabase requires email verification by default.

### **Option 1: Manual Admin Setup (FASTEST)**

Go to your **Supabase Dashboard** → **Authentication** → **Users** and:

1. **Find your user** (rumbidzaimoyo53@gmail.com)
2. **Click on the user**
3. **Set "Email Confirmed" to TRUE**
4. **Save**

### **Option 2: SQL Command (ALTERNATIVE)**

Run this in **SQL Editor**:

```sql
-- Make your email confirmed and set as admin
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'rumbidzaimoyo53@gmail.com';

-- Set your profile as admin
UPDATE profiles 
SET role = 'admin', is_approved = TRUE, full_name = 'Charline Prezen Chikomo'
WHERE id = (SELECT id FROM auth.users WHERE email = 'rumbidzaimoyo53@gmail.com');
```

### **Option 3: Disable Email Confirmation (DEVELOPMENT ONLY)**

In **Supabase Dashboard** → **Authentication** → **Settings**:
- Turn OFF "Enable email confirmations"

---

## 🔄 After Setup

1. **Login at**: http://localhost:3000/auth/login
2. **Email**: rumbidzaimoyo53@gmail.com
3. **Password**: Commlead2026
4. **Should redirect to**: `/admin` dashboard

---

## ✅ Your Logo Files (Found & Updated)

✅ `/CommLead Academy shield logo.png` - Now used in navbar and login
✅ `/horizontal logo.png` - Available for use
✅ `/image.png` - Available for team photos

The website now uses your actual logo files!