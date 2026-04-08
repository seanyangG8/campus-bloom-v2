// Demo Centre Data for Tuition Centre LMS

export type UserRole = 'admin' | 'tutor' | 'student' | 'parent';

export type TeamMemberRole = 'owner' | 'admin' | 'tutor';

export type TeamMemberStatus = 'active' | 'invited' | 'deactivated';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  invitedAt?: string;
  joinedAt?: string;
}

export interface CentreTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface Centre {
  id: string;
  name: string;
  logo?: string;
  subdomain: string;
  primaryColor?: string;
  secondaryColor?: string;
  timezone: 'Asia/Singapore' | 'Asia/Kuala_Lumpur';
  currency: 'SGD' | 'MYR';
  invoicePrefix: string;
  themeId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  centreId: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  level: string;
  subject: string;
  chaptersCount: number;
  studentsEnrolled: number;
  completionRate: number;
  status: 'draft' | 'published' | 'archived';
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  order: number;
  pagesCount: number;
  isLocked: boolean;
}

export interface Page {
  id: string;
  chapterId: string;
  title: string;
  order: number;
  blocksCount: number;
  isRequired: boolean;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface Block {
  id: string;
  pageId: string;
  type: BlockType;
  title: string;
  content: any;
  order: number;
  isRequired: boolean;
  isCompleted: boolean;
  // Enhanced fields
  points?: number;
  availabilityStart?: string;
  availabilityEnd?: string;
  visibilityCondition?: 'always' | 'after_prev_complete' | 'score_threshold';
  visibilityThreshold?: number;
  maxAttempts?: number;
}

export type BlockType = 
  | 'text'
  | 'video'
  | 'image'
  | 'micro-quiz'
  | 'drag-drop-reorder'
  | 'whiteboard'
  | 'reflection'
  | 'qa-thread'
  | 'resource'
  | 'divider'
  | 'gap-fill'
  | 'poll'
  | 'reveal'
  | 'file-upload';

// Enhanced content types for each block
export interface TextBlockContent {
  html: string;
  calloutStyle?: 'none' | 'info' | 'warning' | 'tip' | 'success';
  enableMathSupport?: boolean;
}

export interface VideoBlockContent {
  url: string;
  duration?: string;
  thumbnail?: string;
  captionsUrl?: string;
  transcript?: string;
  startTime?: string;
  endTime?: string;
  watchThreshold?: number; // percentage 0-100
  allowDownload?: boolean;
  chapters?: Array<{ time: string; title: string }>;
}

export interface ImageBlockContent {
  url: string;
  alt: string;
  caption?: string;
  displaySize?: 'small' | 'medium' | 'large' | 'full';
  allowDownload?: boolean;
  galleryMode?: boolean;
  images?: Array<{ url: string; alt: string; caption?: string }>;
}

export interface ResourceBlockContent {
  url: string;
  fileName: string;
  fileSize?: string;
  resourceType?: 'file' | 'link';
  fileType?: 'pdf' | 'doc' | 'ppt' | 'xls' | 'image' | 'zip' | 'other';
  mustOpenToComplete?: boolean;
  versionLabel?: string;
  expiryDate?: string;
  openInNewTab?: boolean;
}

export interface DividerBlockContent {
  style?: 'line' | 'whitespace' | 'section-break';
  sectionHeading?: string;
  anchorId?: string;
  spacing?: 'compact' | 'normal' | 'large';
}

export interface MicroQuizQuestion {
  id: string;
  type?: 'single-choice' | 'multi-select' | 'true-false' | 'short-answer';
  question: string;
  options: string[];
  correctAnswer: number | number[]; // number for single, array for multi
  correctAnswerText?: string; // For short-answer questions
  hint?: string;
  explanation?: string;
  points?: number;
  caseSensitive?: boolean; // for short-answer
}

export interface MicroQuizBlockContent {
  questions: MicroQuizQuestion[];
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  showCorrectAfterAttempt?: boolean;
  allowRetryImmediately?: boolean;
  passMark?: number; // percentage
  completionRule?: 'attempted' | 'passed';
}

export interface ReorderBlockContent {
  instruction: string;
  items: string[];
  correctOrder: number[];
  scoringMode?: 'all-or-nothing' | 'partial-credit';
  showCorrectOrderAfter?: boolean;
  explanation?: string;
  distractorItems?: string[];
}

export interface WhiteboardBlockContent {
  prompt: string;
  allowImage?: boolean;
  canvasSize?: 'a4' | 'square' | 'wide';
  background?: 'blank' | 'grid' | 'ruled';
  enabledTools?: {
    pen: boolean;
    highlighter: boolean;
    eraser: boolean;
    shapes: boolean;
    text: boolean;
    undo: boolean;
  };
  multiPage?: boolean;
  rubric?: string;
  dueDate?: string;
}

export interface ReflectionBlockContent {
  prompt: string;
  minWords?: number;
  maxWords?: number;
  rubric?: string;
  points?: number;
  privacyMode?: 'private' | 'peer-gallery' | 'anonymous';
  allowPeerComments?: boolean;
  mustSubmitToComplete?: boolean;
  exampleResponse?: string;
  showPeerReflections?: boolean;
}

export interface QAThreadBlockContent {
  whoCanPost?: 'students-only' | 'students-and-tutors';
  anonymity?: 'off' | 'optional' | 'always-anonymous';
  allowAttachments?: boolean;
  categories?: string[];
  moderationEnabled?: boolean;
  questions?: any[];
  allowAnonymous?: boolean;
}

export interface GapFillBlockContent {
  instruction: string;
  sentences: Array<{
    id: string;
    textWithBlanks: string; // Use {{1}}, {{2}} for blanks
    blanks: Array<{
      id: string;
      acceptedAnswers: string[];
      caseSensitive?: boolean;
    }>;
  }>;
  showCorrectAfter?: boolean;
  scoringMode?: 'all-or-nothing' | 'partial-credit';
}

export interface PollBlockContent {
  question: string;
  options: string[];
  allowMultiple?: boolean;
  showResults?: boolean;
  chartType?: 'bar' | 'pie';
  anonymousVoting?: boolean;
}

export interface RevealBlockContent {
  sections: Array<{
    id: string;
    title: string;
    content: string; // HTML content
  }>;
  style?: 'accordion' | 'click-to-reveal' | 'tabs';
  allowMultipleOpen?: boolean;
}

export interface FileUploadBlockContent {
  prompt: string;
  allowedTypes: ('image' | 'video' | 'audio' | 'document' | 'presentation')[];
  maxFileSize: number; // MB
  maxFiles: number;
  instructions?: string;
  rubric?: string;
  mustSubmitToComplete?: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  enrolledCourses: number;
  completionRate: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'at-risk';
  makeUpCredits: number;
}

export interface Cohort {
  id: string;
  name: string;
  courseId: string;
  tutorId: string;
  studentsCount: number;
  schedule: string;
  startDate: string;
  status: 'active' | 'completed' | 'upcoming';
}

export interface Session {
  id: string;
  cohortId: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  meetingLink: string;
  recordingLink?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  attendanceCount: number;
  totalStudents: number;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  description: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentIds: string[];
}

// Centre Themes
export const centreThemes: CentreTheme[] = [
  { id: 'theme-navy', name: 'Professional Navy', primaryColor: '#1e3a5f', secondaryColor: '#3b82f6' },
  { id: 'theme-teal', name: 'Modern Teal', primaryColor: '#0d9488', secondaryColor: '#14b8a6' },
  { id: 'theme-purple', name: 'Creative Purple', primaryColor: '#7c3aed', secondaryColor: '#a78bfa' },
  { id: 'theme-emerald', name: 'Fresh Emerald', primaryColor: '#059669', secondaryColor: '#34d399' },
  { id: 'theme-rose', name: 'Warm Rose', primaryColor: '#e11d48', secondaryColor: '#fb7185' },
  { id: 'theme-amber', name: 'Vibrant Amber', primaryColor: '#d97706', secondaryColor: '#fbbf24' },
];

// Demo Data
export const demoCentres: Centre[] = [
  {
    id: 'centre-1',
    name: 'Bright Minds Academy',
    subdomain: 'brightminds',
    primaryColor: '#1e3a5f',
    secondaryColor: '#3b82f6',
    timezone: 'Asia/Singapore',
    currency: 'SGD',
    invoicePrefix: 'INV',
    themeId: 'theme-navy',
  },
  {
    id: 'centre-2',
    name: 'Excel Learning Hub',
    subdomain: 'excelhub',
    primaryColor: '#0d9488',
    secondaryColor: '#14b8a6',
    timezone: 'Asia/Kuala_Lumpur',
    currency: 'MYR',
    invoicePrefix: 'EXC',
    themeId: 'theme-teal',
  },
];

// Demo Team Members
export const demoTeamMembers: TeamMember[] = [
  { id: 'tm-1', name: 'Sarah Chen', email: 'sarah@brightminds.edu', role: 'owner', status: 'active', joinedAt: '2023-01-15' },
  { id: 'tm-2', name: 'Mr. Ahmad Rahman', email: 'ahmad@brightminds.edu', role: 'tutor', status: 'active', joinedAt: '2023-03-20' },
  { id: 'tm-3', name: 'Lisa Wong', email: 'lisa@brightminds.edu', role: 'admin', status: 'active', joinedAt: '2023-06-10' },
  { id: 'tm-4', name: 'James Lee', email: 'james.lee@brightminds.edu', role: 'tutor', status: 'invited', invitedAt: '2024-01-18' },
  { id: 'tm-5', name: 'Emily Tan', email: 'emily.tan@brightminds.edu', role: 'tutor', status: 'deactivated', joinedAt: '2023-02-01' },
];

export const demoUsers: Record<UserRole, User> = {
  admin: {
    id: 'user-1',
    name: 'Sarah Chen',
    email: 'sarah@brightminds.edu',
    role: 'admin',
    centreId: 'centre-1',
  },
  tutor: {
    id: 'user-2',
    name: 'Mr. Ahmad Rahman',
    email: 'ahmad@brightminds.edu',
    role: 'tutor',
    centreId: 'centre-1',
  },
  student: {
    id: 'user-3',
    name: 'Wei Lin Tan',
    email: 'weilin@student.edu',
    role: 'student',
    centreId: 'centre-1',
  },
  parent: {
    id: 'user-4',
    name: 'Mrs. Tan Mei Ling',
    email: 'meiling.tan@email.com',
    role: 'parent',
    centreId: 'centre-1',
  },
};

export const demoCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Secondary 3 Mathematics',
    description: 'Comprehensive coverage of Sec 3 A-Math and E-Math syllabus with active learning components.',
    level: 'Secondary 3',
    subject: 'Mathematics',
    chaptersCount: 8,
    studentsEnrolled: 24,
    completionRate: 67,
    status: 'published',
  },
  {
    id: 'course-2',
    title: 'Primary 6 Science',
    description: 'PSLE Science preparation with experiments and interactive quizzes.',
    level: 'Primary 6',
    subject: 'Science',
    chaptersCount: 12,
    studentsEnrolled: 32,
    completionRate: 45,
    status: 'published',
  },
  {
    id: 'course-3',
    title: 'O-Level English',
    description: 'Complete O-Level English preparation covering comprehension, composition, and oral.',
    level: 'Secondary 4',
    subject: 'English',
    chaptersCount: 10,
    studentsEnrolled: 18,
    completionRate: 82,
    status: 'published',
  },
  {
    id: 'course-4',
    title: 'A-Level Economics',
    description: 'H2 Economics with case studies and essay practice.',
    level: 'JC 2',
    subject: 'Economics',
    chaptersCount: 6,
    studentsEnrolled: 0,
    completionRate: 0,
    status: 'draft',
  },
];

export const demoChapters: Chapter[] = [
  { id: 'ch-1', courseId: 'course-1', title: 'Chapter 1: Quadratic Equations', order: 1, pagesCount: 5, isLocked: false },
  { id: 'ch-2', courseId: 'course-1', title: 'Chapter 2: Indices and Surds', order: 2, pagesCount: 4, isLocked: false },
  { id: 'ch-3', courseId: 'course-1', title: 'Chapter 3: Polynomials', order: 3, pagesCount: 6, isLocked: true },
  { id: 'ch-4', courseId: 'course-1', title: 'Chapter 4: Linear Inequalities', order: 4, pagesCount: 4, isLocked: true },
];

export const demoPages: Page[] = [
  // Chapter 1: Quadratic Equations
  { id: 'pg-1', chapterId: 'ch-1', title: 'Introduction to Quadratics', order: 1, blocksCount: 4, isRequired: true, isCompleted: false, isLocked: false },
  { id: 'pg-2', chapterId: 'ch-1', title: 'Solving by Factorisation', order: 2, blocksCount: 6, isRequired: true, isCompleted: true, isLocked: false },
  { id: 'pg-3', chapterId: 'ch-1', title: 'The Quadratic Formula', order: 3, blocksCount: 5, isRequired: true, isCompleted: false, isLocked: false },
  { id: 'pg-4', chapterId: 'ch-1', title: 'Graphing Quadratics', order: 4, blocksCount: 7, isRequired: true, isCompleted: false, isLocked: true },
  { id: 'pg-5', chapterId: 'ch-1', title: 'Chapter Quiz', order: 5, blocksCount: 3, isRequired: true, isCompleted: false, isLocked: true },
  
  // Chapter 2: Indices and Surds
  { id: 'pg-6', chapterId: 'ch-2', title: 'Introduction to Indices', order: 1, blocksCount: 3, isRequired: true, isCompleted: false, isLocked: false },
  { id: 'pg-7', chapterId: 'ch-2', title: 'Laws of Indices', order: 2, blocksCount: 4, isRequired: true, isCompleted: false, isLocked: false },
  { id: 'pg-8', chapterId: 'ch-2', title: 'Surds and Rationalising', order: 3, blocksCount: 5, isRequired: true, isCompleted: false, isLocked: true },
  { id: 'pg-9', chapterId: 'ch-2', title: 'Chapter Quiz', order: 4, blocksCount: 2, isRequired: true, isCompleted: false, isLocked: true },
  
  // Chapter 3: Polynomials
  { id: 'pg-10', chapterId: 'ch-3', title: 'Introduction to Polynomials', order: 1, blocksCount: 3, isRequired: true, isCompleted: false, isLocked: false },
  { id: 'pg-11', chapterId: 'ch-3', title: 'Polynomial Division', order: 2, blocksCount: 4, isRequired: true, isCompleted: false, isLocked: false },
  { id: 'pg-12', chapterId: 'ch-3', title: 'Factor and Remainder Theorems', order: 3, blocksCount: 5, isRequired: true, isCompleted: false, isLocked: true },
  { id: 'pg-13', chapterId: 'ch-3', title: 'Factorising Polynomials', order: 4, blocksCount: 4, isRequired: true, isCompleted: false, isLocked: true },
  { id: 'pg-14', chapterId: 'ch-3', title: 'Polynomial Equations', order: 5, blocksCount: 3, isRequired: true, isCompleted: false, isLocked: true },
  { id: 'pg-15', chapterId: 'ch-3', title: 'Chapter Quiz', order: 6, blocksCount: 2, isRequired: true, isCompleted: false, isLocked: true },
  
  // Chapter 4: Linear Inequalities
  { id: 'pg-16', chapterId: 'ch-4', title: 'Introduction to Inequalities', order: 1, blocksCount: 3, isRequired: true, isCompleted: false, isLocked: false },
  { id: 'pg-17', chapterId: 'ch-4', title: 'Solving Linear Inequalities', order: 2, blocksCount: 4, isRequired: true, isCompleted: false, isLocked: false },
  { id: 'pg-18', chapterId: 'ch-4', title: 'Graphing Inequalities', order: 3, blocksCount: 4, isRequired: true, isCompleted: false, isLocked: true },
  { id: 'pg-19', chapterId: 'ch-4', title: 'Chapter Quiz', order: 4, blocksCount: 2, isRequired: true, isCompleted: false, isLocked: true },
];

export const demoBlocks: Block[] = [
  // Chapter 1, Page 1: Introduction to Quadratics (new block types demo)
  { id: 'blk-gf-1', pageId: 'pg-1', type: 'gap-fill', title: 'Fill in the Blanks: Quadratic Basics', content: { instruction: 'Complete these sentences about quadratic equations:', sentences: [{ id: 's-1', textWithBlanks: 'A quadratic equation has the form ax² + bx + c = 0, where a is {{1}}.', blanks: [{ id: 'b-1', acceptedAnswers: ['not zero', 'non-zero', 'not 0', '≠ 0'] }] }, { id: 's-2', textWithBlanks: 'The graph of a quadratic equation is called a {{1}}.', blanks: [{ id: 'b-2', acceptedAnswers: ['parabola'] }] }, { id: 's-3', textWithBlanks: 'A quadratic equation can have {{1}} or {{2}} real roots.', blanks: [{ id: 'b-3', acceptedAnswers: ['0', 'zero', 'no'] }, { id: 'b-4', acceptedAnswers: ['1', 'one', '2', 'two'] }] }], showCorrectAfter: true, scoringMode: 'partial-credit' }, order: 1, isRequired: true, isCompleted: false },
  { id: 'blk-poll-1', pageId: 'pg-1', type: 'poll', title: 'Quick Poll: Quadratics', content: { question: 'Which method do you prefer for solving quadratic equations?', options: ['Factorisation', 'Quadratic Formula', 'Completing the Square', 'Graphing'], allowMultiple: false, showResults: true, chartType: 'bar' }, order: 2, isRequired: false, isCompleted: false },
  { id: 'blk-rev-1', pageId: 'pg-1', type: 'reveal', title: 'Key Concepts', content: { sections: [{ id: 'r-1', title: 'What is a Quadratic?', content: '<p>A quadratic equation is a polynomial equation of degree 2. It has the general form <strong>ax² + bx + c = 0</strong> where a ≠ 0.</p>' }, { id: 'r-2', title: 'Parts of a Quadratic', content: '<p><strong>a</strong> is the leading coefficient, <strong>b</strong> is the linear coefficient, and <strong>c</strong> is the constant term.</p>' }, { id: 'r-3', title: 'Why are they important?', content: '<p>Quadratics model many real-world phenomena: projectile motion, area calculations, profit optimisation, and more.</p>' }], style: 'accordion', allowMultipleOpen: false }, order: 3, isRequired: false, isCompleted: false },
  { id: 'blk-fu-1', pageId: 'pg-1', type: 'file-upload', title: 'Upload Your Workings', content: { prompt: 'Upload a photo or scan of your working for these practice problems.', allowedTypes: ['image', 'document'], maxFileSize: 10, maxFiles: 2, mustSubmitToComplete: true }, order: 4, isRequired: false, isCompleted: false },

  // Chapter 1, Page 3: The Quadratic Formula
  { id: 'blk-1', pageId: 'pg-3', type: 'text', title: 'Learning Objectives', content: { html: '<p>By the end of this lesson, you will be able to:</p><ul><li>Derive the quadratic formula from completing the square</li><li>Apply the formula to solve any quadratic equation</li><li>Understand when to use the formula vs factorisation</li></ul>' }, order: 1, isRequired: false, isCompleted: true },
  { id: 'blk-2', pageId: 'pg-3', type: 'video', title: 'Video: Deriving the Formula', content: { url: 'https://youtube.com/watch?v=example', duration: '12:34' }, order: 2, isRequired: true, isCompleted: true },
  { id: 'blk-3', pageId: 'pg-3', type: 'micro-quiz', title: 'Quick Check', content: { questions: [{ id: 'q-1', question: 'What is the quadratic formula?', options: ['x = -b ± √(b² - 4ac) / 2a', 'x = b ± √(b² - 4ac) / 2a', 'x = -b ± √(b² + 4ac) / 2a', 'x = -b ± √(b² - 4ac) / a'], correctAnswer: 0 }] }, order: 3, isRequired: true, isCompleted: false },
  { id: 'blk-4', pageId: 'pg-3', type: 'whiteboard', title: 'Practice: Solve These', content: { prompt: 'Solve the equation: 2x² + 5x - 3 = 0', allowImage: true }, order: 4, isRequired: true, isCompleted: false },
  { id: 'blk-5', pageId: 'pg-3', type: 'reflection', title: 'Reflection: What did you learn?', content: { prompt: 'Reflect on what you learned about the quadratic formula. When would you use it instead of factorisation?', minWords: 50 }, order: 5, isRequired: false, isCompleted: false },
  
  // Chapter 2, Page 6: Introduction to Indices
  { id: 'blk-6', pageId: 'pg-6', type: 'text', title: 'What are Indices?', content: { html: '<p>Indices (also called exponents or powers) are a shorthand way of writing repeated multiplication.</p><p>For example: 2³ = 2 × 2 × 2 = 8</p>' }, order: 1, isRequired: false, isCompleted: false },
  { id: 'blk-7', pageId: 'pg-6', type: 'video', title: 'Introduction to Indices', content: { url: 'https://youtube.com/watch?v=indices-intro', duration: '8:20' }, order: 2, isRequired: true, isCompleted: false },
  { id: 'blk-8', pageId: 'pg-6', type: 'micro-quiz', title: 'Quick Check', content: { questions: [{ id: 'q-2', question: 'What is 5³?', options: ['15', '25', '125', '243'], correctAnswer: 2 }] }, order: 3, isRequired: true, isCompleted: false },
  
  // Chapter 2, Page 7: Laws of Indices
  { id: 'blk-9', pageId: 'pg-7', type: 'text', title: 'The Laws of Indices', content: { html: '<h3>Key Laws:</h3><ul><li>aᵐ × aⁿ = aᵐ⁺ⁿ</li><li>aᵐ ÷ aⁿ = aᵐ⁻ⁿ</li><li>(aᵐ)ⁿ = aᵐⁿ</li><li>a⁰ = 1</li><li>a⁻ⁿ = 1/aⁿ</li></ul>' }, order: 1, isRequired: false, isCompleted: false },
  { id: 'blk-10', pageId: 'pg-7', type: 'drag-drop-reorder', title: 'Order the Steps', content: { instruction: 'Simplify 2³ × 2⁵ ÷ 2² by ordering these steps:', items: ['Apply multiplication law: 2³⁺⁵ = 2⁸', 'Apply division law: 2⁸⁻² = 2⁶', 'Calculate: 2⁶ = 64'], correctOrder: [0, 1, 2] }, order: 2, isRequired: true, isCompleted: false },
  { id: 'blk-11', pageId: 'pg-7', type: 'micro-quiz', title: 'Practice Quiz', content: { questions: [{ id: 'q-3', question: 'Simplify: a⁴ × a³', options: ['a⁷', 'a¹²', 'a¹', '2a⁷'], correctAnswer: 0 }, { id: 'q-4', question: 'What is 2⁻³?', options: ['-8', '-6', '1/8', '1/6'], correctAnswer: 2 }] }, order: 3, isRequired: true, isCompleted: false },
  { id: 'blk-12', pageId: 'pg-7', type: 'reflection', title: 'Reflection', content: { prompt: 'Which law of indices do you find most useful? Give an example.', minWords: 30 }, order: 4, isRequired: false, isCompleted: false },
  
  // Chapter 3, Page 10: Introduction to Polynomials  
  { id: 'blk-13', pageId: 'pg-10', type: 'text', title: 'What are Polynomials?', content: { html: '<p>A polynomial is an expression with multiple terms involving variables raised to non-negative integer powers.</p><p>Examples: 3x² + 2x - 5, x³ - 4x + 1</p>' }, order: 1, isRequired: false, isCompleted: false },
  { id: 'blk-14', pageId: 'pg-10', type: 'video', title: 'Polynomial Basics', content: { url: 'https://youtube.com/watch?v=polynomials', duration: '10:15' }, order: 2, isRequired: true, isCompleted: false },
  { id: 'blk-15', pageId: 'pg-10', type: 'micro-quiz', title: 'Identify Polynomials', content: { questions: [{ id: 'q-5', question: 'Which of these is a polynomial?', options: ['1/x + 2', '√x + 3', 'x² + 3x - 1', 'x⁻² + x'], correctAnswer: 2 }] }, order: 3, isRequired: true, isCompleted: false },
  
  // Chapter 4, Page 16: Introduction to Inequalities
  { id: 'blk-16', pageId: 'pg-16', type: 'text', title: 'Understanding Inequalities', content: { html: '<p>An inequality is a mathematical statement that compares two expressions using symbols like &lt;, &gt;, ≤, or ≥.</p><p>Unlike equations, inequalities have a range of solutions.</p>' }, order: 1, isRequired: false, isCompleted: false },
  { id: 'blk-17', pageId: 'pg-16', type: 'video', title: 'Intro to Inequalities', content: { url: 'https://youtube.com/watch?v=inequalities', duration: '7:45' }, order: 2, isRequired: true, isCompleted: false },
  { id: 'blk-18', pageId: 'pg-16', type: 'micro-quiz', title: 'Quick Check', content: { questions: [{ id: 'q-6', question: 'Which symbol means "less than or equal to"?', options: ['<', '>', '≤', '≥'], correctAnswer: 2 }] }, order: 3, isRequired: true, isCompleted: false },
];

export const demoStudents: Student[] = [
  { id: 'stu-1', name: 'Wei Lin Tan', email: 'weilin@student.edu', phone: '+65 9123 4567', enrolledCourses: 2, completionRate: 78, lastActive: '2 hours ago', status: 'active', makeUpCredits: 1 },
  { id: 'stu-2', name: 'Aisha Binti Hassan', email: 'aisha@student.edu', phone: '+60 12-345 6789', enrolledCourses: 3, completionRate: 92, lastActive: '30 minutes ago', status: 'active', makeUpCredits: 0 },
  { id: 'stu-3', name: 'Ryan Koh', email: 'ryan.koh@student.edu', phone: '+65 8765 4321', enrolledCourses: 1, completionRate: 34, lastActive: '5 days ago', status: 'at-risk', makeUpCredits: 2 },
  { id: 'stu-4', name: 'Priya Sharma', email: 'priya.s@student.edu', phone: '+65 9876 5432', enrolledCourses: 2, completionRate: 65, lastActive: '1 day ago', status: 'active', makeUpCredits: 0 },
  { id: 'stu-5', name: 'Muhammad Irfan', email: 'irfan@student.edu', phone: '+60 11-234 5678', enrolledCourses: 1, completionRate: 88, lastActive: '3 hours ago', status: 'active', makeUpCredits: 1 },
];

export const demoCohorts: Cohort[] = [
  { id: 'coh-1', name: 'Sec 3 Math - Tue/Thu', courseId: 'course-1', tutorId: 'user-2', studentsCount: 12, schedule: 'Tue & Thu, 4:00 PM', startDate: '2024-01-08', status: 'active' },
  { id: 'coh-2', name: 'Sec 3 Math - Sat AM', courseId: 'course-1', tutorId: 'user-2', studentsCount: 8, schedule: 'Sat, 9:00 AM', startDate: '2024-01-06', status: 'active' },
  { id: 'coh-3', name: 'P6 Science - Wed', courseId: 'course-2', tutorId: 'user-2', studentsCount: 15, schedule: 'Wed, 5:00 PM', startDate: '2024-01-10', status: 'active' },
];

export const demoSessions: Session[] = [
  { id: 'ses-1', cohortId: 'coh-1', title: 'Quadratic Equations - Part 2', date: '2024-01-23', time: '4:00 PM', duration: 90, meetingLink: 'https://meet.google.com/abc-defg-hij', status: 'scheduled', attendanceCount: 0, totalStudents: 12 },
  { id: 'ses-2', cohortId: 'coh-2', title: 'Indices Practice', date: '2024-01-20', time: '9:00 AM', duration: 120, meetingLink: 'https://meet.google.com/xyz-uvwx-rst', recordingLink: 'https://drive.google.com/...', status: 'completed', attendanceCount: 7, totalStudents: 8 },
  { id: 'ses-3', cohortId: 'coh-3', title: 'Energy Conversion', date: '2024-01-24', time: '5:00 PM', duration: 90, meetingLink: 'https://meet.google.com/pqr-stuv-wxy', status: 'scheduled', attendanceCount: 0, totalStudents: 15 },
];

export const demoInvoices: Invoice[] = [
  { id: 'inv-1', studentId: 'stu-1', studentName: 'Wei Lin Tan', amount: 480, currency: 'SGD', status: 'paid', dueDate: '2024-01-15', description: 'Jan 2024 - Sec 3 Math' },
  { id: 'inv-2', studentId: 'stu-2', studentName: 'Aisha Binti Hassan', amount: 350, currency: 'MYR', status: 'pending', dueDate: '2024-01-25', description: 'Jan 2024 - P6 Science' },
  { id: 'inv-3', studentId: 'stu-3', studentName: 'Ryan Koh', amount: 480, currency: 'SGD', status: 'overdue', dueDate: '2024-01-10', description: 'Jan 2024 - Sec 3 Math' },
  { id: 'inv-4', studentId: 'stu-4', studentName: 'Priya Sharma', amount: 480, currency: 'SGD', status: 'pending', dueDate: '2024-01-28', description: 'Jan 2024 - Sec 3 Math' },
];

export const demoParents: Parent[] = [
  { id: 'par-1', name: 'Mrs. Tan Mei Ling', email: 'meiling.tan@email.com', phone: '+65 9123 4567', studentIds: ['stu-1'] },
  { id: 'par-2', name: 'Mr. Hassan Bin Ahmad', email: 'hassan.ahmad@email.com', phone: '+60 12-345 6789', studentIds: ['stu-2'] },
  { id: 'par-3', name: 'Mrs. Koh Siew Lian', email: 'siewlian.koh@email.com', phone: '+65 8765 4321', studentIds: ['stu-3'] },
  { id: 'par-4', name: 'Mr. Rajesh Sharma', email: 'rajesh.sharma@email.com', phone: '+65 9876 5432', studentIds: ['stu-4'] },
  { id: 'par-5', name: 'Mrs. Fatimah Binti Yusof', email: 'fatimah.yusof@email.com', phone: '+60 11-234 5678', studentIds: ['stu-5'] },
];

export const blockTypes: { type: BlockType; label: string; icon: string; description: string }[] = [
  { type: 'text', label: 'Text', icon: 'Type', description: 'Rich text content' },
  { type: 'video', label: 'Video', icon: 'Play', description: 'Embedded video' },
  { type: 'image', label: 'Image', icon: 'Image', description: 'Image with caption' },
  { type: 'micro-quiz', label: 'Micro-Quiz', icon: 'HelpCircle', description: '1-3 questions with instant feedback' },
  { type: 'drag-drop-reorder', label: 'Reorder Steps', icon: 'ListOrdered', description: 'Drag & drop to reorder' },
  { type: 'whiteboard', label: 'Whiteboard', icon: 'PenTool', description: 'Draw or write submission' },
  { type: 'reflection', label: 'Reflection', icon: 'MessageSquare', description: 'Reflection with peer gallery' },
  { type: 'qa-thread', label: 'Q&A Thread', icon: 'MessagesSquare', description: 'Questions with tutor answers' },
  { type: 'resource', label: 'Resource', icon: 'FileText', description: 'Downloadable file' },
  { type: 'divider', label: 'Divider', icon: 'Minus', description: 'Visual separator' },
  { type: 'gap-fill', label: 'Gap Fill', icon: 'TextCursorInput', description: 'Fill in the blanks' },
  { type: 'poll', label: 'Poll', icon: 'BarChart3', description: 'Quick poll with results' },
  { type: 'reveal', label: 'Reveal', icon: 'ChevronDown', description: 'Click-to-reveal sections' },
  { type: 'file-upload', label: 'File Upload', icon: 'Upload', description: 'Student file submission' },
];

export const whatsappTemplates = [
  { id: 't1', name: 'Session Reminder', message: 'Hi {parent_name}! Reminder: {student_name} has class tomorrow ({date}) at {time}. Join link: {meeting_link}' },
  { id: 't2', name: 'Invoice Due', message: 'Hi {parent_name}, the invoice for {student_name} ({amount}) is due on {due_date}. Please make payment to avoid disruption. Thank you!' },
  { id: 't3', name: 'Attendance Alert', message: 'Hi {parent_name}, {student_name} was absent from today\'s class. Please let us know if you\'d like to arrange a make-up session.' },
  { id: 't4', name: 'Progress Update', message: 'Hi {parent_name}! {student_name} has completed {completion}% of the course. Great progress! Keep it up!' },
];
