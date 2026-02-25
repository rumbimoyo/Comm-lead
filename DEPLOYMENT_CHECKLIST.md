# 🚀 Quick Deployment Checklist

## Pre-Deployment (Do These First)

- [ ] **Run database migration in Supabase**
  - Open Supabase SQL Editor
  - Copy all content from `supabase/migrations/012_comprehensive_cohort_fix.sql`
  - Paste and run in SQL Editor
  - Verify success messages appear

- [ ] **Get Supabase credentials**
  - Copy `NEXT_PUBLIC_SUPABASE_URL` from Supabase Settings → API
  - Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase Settings → API
  - Save both in a safe place

- [ ] **Code is pushed to GitHub**
  - Repository: https://github.com/rumbimoyo/Comm-lead.git
  - Branch: `main`
  - All recent changes committed and pushed

---

## Vercel Deployment Steps

- [ ] **Sign in to Vercel**
  - Go to https://vercel.com
  - Sign in with GitHub

- [ ] **Import repository**
  - Click "Add New" → "Project"
  - Find `rumbimoyo/Comm-lead`
  - Click "Import"

- [ ] **Configure environment variables**
  - Add `NEXT_PUBLIC_SUPABASE_URL` = [your Supabase URL]
  - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` = [your Supabase anon key]
  - Apply to: Production, Preview, Development

- [ ] **Deploy**
  - Click "Deploy"
  - Wait 3-5 minutes for build to complete

- [ ] **Get your live URL**
  - Copy the Vercel URL (e.g., `https://comm-lead.vercel.app`)

---

## Testing (Before Sharing with Founder)

- [ ] **Homepage works**
  - Logo displays correctly (shield logo, no horizontal banner)
  - Navigation works
  - Images load

- [ ] **Login works**
  - Can access `/auth/login`
  - Admin login redirects to `/admin`
  - Student login redirects to `/dashboard`
  - No AbortError in console

- [ ] **Admin dashboard works**
  - Can view students list
  - Can view enrollments
  - Can view cohorts
  - Can add students to cohorts
  - Can add lecturers to cohorts

- [ ] **Public pages work**
  - `/about` - Founder story only on homepage ✅
  - `/team` - Founder as regular team member ✅
  - `/programs` - Programs list displays
  - `/contact` - Contact form works

- [ ] **Database operations work**
  - No RLS policy errors
  - Data loads correctly
  - Can create/update records as admin

---

## Prepare for Founder Demo

- [ ] **Create admin account for founder**
  - Email: `_______________`
  - Password: `_______________`
  - Set role to `super_admin` or `admin` in Supabase
  - Set `is_approved = true`
  - Set `is_active = true`

- [ ] **Test the admin account**
  - Can log in successfully
  - Can access all admin features
  - No errors in console

- [ ] **Create test data (optional)**
  - Add sample students
  - Add sample programs
  - Add sample cohorts
  - Show real functionality

---

## Share with Founder

- [ ] **Send email with details**
  - Live URL: `_______________`
  - Login email: `_______________`
  - Login password: `_______________`
  - List of features to test
  - Your contact for questions

- [ ] **Provide context**
  - Explain any demo limitations
  - Mention it's production-ready
  - Note that it works on all devices

---

## Post-Deployment

- [ ] **Monitor the first few hours**
  - Check for errors in Vercel logs
  - Watch for user feedback
  - Be ready to fix issues quickly

- [ ] **Document any issues**
  - Note what works well
  - Note what needs improvement
  - Gather founder feedback

---

## Quick Commands

```bash
# View current git status
git status

# Push new changes (triggers auto-deployment)
git add .
git commit -m "Description of changes"
git push origin main

# View Vercel deployment status
# Go to: https://vercel.com/dashboard
```

---

## Important Links

- **Live Site**: `https://comm-lead.vercel.app` (or your custom domain)
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/rumbimoyo/Comm-lead
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## Emergency Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Next.js Docs**: https://nextjs.org/docs

---

**✅ = Deployment Ready | ⚠️ = Needs Attention | ❌ = Blocking Issue**

---

**Date**: _______________
**Deployed By**: _______________
**Live URL**: _______________
