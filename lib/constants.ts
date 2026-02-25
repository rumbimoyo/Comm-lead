// ─── Brand Constants ──────────────────────────────────────────────
export const BRAND = {
  name: "CommLead Academy",
  fullName: "COMMLEAD Academy — School of Advanced Communication and Leadership",
  tagline: "Master the Word, Shape the World",
  supportingPhrases: [
    "Speak. Lead. Transform.",
    "Beginners || Intermediate || Advanced",
    "Where Voices Become Leaders",
  ],
  mission: `COMMLEAD Academy exists to equip, empower, and transform a new generation of communicators, leaders, and professionals. We provide world-class training in advanced communication, leadership, and influence, cultivating confident voices, ethical decision-makers, and visionary thinkers. Our mission is to develop individuals who can communicate with clarity, lead with courage, inspire meaningful change, and shape communities, nations, and the world through the power of their words and actions.`,
  vision: `To raise the most influential and transformative communicators, leaders, and professionals—whose voices define eras, transform communities and nations, and inspire humanity to achieve its highest potential.`,
  whyWeExist: `In a world overflowing with information but starved of clarity, the power of words, whether speaking or writing, has never been more critical. Too often, ideas fail, leaders falter, and communities struggle—not because of a lack of vision, but because people cannot communicate it effectively through speaking or writing. Opportunities are missed, talents go unnoticed, and potential remains unrealized—not for lack of excellence, but for inability to express it.

We exist to change that. COMMLEAD Academy was founded to train a new generation of communicators, leaders, and professionals who can speak or write with confidence, think with courage, and act with impact. We empower our students to turn every idea into action, every voice into leadership, and every opportunity into achievement.

We believe that a single well-spoken or well-written word can inspire movements, a well-led team can transform nations, and a visionary leader can shape the course of history. Our purpose is to equip individuals with the skills, mindset, and influence to seize every opportunity and leave no talent unheard.

At COMMLEAD Academy, we don't just teach speaking or writing; we cultivate powerful voices, fearless thinkers, and changemakers who will define the future. We exist to ensure that the next generation doesn't just watch the world happen—they shape it, claim their place, and create impact that lasts.`,
  values: [
    {
      title: "Voice Above All",
      description:
        "We believe that your ability to speak or write clearly is your superpower—the bridge between your potential and your opportunities.",
      icon: "Mic",
    },
    {
      title: "Boldness in Action",
      description:
        "True leadership requires courage. We empower our students to think fearlessly, act decisively, and lead without hesitation.",
      icon: "Flame",
    },
    {
      title: "Words that Change Worlds",
      description:
        "Communication is only valuable when it sparks action. We teach students to transform ideas into influence and influence into tangible impact.",
      icon: "Globe",
    },
    {
      title: "Mastery in Motion",
      description:
        "Excellence is not a destination—it's a habit. We cultivate relentless growth, integrity, and mastery in both communication and leadership, ensuring every student's voice resonates at its highest potential.",
      icon: "Target",
    },
    {
      title: "Empathy as Strength",
      description:
        "Leadership is not just about speaking—it's about listening, understanding, and connecting. We develop leaders who influence with care and compassion.",
      icon: "Heart",
    },
    {
      title: "Opportunity Unlocked",
      description:
        "No talent should go unheard. We empower every student to seize opportunities, express their brilliance, and turn potential into achievement.",
      icon: "Key",
    },
  ],
} as const;

// ─── Founder Information ──────────────────────────────────────────
export const FOUNDER = {
  name: "Charline Prezen Chikomo",
  title: "Founder & Lead Instructor",
  shortBio: `A graduate, scholar, leader, author, and mentor who transformed from a village boy looking after cows to winning the world's most prestigious scholarships including the Mandela Centennial Scholarship and Mandela Rhodes Scholarship.`,
  fullBio: `I was born and raised in a low-income family in a small village, where the prospect of achieving anything beyond the ordinary seemed impossible. I remember dropping out of school, believing that my life would be limited to looking after my father's cows, marrying young, and remaining "just someone from the village." Opportunities felt distant, and my dreams even more so.

But everything changed the day I pitched an idea to a stranger—someone who believed in me and supported my education. That moment unlocked a path I had never imagined. I went on to become one of the top A-Level students in my country, achieving straight As. My teachers encouraged me to step into public speaking and debate, ultimately leading me to represent my peers in the Zimbabwe Junior Parliament. Later, programs like the United States Achievers Program taught me the power of storytelling, how to share my journey, and open doors to opportunities I never thought possible. These experiences helped me win some of the world's most prestigious scholarships, including the Mandela Centennial Scholarship and the Mandela Rhodes Scholarship, at leading institutions such as the African Leadership University and the University of Cape Town.

Today, I am a graduate, a scholar, a leader, an author, and a mentor to many aspiring speakers and writers. What changed my life was not talent alone, or even hard work—it was the power of my voice, the ability to communicate confidently and authentically. I was never poor in spirit or potential—I was simply inarticulate, unable to express the best of what I had to offer.

COMMLEAD Academy exists because I do not want anyone else to suffer as I did—not because of a lack of ability, intelligence, or dreams, but because they cannot communicate them. This school is my life's mission: to empower every student to speak, write, and lead with confidence, so that no talent is wasted, no opportunity is missed, and no voice goes unheard.`,
  achievements: [
    "Mandela Centennial Scholarship Recipient",
    "Mandela Rhodes Scholar",
    "African Leadership University Graduate",
    "University of Cape Town Graduate",
    "Zimbabwe Junior Parliament Representative",
    "United States Achievers Program Alumnus",
    "Published Author",
  ],
  image: "/foundersimage.png",
} as const;

export const COLORS = {
  navy: "#0D3B7D",        // Academy Navy - Primary: Headers, buttons, bold icons, footer
  navyLight: "#1a5299",
  navyDark: "#092a5a",
  gold: "#EBBD48",        // SACL Gold - Accent: CTAs, highlights, borders
  goldLight: "#f0ce73",
  goldDark: "#d4a632",
  white: "#FDFDFD",       // Clean White - Background: Primary body background
  offWhite: "#F7F8FA",
  darkText: "#1A1A2E",
  mutedText: "#64748B",
} as const;

export const NAV_LINKS: { label: string; href: string; children?: { label: string; href: string }[] }[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Admissions", href: "/admissions" },
  { label: "Team", href: "/team", children: [
    { label: "Meet the Founder", href: "/team#founder" },
    { label: "Full Team", href: "/team#team" },
  ] },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];

// ─── What Students Can Expect ─────────────────────────────────────
export const STUDENT_EXPECTATIONS = [
  {
    title: "First-Class Experience",
    description: "Premium learning environment with world-class facilities and resources designed for excellence.",
    icon: "Crown",
  },
  {
    title: "Interactive Teaching",
    description: "Engaging, hands-on sessions where every student participates, practices, and receives personalized feedback.",
    icon: "Users",
  },
  {
    title: "Practical Exercises",
    description: "Real-world assignments, live presentations, and simulations that build confidence through action.",
    icon: "ClipboardCheck",
  },
  {
    title: "Personal Mentorship",
    description: "Direct access to experienced mentors who guide your growth and help you overcome challenges.",
    icon: "HeartHandshake",
  },
  {
    title: "Powerful Networking",
    description: "Connect with fellow students, alumni, and industry professionals who become lifelong allies.",
    icon: "Network",
  },
  {
    title: "Total Transformation",
    description: "Graduate as a confident communicator and leader ready to seize opportunities and create impact.",
    icon: "Sparkles",
  },
] as const;

// ─── Programs Data (Categorized by Level) ─────────────────────────
export const PROGRAM_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type ProgramLevel = typeof PROGRAM_LEVELS[number];

export const LEVEL_INFO = {
  beginner: {
    name: "Beginner",
    description: "Perfect for those just starting their communication journey. Build foundational skills and confidence.",
    color: "emerald",
  },
  intermediate: {
    name: "Intermediate", 
    description: "For those who have the basics and want to level up. Advanced techniques and deeper mastery.",
    color: "blue",
  },
  advanced: {
    name: "Advanced",
    description: "For experienced professionals seeking executive-level communication and leadership mastery.",
    color: "purple",
  },
} as const;

export const PROGRAMS_DATA = [
  // ─── BEGINNER LEVEL ─────────────────────────────────────────────
  {
    id: "1",
    name: "Foundations of Public Speaking",
    slug: "foundations-public-speaking",
    short_description:
      "Build unshakeable confidence and master the fundamentals of powerful speaking.",
    full_description:
      "Perfect for those starting their communication journey. This 6-week intensive covers the core building blocks: overcoming fear, vocal projection, body language basics, structuring your message, and delivering with confidence. Every session includes live practice with supportive feedback.",
    duration: "6 Weeks",
    delivery_mode: "In-Person",
    schedule: "Saturdays, 9AM - 12PM",
    target_audience: "Students, Young Professionals, Anyone seeking confidence",
    price: 100,
    currency: "USD",
    payment_options: "Full payment or 2 instalments",
    outcomes: [
      "Overcome stage fright and speak with confidence",
      "Master vocal projection and clarity",
      "Use body language to enhance your message",
      "Structure speeches that flow logically",
      "Handle nerves and think on your feet",
    ],
    certification: "CommLead Certificate in Public Speaking Foundations",
    level: "beginner" as const,
    is_active: true,
    image_url: null,
    order_index: 1,
  },
  {
    id: "2",
    name: "Business Writing Essentials",
    slug: "business-writing-essentials",
    short_description:
      "Learn to write emails, reports, and proposals that get results.",
    full_description:
      "Clear writing is clear thinking. This practical 4-week program teaches you to write professional emails, compelling reports, and persuasive proposals. Perfect for anyone who wants their written communication to be taken seriously.",
    duration: "4 Weeks",
    delivery_mode: "Online",
    schedule: "Wednesdays, 6PM - 8PM",
    target_audience: "Professionals, Students, Entrepreneurs",
    price: 60,
    currency: "USD",
    payment_options: "Full payment",
    outcomes: [
      "Write clear, concise professional emails",
      "Structure reports that inform and persuade",
      "Create proposals that win business",
      "Edit your writing for maximum impact",
      "Develop your professional writing voice",
    ],
    certification: "CommLead Certificate in Business Writing",
    level: "beginner" as const,
    is_active: true,
    image_url: null,
    order_index: 2,
  },
  {
    id: "3",
    name: "Youth Leadership Accelerator",
    slug: "youth-leadership-accelerator",
    short_description:
      "A dynamic program for young people ready to step into leadership and find their voice.",
    full_description:
      "Tailored for ambitious young people aged 16–25, this high-energy 6-week program builds confidence, public speaking skills, team leadership, and personal branding. Includes a final showcase where students present to an audience of professionals.",
    duration: "6 Weeks",
    delivery_mode: "In-Person",
    schedule: "Saturdays, 2PM - 5PM",
    target_audience: "Students, Recent Graduates, Young Professionals (16-25)",
    price: 80,
    currency: "USD",
    payment_options: "Full payment or scholarship",
    outcomes: [
      "Build unshakeable confidence",
      "Deliver a TED-style talk at the final showcase",
      "Develop personal branding and networking skills",
      "Lead group projects with clarity",
      "Join an alumni network of young leaders",
    ],
    certification: "CommLead Youth Leadership Certificate",
    level: "beginner" as const,
    is_active: true,
    image_url: null,
    order_index: 3,
  },

  // ─── INTERMEDIATE LEVEL ─────────────────────────────────────────
  {
    id: "4",
    name: "Advanced Public Speaking",
    slug: "advanced-public-speaking",
    short_description:
      "Take your speaking to the next level with advanced techniques and live practice.",
    full_description:
      "For those who have mastered the basics and want more. This 8-week program covers storytelling mastery, persuasion techniques, handling difficult audiences, impromptu speaking, and developing your unique speaking style. Intensive practice with video reviews.",
    duration: "8 Weeks",
    delivery_mode: "Hybrid",
    schedule: "Saturdays, 9AM - 1PM",
    target_audience: "Professionals, Speakers, Trainers",
    price: 180,
    currency: "USD",
    payment_options: "Full payment or 2 instalments",
    outcomes: [
      "Master storytelling that moves audiences",
      "Use advanced persuasion techniques ethically",
      "Handle Q&A and difficult audiences with grace",
      "Develop your signature speaking style",
      "Create presentations that inspire action",
    ],
    certification: "CommLead Advanced Speaking Certificate",
    level: "intermediate" as const,
    is_active: true,
    image_url: null,
    order_index: 4,
  },
  {
    id: "5",
    name: "Leadership & Influence",
    slug: "leadership-and-influence",
    short_description:
      "Develop the mindset, habits, and skills of transformative leaders who inspire action.",
    full_description:
      "This transformative 10-week program focuses on the intersection of leadership psychology and communication. Learn how to inspire teams, drive change, navigate conflict, and build influence in any organization or community.",
    duration: "10 Weeks",
    delivery_mode: "In-Person",
    schedule: "Wednesdays, 5PM - 8PM",
    target_audience: "Team Leaders, Managers, Aspiring Leaders",
    price: 200,
    currency: "USD",
    payment_options: "Full payment or 2 instalments",
    outcomes: [
      "Develop a transformative leadership style",
      "Build and lead high-performing teams",
      "Navigate conflict with emotional intelligence",
      "Influence decisions and drive organisational change",
      "Create a personal leadership manifesto",
    ],
    certification: "CommLead Leadership Certificate",
    level: "intermediate" as const,
    is_active: true,
    image_url: null,
    order_index: 5,
  },
  {
    id: "6",
    name: "Media & Digital Communication",
    slug: "media-digital-communication",
    short_description:
      "Learn to leverage digital platforms, media interviews, and content strategy for maximum impact.",
    full_description:
      "In today's digital-first world, leaders must communicate across multiple channels. This program covers social media strategy, podcast hosting, video content, press interviews, and personal brand building for the digital age.",
    duration: "6 Weeks",
    delivery_mode: "Online",
    schedule: "Mondays & Fridays, 7PM - 9PM",
    target_audience: "Content Creators, PR Professionals, Entrepreneurs",
    price: 150,
    currency: "USD",
    payment_options: "Full payment",
    outcomes: [
      "Build a powerful personal brand online",
      "Master media interview techniques",
      "Create compelling digital content strategies",
      "Leverage social media for professional influence",
      "Handle media crises with poise",
    ],
    certification: "CommLead Digital Communication Certificate",
    level: "intermediate" as const,
    is_active: true,
    image_url: null,
    order_index: 6,
  },

  // ─── ADVANCED LEVEL ─────────────────────────────────────────────
  {
    id: "7",
    name: "Executive Communication Mastery",
    slug: "executive-communication-mastery",
    short_description:
      "Sharpen your boardroom presence and strategic communication for senior leadership roles.",
    full_description:
      "Designed for senior professionals and executives, this 12-week intensive equips you with high-level communication frameworks used by Fortune 500 leaders. From boardroom negotiations to crisis communication, media interviews to stakeholder management — you'll master it all.",
    duration: "12 Weeks",
    delivery_mode: "Hybrid",
    schedule: "Tuesdays & Thursdays, 6PM - 8PM",
    target_audience: "Executives, Senior Managers, Directors, C-Suite",
    price: 350,
    currency: "USD",
    payment_options: "Full payment or 3 instalments",
    outcomes: [
      "Command boardroom conversations with authority",
      "Master crisis and stakeholder communication",
      "Develop executive presence and gravitas",
      "Lead high-stakes negotiations with confidence",
      "Build a leadership communication playbook",
    ],
    certification: "CommLead Executive Communication Diploma",
    level: "advanced" as const,
    is_active: true,
    image_url: null,
    order_index: 7,
  },
  {
    id: "8",
    name: "Corporate Communication Strategy",
    slug: "corporate-communication-strategy",
    short_description:
      "Design and implement communication strategies that drive business results.",
    full_description:
      "A comprehensive program for communication professionals and business leaders who need to design, execute, and measure communication strategies at the organizational level. Covers internal comms, external relations, brand messaging, and measurement frameworks.",
    duration: "10 Weeks",
    delivery_mode: "Hybrid",
    schedule: "Saturdays, 10AM - 2PM",
    target_audience: "Corporate Communicators, HR Leaders, Business Owners",
    price: 280,
    currency: "USD",
    payment_options: "Full payment or 3 instalments",
    outcomes: [
      "Design comprehensive communication strategies",
      "Measure communication ROI and impact",
      "Lead internal and external communication campaigns",
      "Build crisis communication plans",
      "Align communication with business objectives",
    ],
    certification: "CommLead Corporate Strategy Diploma",
    level: "advanced" as const,
    is_active: true,
    image_url: null,
    order_index: 8,
  },
  {
    id: "9",
    name: "Train the Trainer",
    slug: "train-the-trainer",
    short_description:
      "Learn to design and deliver transformative training programs that change lives.",
    full_description:
      "For experienced communicators who want to teach others. This intensive 8-week program covers instructional design, facilitation techniques, curriculum development, assessment strategies, and building a training business. Graduate ready to train others in communication excellence.",
    duration: "8 Weeks",
    delivery_mode: "In-Person",
    schedule: "Fridays, 2PM - 6PM",
    target_audience: "Trainers, Coaches, HR Professionals, Educators",
    price: 300,
    currency: "USD",
    payment_options: "Full payment or 2 instalments",
    outcomes: [
      "Design engaging training curricula",
      "Master facilitation and group dynamics",
      "Create assessments that measure growth",
      "Handle challenging participants gracefully",
      "Build your training business or career",
    ],
    certification: "CommLead Certified Trainer Diploma",
    level: "advanced" as const,
    is_active: true,
    image_url: null,
    order_index: 9,
  },
] as const;

// ─── Admissions FAQ ───────────────────────────────────────────────
export const ADMISSIONS_FAQ = [
  {
    question: "Who can apply to CommLead Academy?",
    answer:
      "Anyone with a desire to improve their communication and leadership skills can apply. Our programs cater to beginners, intermediate, and advanced learners — from students to senior executives.",
  },
  {
    question: "How does the application process work?",
    answer:
      "Simply fill out our registration form online, select your preferred program, and submit. Our admissions team will review your application and contact you via WhatsApp with payment instructions within 24-48 hours.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept EcoCash, InnBucks, and bank transfers. Instalment plans are available for select programs. Payment details are sent once your application is reviewed.",
  },
  {
    question: "Are scholarships available?",
    answer:
      "Yes! We offer a limited number of scholarships each intake. When registering, select 'Scholarship' as your payment method and provide a compelling motivation statement.",
  },
  {
    question: "Can I get a refund if I change my mind?",
    answer:
      "Refund requests must be made within 7 days of payment and before attending the second class. A 15% administrative fee applies. Please see our full Refund Policy for details.",
  },
  {
    question: "Are classes online or in-person?",
    answer:
      "It depends on the program! We offer hybrid, fully online, and in-person programs. Check each program's delivery mode for details.",
  },
  {
    question: "Do I receive a certificate?",
    answer:
      "Absolutely. Every student who completes their program receives an official CommLead Academy certificate recognized across the region.",
  },
] as const;

// ─── Testimonials ─────────────────────────────────────────────────
export const TESTIMONIALS = [
  {
    id: "1",
    name: "Tendai Moyo",
    role: "Marketing Manager",
    company: "TechStart Zimbabwe",
    quote: "CommLead Academy transformed my career. Before, I dreaded presentations. Now, I lead boardroom discussions with confidence. The practical approach and personal mentorship made all the difference.",
    image: null,
    program: "Advanced Public Speaking",
  },
  {
    id: "2", 
    name: "Rumbidzai Chigumba",
    role: "University Student",
    company: "University of Zimbabwe",
    quote: "The Youth Leadership Accelerator was life-changing. I went from shy student to Student Council President. The skills I learned here opened doors I never knew existed.",
    image: null,
    program: "Youth Leadership Accelerator",
  },
  {
    id: "3",
    name: "Brighton Ncube",
    role: "CEO",
    company: "Greenfield Investments",
    quote: "As a CEO, communication is everything. The Executive Communication program gave me frameworks I use daily — from investor pitches to team alignment. Worth every dollar.",
    image: null,
    program: "Executive Communication Mastery",
  },
  {
    id: "4",
    name: "Chipo Mutasa",
    role: "HR Director",
    company: "Delta Corporation",
    quote: "I enrolled my entire leadership team. The improvement in how they communicate, lead meetings, and handle conflict has been remarkable. CommLead delivers results.",
    image: null,
    program: "Leadership & Influence",
  },
] as const;

// ─── Team Members ─────────────────────────────────────────────────
export const TEAM_MEMBERS = [
  {
    id: "1",
    name: "Charline Prezen Chikomo",
    role: "Founder & Lead Instructor",
    bio: "Mandela Rhodes Scholar, Published Author, and passionate advocate for transformative communication education.",
    image: "/images/founder.jpg",
    isFounder: true,
  },
  // Additional team members can be added here
] as const;

// ─── Fallback Events ─────────────────────────────────────────────
export const FALLBACK_EVENTS = [
  {
    id: "1",
    title: "Open Day — Experience CommLead",
    description:
      "Join us for a free open day where you'll meet instructors, tour the academy, sit in on a live demo class, and discover which program is right for you.",
    date: "2026-03-15",
    time: "10:00 AM - 2:00 PM",
    location: "CommLead Academy, Harare",
    image_url: null,
    is_active: true,
  },
  {
    id: "2",
    title: "Leadership Masterclass: Influence Without Authority",
    description:
      "A one-day intensive masterclass on leading teams and influencing decisions — even when you're not the boss. Open to the public.",
    date: "2026-04-05",
    time: "9:00 AM - 4:00 PM",
    location: "Online (Zoom)",
    image_url: null,
    is_active: true,
  },
  {
    id: "3",
    title: "Student Showcase Night",
    description:
      "Watch our graduating students deliver powerful presentations and speeches at our end-of-term showcase. Friends, family, and professionals are welcome.",
    date: "2026-05-20",
    time: "6:00 PM - 9:00 PM",
    location: "CommLead Academy, Harare",
    image_url: null,
    is_active: true,
  },
] as const;

export const CONTACT_INFO = {
  phone: "+263 77 334 1947",
  phone2: "+263 77 403 5666",
  email: "info@commleadacademy.com",
  whatsapp: "+263 77 334 1947",
  address: "Harare, Zimbabwe",
  socials: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
    twitter: "#",
    tiktok: "#",
  },
} as const;

export const PAYMENT_INFO = {
  ecocash: {
    name: "EcoCash",
    number: "07XX XXX XXX",
    merchantName: "CommLead Academy",
  },
  innbucks: {
    name: "InnBucks",
    number: "07XX XXX XXX",
  },
  bank: {
    bankName: "TBD",
    accountName: "CommLead Academy",
    accountNumber: "XXXXXXXXXX",
    branchCode: "XXXX",
  },
} as const;
