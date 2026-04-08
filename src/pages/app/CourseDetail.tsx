import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Settings, Eye, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoCourses } from "@/lib/demo-data";
import { useApp } from "@/contexts/AppContext";
import { CourseBuilderProvider, useCourseBuilder } from "@/contexts/CourseBuilderContext";
import { ChapterPageNav } from "@/components/course-builder/ChapterPageNav";
import { BlockLibrary } from "@/components/course-builder/BlockLibrary";
import { PageEditor } from "@/components/course-builder/PageEditor";
import { StudentPreviewDialog } from "@/components/course-builder/StudentPreviewDialog";
import { PublishDialog } from "@/components/course-builder/PublishDialog";
import { CourseSettingsDialog } from "@/components/course-builder/CourseSettingsDialog";

export function CourseDetailPage() {
  const { courseId } = useParams();
  const course = demoCourses.find((c) => c.id === courseId);

  if (!course) {
    return <div className="p-8 text-center text-muted-foreground">Course not found</div>;
  }

  return (
    <CourseBuilderProvider courseId={courseId!}>
      <CourseBuilder course={course} />
    </CourseBuilderProvider>
  );
}

function CourseBuilder({ course }: { course: typeof demoCourses[0] }) {
  const { currentRole } = useApp();
  const { selectedPageId } = useCourseBuilder();
  const isAdmin = currentRole === "admin" || currentRole === "tutor";
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {course.title}
              </h1>
              <StatusBadge
                status={course.status === "published" ? "success" : "warning"}
                label={course.status}
              />
            </div>
            <p className="text-muted-foreground">
              {course.level} • {course.subject}
            </p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="h-4 w-4" />
              Preview as Student
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                // TODO: Open course settings dialog
                import('sonner').then(({ toast }) => {
                  toast.info('Course settings dialog coming soon');
                });
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              className="gradient-hero text-primary-foreground"
              onClick={() => setPublishOpen(true)}
            >
              Publish Changes
            </Button>
          </div>
        )}
      </div>

      {/* Course Builder Layout */}
      <div className="grid grid-cols-12 gap-6 min-h-[calc(100vh-12rem)]">
        {/* Chapter/Page Navigation */}
        <motion.div
          className="col-span-3 bg-card rounded-xl border shadow-card overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChapterPageNav courseId={course.id} isAdmin={isAdmin} />
        </motion.div>

        {/* Page Editor */}
        <motion.div
          className={`${isAdmin ? "col-span-6" : "col-span-9"} bg-card rounded-xl border shadow-card overflow-hidden`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {selectedPageId ? (
            <PageEditor pageId={selectedPageId} isAdmin={isAdmin} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Select a page to {isAdmin ? "edit" : "view"}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Block Library */}
        {isAdmin && (
          <motion.div
            className="col-span-3 bg-card rounded-xl border shadow-card overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <BlockLibrary />
          </motion.div>
        )}
      </div>

      {/* Student Preview Dialog */}
      <StudentPreviewDialog
        courseId={course.id}
        courseTitle={course.title}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      {/* Publish Dialog */}
      <PublishDialog
        course={course}
        open={publishOpen}
        onOpenChange={setPublishOpen}
      />
    </div>
  );
}
