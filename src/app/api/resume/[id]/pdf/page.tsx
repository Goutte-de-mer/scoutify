import { getCompleteResume } from "@/lib/services/resume-service";
import ResumeContent from "@/components/ResumeContent";
import { notFound } from "next/navigation";

export default async function ResumePDFPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resumeData = await getCompleteResume(id);

  if (!resumeData) {
    notFound();
  }

  return <ResumeContent data={resumeData} />;
}
