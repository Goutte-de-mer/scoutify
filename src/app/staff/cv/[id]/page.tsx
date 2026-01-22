import ResumeContent from "@/components/ResumeContent";
import { getCompleteResume } from "@/lib/services/resume-service";
import DownloadPDFButton from "@/components/DownloadPDFButton";

export default async function ResumePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getCompleteResume(id);
    
    if (!data) {
        return (
            <div>
                <h1>CV non trouvé</h1>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-zinc-800">
            <div className="fixed top-4 right-4 z-10">
                <DownloadPDFButton resumeId={id} />
            </div>
            <ResumeContent data={data} />
        </div>
    );
}