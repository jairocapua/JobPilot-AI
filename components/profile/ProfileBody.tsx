"use client";

import { useState } from "react";
import { ResumeUpload } from "./ResumeUpload";
import { ProfileForm } from "./ProfileForm";
import type { ProfileData } from "@/types";

type Props = {
  initialData: ProfileData;
  userId: string;
  resumePdfKey: string | null;
};

export function ProfileBody({ initialData, userId, resumePdfKey }: Props) {
  const [profileData, setProfileData] = useState<ProfileData>(initialData);
  const [formKey, setFormKey] = useState(0);

  function handleExtract(extracted: Partial<ProfileData>) {
    setProfileData((prev) => ({ ...prev, ...extracted }));
    setFormKey((k) => k + 1);
  }

  return (
    <>
      <ResumeUpload
        userId={userId}
        resumePdfUrl={profileData.resumePdfUrl}
        resumePdfKey={resumePdfKey}
        resumePdfName={profileData.resumePdfName}
        onExtract={handleExtract}
      />
      <ProfileForm key={formKey} initialData={profileData} />
    </>
  );
}
