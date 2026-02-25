# CommLead Academy - Complete System Architecture Plan

## Table of Contents
1. [Overview & Current Issues](#1-overview--current-issues)
2. [User Roles & Access Levels](#2-user-roles--access-levels)
3. [Database Schema Redesign](#3-database-schema-redesign)
4. [Admin Dashboard (Complete Specification)](#4-admin-dashboard)
5. [Lecturer Dashboard (New)](#5-lecturer-dashboard)
6. [Student Dashboard (Complete Specification)](#6-student-dashboard)
7. [Dynamic Landing Page Content](#7-dynamic-landing-page-content)
8. [Content Upload Workflows](#8-content-upload-workflows)
9. [Row Level Security (RLS) Policies](#9-row-level-security-policies)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. Overview & Current Issues

### Current Problems Identified

| Issue | Location | Impact |
|-------|----------|--------|
| Missing `lecturer` role in enum | `user_role` enum | Cannot create lecturer accounts |
| Column name mismatches | `enrollments.user_id` vs `student_id` in types | Query failures |
| Missing email field in profiles | `profiles` table | Cannot display student emails |
| RLS policies too restrictive | Multiple tables | Admin/lecturer operations fail |
| No lecturer-lesson assignment | `lessons` table | Can't assign lecturers to content |
| Missing attendance tracking | No table exists | Cannot track class attendance |
| Missing assignment submissions | No table exists | Students can't submit assignments |
| No grade/marks system | No table exists | Cannot record student performance |
| Inconsistent field names | Schema vs TypeScript types | Runtime errors |

### Architecture Goals

1. **Three distinct user roles**: Admin, Lecturer, Student
2. **Clear data ownership**: Who creates/manages what content
3. **Dynamic website content**: Admin-editable landing page sections
4. **Complete LMS flow**: Enrollment → Payment → Learning → Assessment → Certification
5. **Reliable RLS policies**: Proper access control without blocking legitimate operations

---

## 2. User Roles & Access Levels

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         SUPER ADMIN                              │
│  (Full system access, can create other admins)                  │
├─────────────────────────────────────────────────────────────────┤
│                           ADMIN                                  │
│  (Manage everything except other admins)                        │
├─────────────────────────────────────────────────────────────────┤
│                          LECTURER                                │
│  (Manage assigned programs, content, grades)                    │
├─────────────────────────────────────────────────────────────────┤
│                          STUDENT                                 │
│  (View enrolled content, submit work, track progress)           │
└─────────────────────────────────────────────────────────────────┘
```

### Permission Matrix

| Action | Admin | Lecturer | Student |
|--------|-------|----------|---------|
| **Website Content** |
| Edit landing page content | ✅ | ❌ | ❌ |
| Manage team members | ✅ | ❌ | ❌ |
| Manage events | ✅ | ❌ | ❌ |
| Manage testimonials | ✅ | ❌ | ❌ |
| **Programs & Curriculum** |
| Create/edit programs | ✅ | ❌ | ❌ |
| Assign lecturers to programs | ✅ | ❌ | ❌ |
| Create/edit lessons | ✅ | ✅ (assigned only) | ❌ |
| Upload lesson content | ✅ | ✅ (assigned only) | ❌ |
| Create quizzes/assignments | ✅ | ✅ (assigned only) | ❌ |
| **Student Management** |
| View all students | ✅ | ✅ (enrolled in their programs) | ❌ |
| Approve enrollments | ✅ | ❌ | ❌ |
| Confirm payments | ✅ | ❌ | ❌ |
| Issue certificates | ✅ | ✅ (recommendation) | ❌ |
| **Assessments & Grading** |
| View submissions | ✅ | ✅ (their programs) | ✅ (own only) |
| Grade assignments | ✅ | ✅ (their programs) | ❌ |
| Record attendance | ✅ | ✅ (their classes) | ❌ |
| **Student Actions** |
| View enrolled courses | ✅ | ✅ | ✅ |
| Complete lessons | ❌ | ❌ | ✅ |
| Submit assignments | ❌ | ❌ | ✅ |
| Take quizzes | ❌ | ❌ | ✅ |
| Download certificates | ❌ | ❌ | ✅ |
| Make payments | ❌ | ❌ | ✅ |

---

## 3. Database Schema Redesign

### Updated Enums

```sql
-- Replace existing user_role enum
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('student', 'lecturer', 'admin', 'super_admin');

-- Add new enums needed
CREATE TYPE assignment_status AS ENUM ('pending', 'submitted', 'graded', 'returned');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE certificate_status AS ENUM ('pending', 'approved', 'issued', 'revoked');
```

### Updated Tables

#### 1. Profiles Table (Updated)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,                    -- ADD: Store email for display
  full_name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'student',
  bio TEXT,                               -- ADD: For lecturers/team display
  specialization TEXT,                    -- ADD: For lecturers
  linkedin_url TEXT,                      -- ADD: For public profiles
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,         -- ADD: Soft delete capability
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Enrollments Table (Fixed)

```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,  -- Keep as user_id
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES cohorts(id),   -- ADD: Track which cohort
  status enrollment_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_method payment_method,
  amount_paid DECIMAL(10,2) DEFAULT 0,     -- ADD: Track partial payments
  amount_due DECIMAL(10,2) DEFAULT 0,      -- ADD: Track balance
  is_scholarship BOOLEAN DEFAULT FALSE,
  motivation TEXT,
  enrolled_at TIMESTAMPTZ,                 -- ADD: When fully enrolled
  completed_at TIMESTAMPTZ,                -- ADD: When completed program
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. NEW: Cohorts Table

```sql
CREATE TABLE cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                      -- e.g., "January 2026 Cohort"
  start_date DATE NOT NULL,
  end_date DATE,
  max_students INTEGER DEFAULT 30,
  current_students INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_enrollment_open BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. NEW: Program Lecturers (Assignment Table)

```sql
CREATE TABLE program_lecturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_lead BOOLEAN DEFAULT FALSE,           -- Lead lecturer for the program
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id, lecturer_id)
);
```

#### 5. Lessons Table (Updated)

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id), -- ADD: Track who created
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,                        -- ADD: Lesson summary
  content TEXT,                            -- Rich text content
  video_url TEXT,
  video_duration INTEGER,                  -- ADD: Duration in seconds
  attachments JSONB DEFAULT '[]',          -- ADD: [{name, url, type}]
  lesson_type lesson_type DEFAULT 'text',
  order_index INTEGER DEFAULT 0,
  estimated_duration INTEGER,              -- ADD: Estimated time in minutes
  is_published BOOLEAN DEFAULT FALSE,
  is_free_preview BOOLEAN DEFAULT FALSE,   -- ADD: Free preview for marketing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id, slug)
);
```

#### 6. NEW: Assignments Table

```sql
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  due_date TIMESTAMPTZ,
  max_score INTEGER DEFAULT 100,
  passing_score INTEGER DEFAULT 50,
  allow_late_submission BOOLEAN DEFAULT TRUE,
  late_penalty_percent INTEGER DEFAULT 10, -- % deducted per day late
  attachments JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 7. NEW: Assignment Submissions Table

```sql
CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,                            -- Written response
  attachments JSONB DEFAULT '[]',          -- [{name, url, type, size}]
  status assignment_status DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  score INTEGER,
  feedback TEXT,
  graded_by UUID REFERENCES profiles(id),
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);
```

#### 8. NEW: Quizzes Table

```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,              -- NULL = no limit
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  shuffle_questions BOOLEAN DEFAULT TRUE,
  show_answers_after BOOLEAN DEFAULT TRUE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 9. NEW: Quiz Questions Table

```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice', -- multiple_choice, true_false, short_answer
  options JSONB DEFAULT '[]',              -- [{text, is_correct}]
  correct_answer TEXT,                     -- For short_answer
  points INTEGER DEFAULT 1,
  explanation TEXT,                        -- Shown after answering
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 10. NEW: Quiz Attempts Table

```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}',              -- {question_id: answer}
  score INTEGER,
  max_score INTEGER,
  percentage DECIMAL(5,2),
  passed BOOLEAN,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_taken_seconds INTEGER
);
```

#### 11. NEW: Attendance Table

```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_time TEXT,
  status attendance_status DEFAULT 'present',
  notes TEXT,
  marked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_id, student_id, session_date)
);
```

#### 12. NEW: Certificates Table

```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  status certificate_status DEFAULT 'pending',
  issued_at TIMESTAMPTZ,
  issued_by UUID REFERENCES profiles(id),
  recommended_by UUID REFERENCES profiles(id), -- Lecturer recommendation
  pdf_url TEXT,
  verification_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, program_id)
);
```

#### 13. NEW: Announcements Table

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT DEFAULT 'all',      -- 'all', 'students', 'lecturers', 'program:{id}'
  program_id UUID REFERENCES programs(id), -- NULL = all programs
  cohort_id UUID REFERENCES cohorts(id),   -- NULL = all cohorts
  is_pinned BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 14. Website Content Table (Updated)

```sql
CREATE TABLE website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,                   -- 'hero', 'about', 'values', 'founder', etc.
  key TEXT NOT NULL,                       -- Field name within section
  value TEXT,                              -- Text value
  value_json JSONB,                        -- Complex data (arrays, objects)
  media_url TEXT,                          -- Image/video URL
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section, key)
);
```

---

## 4. Admin Dashboard

### Dashboard Overview (Home)

**Purpose**: At-a-glance metrics and quick actions

| Widget | Data Displayed |
|--------|----------------|
| Total Students | Count from profiles where role = 'student' |
| Active Enrollments | Enrollments with status = 'approved' |
| Pending Approvals | Enrollments with status = 'pending' |
| Revenue This Month | Sum of confirmed payments this month |
| Pending Payments | Payments awaiting confirmation |
| Active Programs | Programs with is_active = true |
| Recent Activity Feed | Latest enrollments, payments, submissions |

**Quick Actions**:
- Approve pending enrollment
- Confirm payment
- View contact submissions

---

### Admin Pages Structure

```
/admin
├── page.tsx                    # Dashboard overview
├── students/
│   └── page.tsx               # All students management
├── enrollments/
│   └── page.tsx               # Enrollment requests
├── payments/
│   └── page.tsx               # Payment management
├── programs/
│   └── page.tsx               # Programs CRUD
├── cohorts/                   # NEW
│   └── page.tsx               # Manage cohorts per program
├── content/
│   └── page.tsx               # Course content management
├── lecturers/                 # NEW
│   └── page.tsx               # Lecturer management
├── certificates/              # NEW
│   └── page.tsx               # Certificate issuance
├── attendance/                # NEW
│   └── page.tsx               # Attendance overview
├── reports/                   # NEW
│   └── page.tsx               # Analytics & reports
├── website/                   # NEW
│   ├── page.tsx               # Landing page content
│   ├── team/
│   │   └── page.tsx           # Team members
│   ├── events/
│   │   └── page.tsx           # Events management  
│   ├── testimonials/
│   │   └── page.tsx           # Testimonials
│   └── hero/
│       └── page.tsx           # Hero & sections
├── settings/
│   └── page.tsx               # System settings
└── receipts/
    └── page.tsx               # Payment receipts
```

---

### Admin Features Detail

#### 4.1 Student Management

| Feature | Description |
|---------|-------------|
| View all students | Searchable, filterable list |
| Student profile view | Full details, enrollment history, payments |
| Approve/suspend students | Toggle approval status |
| Send messages | Email/notification to students |
| Export student list | CSV/Excel export |

#### 4.2 Enrollment Management

| Feature | Description |
|---------|-------------|
| Pending enrollments queue | List awaiting approval |
| Bulk approve | Approve multiple at once |
| View application details | Motivation, scholarship request |
| Assign to cohort | Place student in specific cohort |
| Reject with reason | Send rejection feedback |

#### 4.3 Payment Management

| Feature | Description |
|---------|-------------|
| Pending payments | Awaiting confirmation |
| Confirm payment | Mark as paid, record reference |
| Partial payments | Track payment plans |
| Generate receipt | PDF receipt generation |
| Payment history | Full transaction log |
| Refund recording | Record refunds |

#### 4.4 Program Management

| Feature | Description |
|---------|-------------|
| Create program | Full program details form |
| Edit program | Update any field |
| Program image upload | Cover image |
| Assign lecturers | Link lecturers to programs |
| Set pricing | Price, currency, payment options |
| Define outcomes | Learning outcomes list |
| Activate/deactivate | Toggle visibility |

#### 4.5 Cohort Management (NEW)

| Feature | Description |
|---------|-------------|
| Create cohort | Per program cohorts |
| Set schedule | Start/end dates |
| Capacity management | Max students |
| View enrolled students | Per cohort list |
| Cohort progress | Overall cohort metrics |

#### 4.6 Lecturer Management (NEW)

| Feature | Description |
|---------|-------------|
| Add lecturer | Create lecturer account |
| Assign programs | Link to specific programs |
| Set as lead | Designate lead lecturer |
| View lecturer load | How many programs assigned |
| Activity monitoring | Teaching activity metrics |

#### 4.7 Course Content Management

| Feature | Description |
|---------|-------------|
| Create lessons | All lesson types |
| Upload videos | Video hosting/embedding |
| Upload documents | PDFs, slides |
| Create quizzes | Question builder |
| Create assignments | Assignment specifications |
| Reorder content | Drag-drop ordering |
| Preview as student | View as student would |

#### 4.8 Certificate Management (NEW)

| Feature | Description |
|---------|-------------|
| Pending certificates | Awaiting issuance |
| Issue certificate | Generate with unique number |
| View issued | All issued certificates |
| Revoke certificate | Cancel if needed |
| Verify certificate | Public verification |

#### 4.9 Website Content Management (NEW)

| Section | Editable Elements |
|---------|-------------------|
| **Hero Section** | Title, subtitle, background image, CTA text |
| **About Section** | Mission, vision, "why we exist" text |
| **Values Section** | Each value card (icon, title, description) |
| **Founder Section** | Bio, achievements, photo, quotes |
| **Team Section** | Add/edit/remove team members |
| **Programs Display** | Order, featured programs |
| **Events** | Add/edit/delete events |
| **Testimonials** | Add/edit/delete testimonials |
| **Contact Info** | Address, phone, email, hours |
| **Footer** | Links, social media, copyright text |

---

## 5. Lecturer Dashboard

### Dashboard Overview

**Purpose**: Manage assigned programs, content, and student performance

| Widget | Data Displayed |
|--------|----------------|
| My Programs | Programs assigned to this lecturer |
| Active Students | Students in their programs |
| Pending Submissions | Assignments awaiting grading |
| Upcoming Sessions | Scheduled classes |
| Recent Activity | Latest student activity in their courses |

---

### Lecturer Pages Structure

```
/lecturer
├── page.tsx                    # Dashboard overview
├── programs/
│   └── page.tsx               # My assigned programs
├── content/
│   ├── page.tsx               # Content management
│   ├── lessons/
│   │   └── page.tsx           # Create/edit lessons
│   ├── quizzes/
│   │   └── page.tsx           # Create/edit quizzes
│   └── assignments/
│       └── page.tsx           # Create/edit assignments
├── students/
│   └── page.tsx               # Students in my programs
├── grading/                   
│   ├── page.tsx               # Submissions to grade
│   └── [submissionId]/
│       └── page.tsx           # Grade individual submission
├── attendance/
│   └── page.tsx               # Mark attendance
├── certificates/
│   └── page.tsx               # Recommend students
├── profile/
│   └── page.tsx               # My profile
└── announcements/
    └── page.tsx               # Post announcements
```

---

### Lecturer Features Detail

#### 5.1 Program View

| Feature | Description |
|---------|-------------|
| View assigned programs | See all programs they teach |
| Program details | View full program info |
| Student roster | List of enrolled students |
| Cohort management | View cohorts they're assigned to |

#### 5.2 Content Creation

| Feature | Description |
|---------|-------------|
| Create lessons | Text, video, mixed content |
| Upload materials | PDFs, slides, documents |
| Embed videos | YouTube, Vimeo, direct upload |
| Create quizzes | Multiple question types |
| Import questions | Bulk question import |
| Create assignments | With rubrics and instructions |
| Set due dates | Per assignment scheduling |

#### 5.3 Student Management (Limited)

| Feature | Description |
|---------|-------------|
| View enrolled students | Only in their programs |
| Student progress | Individual progress tracking |
| Contact student | Send messages |
| View submissions | All student work |

#### 5.4 Grading

| Feature | Description |
|---------|-------------|
| Pending queue | Submissions awaiting grades |
| Grade submission | Score and feedback |
| Rubric-based grading | If rubric defined |
| Return for revision | Request resubmission |
| Bulk grading | Grade multiple at once |
| Grade analytics | Class performance overview |

#### 5.5 Attendance

| Feature | Description |
|---------|-------------|
| Mark attendance | Per session attendance |
| Bulk attendance | Mark all present then edit |
| Add notes | Late reasons, etc. |
| Attendance reports | Per student, per session |

#### 5.6 Certificate Recommendations

| Feature | Description |
|---------|-------------|
| View completed students | Students who finished program |
| Recommend for certification | Submit to admin |
| Add recommendations | Notes for admin |

---

## 6. Student Dashboard

### Dashboard Overview

**Purpose**: Track learning progress, access courses, manage account

| Widget | Data Displayed |
|--------|----------------|
| My Courses | Enrolled programs |
| Current Progress | Overall completion percentage |
| Upcoming Deadlines | Assignment/quiz due dates |
| Announcements | Latest announcements |
| Payment Status | Outstanding balance if any |
| Certificates | Earned certificates |

---

### Student Pages Structure

```
/dashboard
├── page.tsx                    # Dashboard overview
├── courses/
│   ├── page.tsx               # My courses list
│   └── [programSlug]/
│       ├── page.tsx           # Course overview
│       └── lessons/
│           └── [lessonSlug]/
│               └── page.tsx   # Lesson view
├── assignments/
│   ├── page.tsx               # All my assignments
│   └── [assignmentId]/
│       └── page.tsx           # Submit assignment
├── quizzes/
│   ├── page.tsx               # All quizzes
│   └── [quizId]/
│       └── page.tsx           # Take quiz
├── progress/
│   └── page.tsx               # Progress tracking
├── grades/                    # NEW
│   └── page.tsx               # My grades
├── certificates/
│   └── page.tsx               # My certificates
├── payments/
│   └── page.tsx               # Payment history
├── profile/
│   └── page.tsx               # My profile
└── announcements/
    └── page.tsx               # View announcements
```

---

### Student Features Detail

#### 6.1 Course Access

| Feature | Description |
|---------|-------------|
| View enrolled courses | All active enrollments |
| Course overview | Progress, lessons, schedule |
| Access lessons | View/complete lessons |
| Download materials | PDFs, resources |
| Track video progress | Resume where left off |

#### 6.2 Assignments

| Feature | Description |
|---------|-------------|
| View assignments | All pending/completed |
| Submit assignment | Upload files, write responses |
| View feedback | See grades and comments |
| Resubmit | If allowed by lecturer |
| Track due dates | Calendar view |

#### 6.3 Quizzes

| Feature | Description |
|---------|-------------|
| View available quizzes | All quizzes in courses |
| Take quiz | Timed quiz interface |
| View results | Score and correct answers |
| Retake | If attempts remaining |
| Quiz history | Past attempts |

#### 6.4 Progress Tracking

| Feature | Description |
|---------|-------------|
| Overall progress | % complete per course |
| Lesson completion | Check off completed |
| Time spent | Learning time tracking |
| Achievements | Badges, milestones |

#### 6.5 Grades (NEW)

| Feature | Description |
|---------|-------------|
| View all grades | Assignments and quizzes |
| Grade breakdown | Per course, per type |
| Current GPA/average | Overall performance |
| Feedback history | All lecturer comments |

#### 6.6 Certificates

| Feature | Description |
|---------|-------------|
| View certificates | All earned certificates |
| Download PDF | Certificate document |
| Share certificate | LinkedIn, social |
| Verification link | Public verification URL |

#### 6.7 Payments

| Feature | Description |
|---------|-------------|
| Payment history | All transactions |
| Outstanding balance | Amount due |
| Download receipts | PDF receipts |
| Payment instructions | How to pay |

#### 6.8 Profile

| Feature | Description |
|---------|-------------|
| Edit profile | Name, phone, city |
| Change password | Security settings |
| Upload avatar | Profile photo |
| Notification settings | Email preferences |

---

## 7. Dynamic Landing Page Content

### Content Management by Section

#### Hero Section
```typescript
{
  section: 'hero',
  fields: {
    title: 'Master the Word',
    title_highlight: 'Shape the World',
    subtitle: 'Where voices become leaders...',
    background_image: '/hero-bg.jpg',
    cta_primary_text: 'Start Your Journey',
    cta_primary_link: '/apply',
    cta_secondary_text: 'View Programs',
    cta_secondary_link: '/programs',
    stats: [
      { value: '500+', label: 'Students Trained' },
      { value: '6', label: 'Programs' },
      { value: '95%', label: 'Success Rate' }
    ]
  }
}
```

#### About Section
```typescript
{
  section: 'about',
  fields: {
    mission: 'Full mission text...',
    vision: 'Full vision text...',
    why_we_exist: 'Full why text...',
    image: '/about-image.jpg'
  }
}
```

#### Values Section
```typescript
{
  section: 'values',
  fields: {
    title: 'Our Core Values',
    items: [
      { icon: 'Mic', title: 'Voice Above All', description: '...' },
      // ... more values
    ]
  }
}
```

#### Founder Section
```typescript
{
  section: 'founder',
  fields: {
    name: 'Charline Prezen Chikomo',
    title: 'Founder & Lead Instructor',
    short_bio: '...',
    full_bio: '...',
    image: '/founder.jpg',
    achievements: ['Achievement 1', '...'],
    quotes: ['Quote 1', '...']
  }
}
```

#### Programs Display (Dynamic from programs table)
- Order controlled by `order_index`
- Featured programs marked with `is_featured`
- Display 3-6 on homepage

#### Team Section (Dynamic from team_members table)
- Order controlled by `order_index`
- Founder shown separately
- Photos from `image_url`

#### Events Section (Dynamic from events table)
- Show upcoming events only
- Auto-archive past events
- Registration links

#### Testimonials (Dynamic from testimonials table)
- Rotating carousel
- Order by `order_index`
- Filter by `is_active`

#### Contact Information
```typescript
{
  section: 'contact',
  fields: {
    address: 'Address text',
    phone: '+263...',
    email: 'info@commlead...',
    hours: 'Mon-Fri 8AM-5PM',
    social: {
      facebook: 'url',
      twitter: 'url',
      linkedin: 'url',
      instagram: 'url'
    }
  }
}
```

---

## 8. Content Upload Workflows

### Who Uploads What

| Content Type | Primary Uploader | Secondary | Location |
|--------------|------------------|-----------|----------|
| **Program Details** | Admin | - | Admin → Programs |
| **Program Images** | Admin | - | Admin → Programs |
| **Lesson Content** | Lecturer | Admin | Lecturer → Content |
| **Lesson Videos** | Lecturer | Admin | Lecturer → Content |
| **Lesson Documents** | Lecturer | Admin | Lecturer → Content |
| **Quiz Questions** | Lecturer | Admin | Lecturer → Quizzes |
| **Assignments** | Lecturer | Admin | Lecturer → Assignments |
| **Assignment Submissions** | Student | - | Student → Assignments |
| **Team Member Photos** | Admin | - | Admin → Website → Team |
| **Event Images** | Admin | - | Admin → Website → Events |
| **Testimonials** | Admin | - | Admin → Website → Testimonials |
| **Hero Background** | Admin | - | Admin → Website → Hero |
| **Student Avatar** | Student | - | Student → Profile |
| **Lecturer Avatar** | Lecturer | Admin | Lecturer → Profile |

### Storage Structure

```
supabase-storage/
├── images/
│   ├── programs/
│   │   └── {program-slug}-cover.jpg
│   ├── team/
│   │   └── {member-id}.jpg
│   ├── events/
│   │   └── {event-id}.jpg
│   ├── testimonials/
│   │   └── {testimonial-id}.jpg
│   ├── avatars/
│   │   └── {user-id}.jpg
│   └── hero/
│       └── background.jpg
├── videos/
│   └── lessons/
│       └── {lesson-id}/
│           └── video.mp4
├── documents/
│   └── lessons/
│       └── {lesson-id}/
│           └── {filename}.pdf
├── submissions/
│   └── {assignment-id}/
│       └── {student-id}/
│           └── {filename}
└── certificates/
    └── {certificate-id}.pdf
```

### Upload Process Flows

#### Lesson Video Upload (Lecturer)
```
1. Lecturer opens Content → Lessons
2. Creates new lesson or edits existing
3. Selects "Video Lesson" type
4. Either:
   a. Uploads video file → stored in storage/videos/lessons/
   b. Enters YouTube/Vimeo embed URL
5. Saves lesson (is_published = false by default)
6. Previews lesson
7. Publishes lesson (is_published = true)
```

#### Assignment Submission (Student)
```
1. Student views assignment details
2. Clicks "Submit Assignment"
3. Either:
   a. Types written response
   b. Uploads files (max 5, max 10MB each)
4. Reviews submission
5. Confirms submission (cannot edit after)
6. Status changes to 'submitted'
7. Lecturer receives notification
```

#### Team Member Addition (Admin)
```
1. Admin → Website → Team
2. Clicks "Add Team Member"
3. Fills form: name, role, bio
4. Uploads photo → stored in storage/images/team/
5. Sets order and founder status
6. Saves (is_active = true by default)
7. Appears on public team page immediately
```

---

## 9. Row Level Security (RLS) Policies

### Profiles Table

```sql
-- Anyone can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Prevent users from changing their own role
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- Admins can read all profiles
CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update profiles (including role)
CREATE POLICY "Admins update profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Lecturers can view students in their programs
CREATE POLICY "Lecturers view program students"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers pl
      JOIN enrollments e ON e.program_id = pl.program_id
      WHERE pl.lecturer_id = auth.uid()
      AND e.user_id = profiles.id
    )
  );
```

### Lessons Table

```sql
-- Public can view published lessons in active programs (for preview)
CREATE POLICY "Public view free preview lessons"
  ON lessons FOR SELECT
  USING (
    is_published = TRUE 
    AND is_free_preview = TRUE
  );

-- Enrolled students can view lessons
CREATE POLICY "Enrolled students view lessons"
  ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.user_id = auth.uid()
      AND e.program_id = lessons.program_id
      AND e.status = 'approved'
      AND e.payment_status = 'confirmed'
    )
  );

-- Lecturers can manage lessons in their programs
CREATE POLICY "Lecturers manage lessons"
  ON lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers pl
      WHERE pl.lecturer_id = auth.uid()
      AND pl.program_id = lessons.program_id
    )
  );

-- Admins can manage all lessons
CREATE POLICY "Admins manage lessons"
  ON lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
```

### Assignment Submissions Table

```sql
-- Students can create and read own submissions
CREATE POLICY "Students manage own submissions"
  ON assignment_submissions FOR ALL
  USING (student_id = auth.uid());

-- Lecturers can read and update submissions in their programs
CREATE POLICY "Lecturers grade submissions"
  ON assignment_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN program_lecturers pl ON pl.program_id = a.program_id
      WHERE a.id = assignment_submissions.assignment_id
      AND pl.lecturer_id = auth.uid()
    )
  );

-- Admins can manage all submissions
CREATE POLICY "Admins manage submissions"
  ON assignment_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
```

### Website Content (Public Read, Admin Write)

```sql
-- Anyone can read website content
CREATE POLICY "Public read website content"
  ON website_content FOR SELECT
  USING (is_active = TRUE);

-- Only admins can manage website content
CREATE POLICY "Admins manage website content"
  ON website_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
```

---

## 10. Implementation Roadmap

### Phase 1: Database Foundation (Week 1)

| Task | Priority | Effort |
|------|----------|--------|
| Create new migration file | High | 2 hrs |
| Add lecturer role to enum | High | 30 min |
| Fix profiles table (add email) | High | 1 hr |
| Create cohorts table | High | 1 hr |
| Create program_lecturers table | High | 1 hr |
| Update lessons table | Medium | 1 hr |
| Create assignments table | High | 1 hr |
| Create assignment_submissions table | High | 1 hr |
| Create quizzes table | Medium | 1 hr |
| Create quiz_questions table | Medium | 1 hr |
| Create quiz_attempts table | Medium | 1 hr |
| Create attendance table | Medium | 1 hr |
| Create certificates table | High | 1 hr |
| Create announcements table | Medium | 1 hr |
| Update website_content table | Medium | 1 hr |
| Implement all RLS policies | High | 4 hrs |

### Phase 2: Core Admin Features (Week 2)

| Task | Priority | Effort |
|------|----------|--------|
| Update admin layout/navigation | High | 2 hrs |
| Fix student management page | High | 3 hrs |
| Fix enrollment management | High | 3 hrs |
| Fix payment management | High | 3 hrs |
| Add lecturer management | High | 4 hrs |
| Add cohort management | Medium | 3 hrs |
| Add certificate management | Medium | 3 hrs |

### Phase 3: Lecturer Dashboard (Week 3)

| Task | Priority | Effort |
|------|----------|--------|
| Create lecturer layout | High | 2 hrs |
| Lecturer dashboard home | High | 3 hrs |
| My programs page | High | 3 hrs |
| Content management | High | 6 hrs |
| Quiz builder | Medium | 6 hrs |
| Assignment builder | High | 4 hrs |
| Grading interface | High | 6 hrs |
| Attendance marking | Medium | 3 hrs |

### Phase 4: Student Dashboard Fixes (Week 4)

| Task | Priority | Effort |
|------|----------|--------|
| Fix course listing | High | 2 hrs |
| Lesson viewer | High | 4 hrs |
| Assignment submission | High | 4 hrs |
| Quiz taking interface | Medium | 6 hrs |
| Grades page | Medium | 3 hrs |
| Certificates page | Medium | 3 hrs |
| Profile update | Low | 2 hrs |

### Phase 5: Website Content Management (Week 5)

| Task | Priority | Effort |
|------|----------|--------|
| Admin → Website section | High | 2 hrs |
| Hero editor | High | 3 hrs |
| About editor | Medium | 2 hrs |
| Values editor | Medium | 3 hrs |
| Team management | High | Already exists |
| Events management | High | Already exists |
| Testimonials management | Medium | 3 hrs |
| Contact info editor | Medium | 2 hrs |
| Update landing page components to use DB | High | 6 hrs |

### Phase 6: Testing & Polish (Week 6)

| Task | Priority | Effort |
|------|----------|--------|
| Test all RLS policies | High | 4 hrs |
| Test all CRUD operations | High | 4 hrs |
| Fix edge cases | High | 8 hrs |
| Mobile responsiveness | Medium | 4 hrs |
| Error handling | High | 3 hrs |
| Loading states | Medium | 2 hrs |

---

## Summary: Key Decisions

### 1. Role Structure
- **4 roles**: super_admin, admin, lecturer, student
- Super admin can manage other admins
- Lecturers are assigned to specific programs

### 2. Content Ownership
- **Admin creates**: Programs, cohorts, website content, team, events
- **Lecturer creates**: Lessons, quizzes, assignments (in assigned programs)
- **Student creates**: Submissions, quiz attempts

### 3. Course Structure
```
Program
├── Cohort (time-bound group of students)
├── Lesson
│   ├── Content (text, video)
│   ├── Quiz
│   └── Assignment
└── Enrolled Students
```

### 4. Payment Flow
```
Student applies → Admin approves → Student pays → Admin confirms → Access granted
```

### 5. Certification Flow
```
Student completes course → Lecturer recommends → Admin issues certificate
```

### 6. Dynamic Website
- All landing page content editable through admin panel
- Falls back to constants.ts if database empty
- Real-time updates when admin saves changes

---

## Final Decisions (Confirmed)

| Question | Decision |
|----------|----------|
| **Lecturers payment** | Staff accounts - payment handled outside system |
| **Scheduling model** | Cohort-based scheduling (not self-paced) |
| **Quizzes requirement** | Required only if lecturer uploads them to a lesson |
| **Certificate delivery** | Manually sent via email by admin (not on portal) |
| **Student visibility** | Students can see other cohort members (names only, no details) |
| **Student messaging** | NOT needed - no forums or direct messaging |
| **Payment integration** | NONE - payments via WhatsApp POP, admin confirms manually |
| **Video tracking** | NOT needed - no watch time compliance |

### Simplified Features Based on Decisions

**Removed from scope:**
- ❌ Payment gateway integration
- ❌ Certificate download portal
- ❌ Video watch time tracking
- ❌ Student messaging/forums
- ❌ Lecturer payment tracking

**Simplified:**
- ✅ Payments: Admin manually marks as "confirmed" after receiving WhatsApp POP
- ✅ Certificates: Admin uploads and sends via email (external process)
- ✅ Quizzes: Optional per lesson (lecturer decides)
- ✅ Cohorts: Students grouped, can see classmate names

---

*Document created: February 24, 2026*
*Last updated: February 24, 2026*
*Author: Development Team*
