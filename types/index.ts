export type CompanyResearchDossier = {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
};

export type JobDetail = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  jobType: string | null;
  aboutRole: string | null;
  matchScore: number;
  matchReason: string | null;
  matchedSkills: string[];
  missingSkills: string[];
  companyResearch: CompanyResearchDossier | null;
  externalApplyUrl: string | null;
  foundAt: string;
};

export type WorkExperience = {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
};

export type ProfileEducation = {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
};

export type Job = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  salary: string | null;
  matchScore: number;
  foundAt: string;
};

export type ProfileData = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: string;
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: string;
  skills: string[];
  industries: string[];
  workExperience: WorkExperience[];
  education: ProfileEducation;
  jobTitlesSeeking: string;
  remotePreference: string;
  salaryExpectation: string;
  preferredLocations: string;
  coverLetterTone: string;
  resumePdfUrl: string | null;
  resumePdfName: string | null;
  isComplete: boolean;
};
