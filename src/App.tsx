import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { LandingPage } from "@/pages/Landing";
import { SignInPage } from "@/pages/auth/SignIn";
import { DashboardPage } from "@/pages/app/Dashboard";
import { CoursesPage } from "@/pages/app/Courses";
import { CourseDetailPage } from "@/pages/app/CourseDetail";
import { StudentsPage } from "@/pages/app/Students";
import { StudentProfilePage } from "@/pages/app/StudentProfile";
import { MessagesPage } from "@/pages/app/Messages";
import { InvoicesPage } from "@/pages/app/Invoices";
import { InvoiceDetailPage } from "@/pages/app/InvoiceDetail";
import { TimetablePage } from "@/pages/app/Timetable";
import { SettingsPage } from "@/pages/app/Settings";
import { ReportsPage } from "@/pages/app/Reports";
import { CohortsPage } from "@/pages/app/Cohorts";
import { CohortDetailPage } from "@/pages/app/CohortDetail";
import { ParentsPage } from "@/pages/app/Parents";
import { ProgressPage } from "@/pages/app/Progress";
import { AssessmentsPage } from "@/pages/app/Assessments";
import { AssessmentDetailPage } from "@/pages/app/AssessmentDetail";
import { SubmissionsPage } from "@/pages/app/Submissions";
import { AnnouncementsPage } from "@/pages/app/Announcements";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/signin" element={<SignInPage />} />
      <Route path="/app" element={<AppLayout><DashboardPage /></AppLayout>} />
      <Route path="/app/courses" element={<AppLayout><CoursesPage /></AppLayout>} />
      <Route path="/app/courses/:courseId" element={<AppLayout><CourseDetailPage /></AppLayout>} />
      <Route path="/app/students" element={<AppLayout><StudentsPage /></AppLayout>} />
      <Route path="/app/students/:studentId" element={<AppLayout><StudentProfilePage /></AppLayout>} />
      <Route path="/app/messages" element={<AppLayout><MessagesPage /></AppLayout>} />
      <Route path="/app/invoices" element={<AppLayout><InvoicesPage /></AppLayout>} />
      <Route path="/app/invoices/:invoiceId" element={<AppLayout><InvoiceDetailPage /></AppLayout>} />
      <Route path="/app/timetable" element={<AppLayout><TimetablePage /></AppLayout>} />
      <Route path="/app/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
      <Route path="/app/reports" element={<AppLayout><ReportsPage /></AppLayout>} />
      <Route path="/app/cohorts" element={<AppLayout><CohortsPage /></AppLayout>} />
      <Route path="/app/cohorts/:cohortId" element={<AppLayout><CohortDetailPage /></AppLayout>} />
      <Route path="/app/parents" element={<AppLayout><ParentsPage /></AppLayout>} />
      <Route path="/app/progress" element={<AppLayout><ProgressPage /></AppLayout>} />
      <Route path="/app/assessments" element={<AppLayout><AssessmentsPage /></AppLayout>} />
      <Route path="/app/assessments/:assessmentId" element={<AppLayout><AssessmentDetailPage /></AppLayout>} />
      <Route path="/app/submissions" element={<AppLayout><SubmissionsPage /></AppLayout>} />
      <Route path="/app/announcements" element={<AppLayout><AnnouncementsPage /></AppLayout>} />
      <Route path="/app/*" element={<AppLayout><DashboardPage /></AppLayout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
