// app/DownloadBtn.tsx
"use client";

import { useEffect, useState } from "react";
import { checkCVExists } from "@/app/actions";
import { FileText } from "lucide-react";

const DownloadBtn = ({
  firstName,
  lastName,
  resumeId,
}: {
  firstName?: string;
  lastName?: string;
  resumeId: string;
}) => {
  // const [exists, setExists] = useState(false);
  // const documentName = `CV_${lastName.toUpperCase()}_${firstName.toUpperCase()}.pdf`;

  // useEffect(() => {
  //   checkCVExists(firstName, lastName).then(setExists);
  // }, [firstName, lastName]);
  // console.log(exists);
  // if (!exists) return null;
  console.log(resumeId);
  return (
    <a
      href={`/staff/cv/${resumeId}`}
      className="rounded-sm px-3 py-2 transition hover:bg-white/10"
    >
      <FileText size={16} />
    </a>
  );
};

export default DownloadBtn;
