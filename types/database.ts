// ═══════════════════════════════════════════════════════════════════════════
// COMMLEAD ACADEMY - DATABASE TYPE DEFINITIONS
// Version: 2.0 (February 2026)
// Auto-generated to match Supabase schema
// ═══════════════════════════════════════════════════════════════════════════

// ─── ENUMS ─────────────────────────────────────────────────────────────────

export type UserRole = "student" | "lecturer" | "admin" | "super_admin";
export type EnrollmentStatus = "pending" | "approved" | "rejected" | "suspended" | "completed";
export type LessonProgressStatus = "not_started" | "in_progress" | "completed";
export type CertificateStatus = "pending" | "approved" | "issued" | "revoked";
export type AnnouncementPriority = "low" | "normal" | "high" | "urgent";
export type StudentLevel = "beginner" | "intermediate" | "advanced";
export type PaymentMethod = "ecocash" | "innbucks" | "bank_transfer" | "cash" | "other";
export type PaymentStatus = "pending" | "confirmed" | "failed" | "refunded";
export type LessonType = "video" | "text" | "quiz" | "assignment" | "mixed";
export type AssignmentStatus = "pending" | "submitted" | "graded" | "returned";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";

// ─── TABLE ROW TYPES ───────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  specialization: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  description: string | null;
  duration: string | null;
  duration_weeks: number | null;
  delivery_mode: string;
  schedule: string | null;
  target_audience: string | null;
  price: number;
  currency: string;
  payment_options: string | null;
  outcomes: string[];
  certification: string | null;
  level: StudentLevel;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
  cover_image_url: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Cohort {
  id: string;
  program_id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  max_students: number;
  is_active: boolean;
  is_enrollment_open: boolean;
  created_at: string;
  // Joined relations
  program?: Program;
}

export interface ProgramLecturer {
  id: string;
  program_id: string;
  lecturer_id: string;
  is_lead: boolean;
  assigned_at: string;
  // Joined relations
  program?: Program;
  lecturer?: Profile;
}

export interface CohortLecturer {
  id: string;
  cohort_id: string;
  lecturer_id: string;
  is_lead: boolean;
  assigned_at: string;
  // Joined relations
  cohort?: Cohort;
  lecturer?: Profile;
}

// ─── COHORT CONTENT TYPES ─────────────────────────────────────────────────

export interface CohortAnnouncement {
  id: string;
  cohort_id: string;
  lecturer_id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  // Joined relations
  cohort?: Cohort;
  lecturer?: Profile;
}

export interface CohortMaterial {
  id: string;
  cohort_id: string;
  lecturer_id: string;
  title: string;
  description: string | null;
  material_type: 'notes' | 'slides' | 'video' | 'document' | 'link' | 'other';
  file_url: string | null;
  external_url: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined relations
  cohort?: Cohort;
  lecturer?: Profile;
}

export interface CohortTask {
  id: string;
  cohort_id: string;
  lecturer_id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  due_date: string | null;
  points: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined relations
  cohort?: Cohort;
  lecturer?: Profile;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  student_id: string;
  content: string | null;
  file_url: string | null;
  submitted_at: string;
  grade: number | null;
  feedback: string | null;
  graded_at: string | null;
  graded_by: string | null;
  status: 'submitted' | 'graded' | 'returned' | 'resubmitted';
  // Joined relations
  task?: CohortTask;
  student?: Profile;
  grader?: Profile;
}

export interface Enrollment {
  id: string;
  user_id: string;  // Changed from student_id to match database column
  program_id: string;
  cohort_id: string | null;
  status: EnrollmentStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  amount_paid: number;
  amount_due: number;
  is_scholarship: boolean;
  motivation: string | null;
  progress_percentage: number;
  enrolled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  program?: Program;
  cohort?: Cohort;
  student?: Profile;
}

export interface PaymentLog {
  id: string;
  enrollment_id: string | null;
  user_id: string | null;
  amount: number;
  currency: string;
  method: PaymentMethod | null;
  status: PaymentStatus;
  reference: string | null;
  pop_description: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  notes: string | null;
  created_at: string;
  // Joined relations
  enrollment?: Enrollment;
  user?: Profile;
  confirmed_by_user?: Profile;
}

export interface Lesson {
  id: string;
  program_id: string;
  created_by: string | null;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  attachments: LessonAttachment[];
  lesson_type: LessonType;
  order_index: number;
  estimated_duration: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined relations
  program?: Program;
  creator?: Profile;
}

export interface LessonAttachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  status: LessonProgressStatus;
  completed_at: string | null;
  created_at: string;
  // Joined relations
  lesson?: Lesson;
  user?: Profile;
}

export interface Assignment {
  id: string;
  lesson_id: string | null;
  program_id: string;
  cohort_id: string | null;
  created_by: string | null;
  title: string;
  description: string;
  instructions: string | null;
  due_date: string | null;
  points: number;
  max_score: number;
  passing_score: number;
  submission_type: "file" | "text" | "link";
  allowed_file_types: string[];
  allow_late_submission: boolean;
  late_penalty_percent: number;
  attachments: LessonAttachment[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined relations
  lesson?: Lesson;
  program?: Program;
  cohort?: Cohort;
  creator?: Profile;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string | null;
  file_url: string | null;
  link_url: string | null;
  attachments: SubmissionAttachment[];
  status: AssignmentStatus;
  submitted_at: string | null;
  score: number | null;
  grade: number | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  assignment?: Assignment;
  student?: Profile;
  grader?: Profile;
}

// Alias for convenience
export type Submission = AssignmentSubmission;

export interface SubmissionAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  program_id: string;
  created_by: string | null;
  title: string;
  description: string | null;
  time_limit_minutes: number | null;
  passing_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  show_answers_after: boolean;
  is_published: boolean;
  created_at: string;
  // Joined relations
  lesson?: Lesson;
  program?: Program;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  options: QuizOption[];
  correct_answer: string | null;
  points: number;
  explanation: string | null;
  order_index: number;
  created_at: string;
}

export interface QuizOption {
  text: string;
  is_correct: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Record<string, string | string[]>;
  score: number | null;
  max_score: number | null;
  percentage: number | null;
  passed: boolean | null;
  started_at: string;
  completed_at: string | null;
  time_taken_seconds: number | null;
  // Joined relations
  quiz?: Quiz;
  student?: Profile;
}

export interface Attendance {
  id: string;
  cohort_id: string;
  student_id: string;
  session_date: string;
  session_time: string | null;
  status: AttendanceStatus;
  notes: string | null;
  marked_by: string | null;
  created_at: string;
  // Joined relations
  cohort?: Cohort;
  student?: Profile;
  marker?: Profile;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target_audience: string;
  program_id: string | null;
  cohort_id: string | null;
  is_pinned: boolean;
  priority: AnnouncementPriority;
  expires_at: string | null;
  created_by: string;
  created_at: string;
  // Joined relations
  program?: Program;
  cohort?: Cohort;
  creator?: Profile;
}

export interface Certificate {
  id: string;
  student_id: string;
  enrollment_id: string;
  program_id: string;
  certificate_number: string;
  status: CertificateStatus;
  issued_at: string | null;
  issued_by: string | null;
  recommended_by: string | null;
  certificate_url: string | null;
  pdf_url: string | null;
  verification_code: string | null;
  created_at: string;
  // Joined relations
  student?: Profile;
  enrollment?: Enrollment;
  program?: Program;
  issuer?: Profile;
  recommender?: Profile;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  short_bio: string | null;
  image_url: string | null;
  headshot_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  order_index: number;
  is_founder: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  date: string;
  time: string | null;
  location: string | null;
  is_virtual: boolean;
  registration_link: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  student_name: string | null;
  role: string | null;
  company: string | null;
  content: string;
  quote: string | null;
  program: string | null;
  image_url: string | null;
  rating: number;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface WebsiteContent {
  id: string;
  section: string;
  key: string;
  value: string | null;
  value_json: Record<string, unknown> | unknown[] | null;
  media_url: string | null;
  order_index: number;
  is_active: boolean;
  updated_by: string | null;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  responded_at: string | null;
  created_at: string;
}

// ─── HELPER TYPES ──────────────────────────────────────────────────────────

// For creating new records (omit auto-generated fields)
export type NewProfile = Omit<Profile, "id" | "created_at" | "updated_at">;
export type NewProgram = Omit<Program, "id" | "created_at" | "updated_at">;
export type NewCohort = Omit<Cohort, "id" | "created_at" | "program">;
export type NewEnrollment = Omit<Enrollment, "id" | "created_at" | "updated_at" | "program" | "cohort" | "user">;
export type NewLesson = Omit<Lesson, "id" | "created_at" | "updated_at" | "program" | "creator">;
export type NewAssignment = Omit<Assignment, "id" | "created_at" | "updated_at" | "lesson" | "program" | "creator">;
export type NewQuiz = Omit<Quiz, "id" | "created_at" | "lesson" | "program" | "questions">;
export type NewTeamMember = Omit<TeamMember, "id" | "created_at">;
export type NewEvent = Omit<Event, "id" | "created_at">;
export type NewTestimonial = Omit<Testimonial, "id" | "created_at">;

// For updates (partial records)
export type UpdateProfile = Partial<Omit<Profile, "id" | "email" | "created_at" | "updated_at">>;
export type UpdateProgram = Partial<Omit<Program, "id" | "created_at" | "updated_at">>;
export type UpdateEnrollment = Partial<Omit<Enrollment, "id" | "user_id" | "created_at" | "updated_at">>;
export type UpdateLesson = Partial<Omit<Lesson, "id" | "program_id" | "created_at" | "updated_at">>;

// ─── DATABASE SCHEMA (for Supabase client typing) ──────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string; full_name: string };
        Update: Partial<Profile>;
      };
      programs: {
        Row: Program;
        Insert: Partial<Program> & { name: string; slug: string };
        Update: Partial<Program>;
      };
      cohorts: {
        Row: Cohort;
        Insert: Partial<Cohort> & { program_id: string; name: string; start_date: string };
        Update: Partial<Cohort>;
      };
      program_lecturers: {
        Row: ProgramLecturer;
        Insert: Partial<ProgramLecturer> & { program_id: string; lecturer_id: string };
        Update: Partial<ProgramLecturer>;
      };
      enrollments: {
        Row: Enrollment;
        Insert: Partial<Enrollment> & { user_id: string };
        Update: Partial<Enrollment>;
      };
      payment_logs: {
        Row: PaymentLog;
        Insert: Partial<PaymentLog> & { amount: number };
        Update: Partial<PaymentLog>;
      };
      lessons: {
        Row: Lesson;
        Insert: Partial<Lesson> & { program_id: string; title: string; slug: string };
        Update: Partial<Lesson>;
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: Partial<LessonProgress> & { user_id: string; lesson_id: string };
        Update: Partial<LessonProgress>;
      };
      assignments: {
        Row: Assignment;
        Insert: Partial<Assignment> & { lesson_id: string; program_id: string; title: string; description: string };
        Update: Partial<Assignment>;
      };
      assignment_submissions: {
        Row: AssignmentSubmission;
        Insert: Partial<AssignmentSubmission> & { assignment_id: string; student_id: string };
        Update: Partial<AssignmentSubmission>;
      };
      quizzes: {
        Row: Quiz;
        Insert: Partial<Quiz> & { lesson_id: string; program_id: string; title: string };
        Update: Partial<Quiz>;
      };
      quiz_questions: {
        Row: QuizQuestion;
        Insert: Partial<QuizQuestion> & { quiz_id: string; question_text: string };
        Update: Partial<QuizQuestion>;
      };
      quiz_attempts: {
        Row: QuizAttempt;
        Insert: Partial<QuizAttempt> & { quiz_id: string; student_id: string };
        Update: Partial<QuizAttempt>;
      };
      attendance: {
        Row: Attendance;
        Insert: Partial<Attendance> & { cohort_id: string; student_id: string; session_date: string };
        Update: Partial<Attendance>;
      };
      announcements: {
        Row: Announcement;
        Insert: Partial<Announcement> & { title: string; content: string; created_by: string };
        Update: Partial<Announcement>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Partial<TeamMember> & { name: string; role: string };
        Update: Partial<TeamMember>;
      };
      events: {
        Row: Event;
        Insert: Partial<Event> & { title: string; date: string };
        Update: Partial<Event>;
      };
      testimonials: {
        Row: Testimonial;
        Insert: Partial<Testimonial> & { name: string; content: string };
        Update: Partial<Testimonial>;
      };
      website_content: {
        Row: WebsiteContent;
        Insert: Partial<WebsiteContent> & { section: string; key: string };
        Update: Partial<WebsiteContent>;
      };
      contact_submissions: {
        Row: ContactSubmission;
        Insert: Partial<ContactSubmission> & { name: string; email: string; message: string };
        Update: Partial<ContactSubmission>;
      };
    };
    Enums: {
      user_role: UserRole;
      enrollment_status: EnrollmentStatus;
      student_level: StudentLevel;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      lesson_type: LessonType;
      assignment_status: AssignmentStatus;
      attendance_status: AttendanceStatus;
    };
  };
}
