# Vercel Deployment Guide - CommLead Academy

## 🚀 Complete Step-by-Step Guide to Deploy Your App

This guide will help you deploy the CommLead Academy application to Vercel so the founder can access it from any device.

---

## Part 1: Prepare Your Supabase Database

### Step 1: Run the Database Migration

Before deploying, you need to apply the comprehensive cohort fix to your Supabase database.

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in with your account
   - Select your CommLead Academy project

2. **Open the SQL Editor**
   - In the left sidebar, click **"SQL Editor"**
   - Click **"New query"** button

3. **Run the Migration Script**
   - Open the file: `supabase/migrations/012_comprehensive_cohort_fix.sql`
   - Copy ALL the content from that file
   - Paste it into the Supabase SQL Editor
   - Click **"Run"** button (bottom right)
   - You should see success messages with ✅ checkmarks

4. **Verify the Migration**
   - Go to **"Database"** → **"Tables"** in Supabase
   - Check that these tables exist and have policies:
     - `profiles`
     - `enrollments`
     - `cohort_lecturers`
     - `cohorts`
     - `programs`

---

## Part 2: Get Your Environment Variables

You'll need these from Supabase to configure Vercel.

### Step 2: Copy Your Supabase Credentials

1. **In Supabase Dashboard**, click **"Settings"** (gear icon in sidebar)

2. **Go to "API" section**

3. **Copy these two values** (save them in a notepad):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://gbivxfnjfvbntruioain.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiaXZ4Zm5qZnZibnRydWlvYWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTM5NTYsImV4cCI6MjA4NzUyOTk1Nn0.D1_exuJFURnGTFnXCnah7a6aJGLmAkQQ-Tj2xaw9c9I
   ```

   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → **anon/public**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> ⚠️ **IMPORTANT**: Keep these values safe but know that the anon key is safe to expose publicly (it's client-side). The service role key should NEVER be added to Vercel environment variables.

---

## Part 3: Deploy to Vercel

### Step 3: Sign Up / Sign In to Vercel

1. **Visit Vercel**
   - Go to: https://vercel.com
   - Click **"Sign Up"** (if new) or **"Log In"**
   - Choose **"Continue with GitHub"** (recommended)
   - Authorize Vercel to access your GitHub account

### Step 4: Import Your GitHub Repository

1. **Click "Add New" → "Project"**
   - This is in the top right of your Vercel dashboard

2. **Import Git Repository**
   - You'll see a list of your GitHub repositories
   - Find: **`rumbimoyo/Comm-lead`**
   - Click **"Import"** next to it

   > If you don't see the repository:
   > - Click **"Adjust GitHub App Permissions"**
   > - Grant Vercel access to the repository
   > - Refresh the page

### Step 5: Configure Your Project

1. **Project Settings Screen** will appear with these sections:

   #### A. Project Name
   - **Framework Preset**: Should auto-detect as **"Next.js"**
   - **Project Name**: You can keep it as `comm-lead` or rename to `commlead-academy`
   - **Root Directory**: Leave as `./` (default)

   #### B. Build and Output Settings
   - **Build Command**: Leave default (`next build`)
   - **Output Directory**: Leave default (`.next`)
   - **Install Command**: Leave default (`npm install`)

   #### C. Environment Variables
   - Click **"Environment Variables"** section
   - Add these TWO variables:

   **Variable 1:**
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: [paste your Supabase URL from Step 2]
   ```

   **Variable 2:**
   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: [paste your Supabase anon key from Step 2]
   ```

   - Make sure both are set for: **Production**, **Preview**, and **Development**

2. **Click "Deploy"** button

---

## Part 4: Wait for Deployment

### Step 6: Monitor the Build Process

1. **Build Progress Screen** will show:
   - Installing dependencies (1-2 minutes)
   - Building your Next.js app (2-3 minutes)
   - Deploying to Vercel's global CDN

2. **Wait for "Congratulations" Screen**
   - You'll see: 🎉 **"Your project has been successfully deployed"**

3. **Your Live URL**
   - Vercel will provide a URL like:
     - `https://comm-lead.vercel.app` (production)
     - Or: `https://comm-lead-git-main-rumbimoyo.vercel.app`

---

## Part 5: Test Your Deployment

### Step 7: Verify Everything Works

1. **Click "Visit" or open your Vercel URL**

2. **Test These Key Features**:

   ✅ **Homepage loads correctly**
   - Logo and navigation appear
   - Images load properly

   ✅ **Login works**
   - Go to `/auth/login`
   - Try logging in with admin account
   - Should redirect to `/admin` dashboard

   ✅ **Admin features work**
   - Can view students, enrollments, cohorts
   - Can add students to cohorts
   - Can add lecturers to cohorts

   ✅ **Public pages work**
   - About page (founder story only on homepage)
   - Team page (founder appears as regular team member)
   - Programs page

3. **Common Issues and Fixes**:

   **Issue: "Failed to fetch" errors**
   - Check environment variables are set correctly in Vercel
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables

   **Issue: Database errors**
   - Verify the migration script ran successfully in Supabase
   - Check RLS policies are enabled

   **Issue: Images not loading**
   - Images in `/public` folder should work automatically
   - External images need proper URLs

---

## Part 6: Share with Founder

### Step 8: Prepare Demo Credentials

1. **Create or identify an admin account** for the founder:
   - Email: `founder@commlead.com` (or whatever you prefer)
   - Password: Create a strong password
   - Role: `super_admin` or `admin`

2. **Set up the account in Supabase**:
   - Option 1: Have founder register and then manually approve in database
   - Option 2: Manually create the account in Supabase:
     ```sql
     -- In Supabase SQL Editor:
     -- First create the auth user (this depends on your setup)
     -- Then set as admin in profiles table:
     UPDATE profiles 
     SET role = 'super_admin', is_approved = true, is_active = true
     WHERE email = 'founder@commlead.com';
     ```

### Step 9: Send Founder the Demo Link

**Email Template:**

```
Subject: CommLead Academy Demo - Live on Vercel

Hi [Founder Name],

The CommLead Academy platform is now live and ready for your review!

🌐 Live Demo URL: https://comm-lead.vercel.app

📧 Login Credentials:
   Email: [admin_email]
   Password: [admin_password]

🔍 What to Check:

1. Public Pages
   - Homepage: See the updated design without horizontal logo banner
   - Team Page: Your profile now appears as part of the team
   - About Page: Your full story is featured on the homepage only

2. Admin Dashboard (after login)
   - Students Management
   - Enrollment Management
   - Cohort Management (can now add students/lecturers to cohorts)
   - Programs, Payments, Content Management

3. Key Features Working
   - User registration and login
   - Role-based access control
   - Database with Row Level Security

📝 Notes:
- The app is fully responsive (works on mobile, tablet, desktop)
- All data is stored in Supabase
- This is a production-ready deployment

Let me know if you have any questions or feedback!

Best regards,
[Your Name]
```

---

## Part 7: Custom Domain (Optional)

### Step 10: Add a Custom Domain (If Desired)

If the founder wants a custom domain like `academy.commlead.org`:

1. **In Vercel Dashboard** → Your Project → **Settings** → **Domains**

2. **Add Domain**
   - Enter the domain name: `academy.commlead.org`
   - Click "Add"

3. **Configure DNS** (at your domain registrar):
   - Add the DNS records Vercel provides
   - Usually a CNAME record pointing to `cname.vercel-dns.com`

4. **Wait for DNS Propagation** (can take 24-48 hours)

---

## Part 8: Continuous Deployment

### How Future Updates Work

Good news! Your deployment is now connected to GitHub:

1. **Every time you push to the `main` branch**, Vercel will:
   - Automatically detect the changes
   - Build a new version
   - Deploy it (usually takes 2-3 minutes)

2. **To update the live site**:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```

3. **Monitor deployments**:
   - Go to Vercel Dashboard
   - Click on your project
   - See all deployments and their status

---

## Troubleshooting

### Common Issues

#### Build Fails on Vercel

**Error: TypeScript errors**
- Check the logs in Vercel deployment page
- Fix any TypeScript errors locally first
- Push the fixes to GitHub

**Error: Module not found**
- Make sure all dependencies are in `package.json`
- Commit `package-lock.json` to git

#### Environment Variables Not Working

- Double-check spelling: `NEXT_PUBLIC_SUPABASE_URL` (must be exact)
- Make sure there are no extra spaces
- Redeploy after adding environment variables

#### Database Connection Issues

- Verify Supabase project is not paused
- Check that RLS policies allow the operations
- Run the migration script again if needed

#### 404 Errors on Pages

- Check that files are committed to git
- Verify file paths are correct (case-sensitive)
- Check that pages are in the `app` directory

---

## Success Checklist

Before sending to founder, verify:

- ✅ App deploys successfully on Vercel
- ✅ Homepage loads without errors
- ✅ Login works (try both admin and student accounts)
- ✅ Admin can access `/admin` dashboard
- ✅ Students can access `/dashboard`
- ✅ Database queries work (no RLS errors)
- ✅ Images and assets load correctly
- ✅ All public pages accessible
- ✅ Mobile responsive design works
- ✅ Admin can add students to cohorts
- ✅ Admin can add lecturers to cohorts
- ✅ Admin demo account created and verified

---

## Additional Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase Docs**: https://supabase.com/docs
- **Your GitHub Repo**: https://github.com/rumbimoyo/Comm-lead

---

## Quick Reference Commands

```bash
# Push changes to GitHub (triggers Vercel deployment)
git add .
git commit -m "Update: description of changes"
git push origin main

# Check deployment status
# Visit: https://vercel.com/dashboard

# View live site
# Visit: https://comm-lead.vercel.app
```

---

## Support

If you encounter any issues during deployment:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables
4. Check Supabase logs
5. Test locally with `npm run dev` first

---

**Last Updated**: February 25, 2026
**Deployment Guide Version**: 1.0
**Project**: CommLead Academy
**Repository**: https://github.com/rumbimoyo/Comm-lead.git

---

Good luck with your demo! 🚀
