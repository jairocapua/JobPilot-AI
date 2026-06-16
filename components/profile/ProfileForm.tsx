"use client";

import { useState, useActionState, startTransition } from "react";
import { Plus, X, Calendar, ChevronDown, Check } from "lucide-react";
import type { ProfileData, WorkExperience, ProfileEducation } from "@/types";
import { saveProfile, type SaveResult } from "@/actions/profile";

type Props = {
  initialData: ProfileData;
};

const inputClass =
  "w-full px-3 py-2 border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-surface";

const selectClass =
  "w-full px-3 py-2 border border-border rounded-md text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-surface appearance-none";

const labelClass =
  "block text-xs font-medium text-text-secondary uppercase tracking-wide mb-1";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className={labelClass}>{children}</label>;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-text-secondary mb-4">{children}</h3>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
    </div>
  );
}

function DateInput({
  value,
  onChange,
  placeholder = "Month YYYY",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${inputClass} pl-9 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
    </div>
  );
}

const EMPTY_WORK_EXP: WorkExperience = {
  company: "",
  title: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  responsibilities: "",
};

export function ProfileForm({ initialData }: Props) {
  const [form, setForm] = useState<ProfileData>(initialData);
  const [skillInput, setSkillInput] = useState("");
  const [industryInput, setIndustryInput] = useState("");
  // Tracks whether any field has been edited since the last successful save,
  // so the "Profile saved." message doesn't linger after unsaved edits.
  const [dirtyAfterSave, setDirtyAfterSave] = useState(false);

  const [saveState, saveAction, isSaving] = useActionState<
    SaveResult,
    ProfileData
  >(
    async (_prev, data) => saveProfile(data),
    { success: false, error: null },
  );

  function setFormDirty(updater: (prev: ProfileData) => ProfileData) {
    setDirtyAfterSave(true);
    setForm(updater);
  }

  function updateField<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setFormDirty((prev) => ({ ...prev, [key]: value }));
  }

  function updateEducation<K extends keyof ProfileEducation>(key: K, value: string) {
    setFormDirty((prev) => ({
      ...prev,
      education: { ...prev.education, [key]: value },
    }));
  }

  function updateWorkExp(index: number, field: keyof WorkExperience, value: string | boolean) {
    setFormDirty((prev) => {
      const updated = [...prev.workExperience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, workExperience: updated };
    });
  }

  function addWorkExp() {
    if (form.workExperience.length >= 3) return;
    setFormDirty((prev) => ({
      ...prev,
      workExperience: [...prev.workExperience, { ...EMPTY_WORK_EXP }],
    }));
  }

  function removeWorkExp(index: number) {
    setFormDirty((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index),
    }));
  }

  function addSkill() {
    const trimmed = skillInput.trim();
    if (!trimmed || form.skills.includes(trimmed)) return;
    updateField("skills", [...form.skills, trimmed]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    updateField("skills", form.skills.filter((s) => s !== skill));
  }

  function addIndustry() {
    const trimmed = industryInput.trim();
    if (!trimmed || form.industries.includes(trimmed)) return;
    updateField("industries", [...form.industries, trimmed]);
    setIndustryInput("");
  }

  function removeIndustry(industry: string) {
    updateField("industries", form.industries.filter((i) => i !== industry));
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm">
      {/* Card header */}
      <div className="px-6 pt-6 pb-5 border-b border-border">
        <h2 className="text-base font-semibold text-text-primary mb-0.5">
          Profile Information
        </h2>
        <p className="text-sm text-text-secondary">
          This context is used to accurately represent you in agent interactions.
        </p>
      </div>

      <div className="px-6 py-6 flex flex-col gap-8">
        {/* ── Personal Info ── */}
        <section>
          <SectionHeader>Personal Info</SectionHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Full Name</FieldLabel>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="Your full name"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <input
                type="email"
                value={form.email}
                disabled
                className={`${inputClass} opacity-60 cursor-not-allowed`}
              />
            </div>
            <div>
              <FieldLabel>Phone Number</FieldLabel>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>Location</FieldLabel>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="City, Country"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>LinkedIn URL</FieldLabel>
              <input
                type="url"
                value={form.linkedinUrl}
                onChange={(e) => updateField("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>Portfolio / GitHub</FieldLabel>
              <input
                type="url"
                value={form.portfolioUrl}
                onChange={(e) => updateField("portfolioUrl", e.target.value)}
                placeholder="https://github.com/yourname"
                className={inputClass}
              />
            </div>
            <div className="col-span-2">
              <FieldLabel>Work Authorization</FieldLabel>
              <SelectWrapper>
                <select
                  value={form.workAuthorization}
                  onChange={(e) => updateField("workAuthorization", e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select authorization status</option>
                  <option value="citizen">Citizen</option>
                  <option value="permanent_resident">Permanent Resident</option>
                  <option value="visa_required">Visa Required</option>
                </select>
              </SelectWrapper>
            </div>
          </div>
        </section>

        {/* ── Professional Info ── */}
        <section>
          <SectionHeader>Professional Info</SectionHeader>
          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel>Current / Recent Job Title</FieldLabel>
              <input
                type="text"
                value={form.currentTitle}
                onChange={(e) => updateField("currentTitle", e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Experience Level</FieldLabel>
                <SelectWrapper>
                  <select
                    value={form.experienceLevel}
                    onChange={(e) => updateField("experienceLevel", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select level</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                  </select>
                </SelectWrapper>
              </div>
              <div>
                <FieldLabel>Years of Experience</FieldLabel>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={form.yearsExperience}
                  onChange={(e) => updateField("yearsExperience", e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <FieldLabel>Skills</FieldLabel>
              <div className="border border-border rounded-md p-3 bg-surface">
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 bg-surface-secondary border border-border rounded-full px-3 py-1 text-xs text-text-primary"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-text-muted hover:text-text-primary transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill"
                    className="flex-1 px-3 py-1.5 border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-surface"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-3 py-1.5 border border-border rounded-md text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Industries */}
            <div>
              <FieldLabel>Industries (Optional)</FieldLabel>
              <div className="border border-border rounded-md p-3 bg-surface">
                {form.industries.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.industries.map((industry) => (
                      <span
                        key={industry}
                        className="inline-flex items-center gap-1 bg-surface-secondary border border-border rounded-full px-3 py-1 text-xs text-text-primary"
                      >
                        {industry}
                        <button
                          type="button"
                          onClick={() => removeIndustry(industry)}
                          className="text-text-muted hover:text-text-primary transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={industryInput}
                    onChange={(e) => setIndustryInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIndustry())}
                    placeholder="E.g. FinTech, Healthcare"
                    className="flex-1 px-3 py-1.5 border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-surface"
                  />
                  <button
                    type="button"
                    onClick={addIndustry}
                    className="px-3 py-1.5 border border-border rounded-md text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Work Experience ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-secondary">Work Experience</h3>
            {form.workExperience.length < 3 && (
              <button
                type="button"
                onClick={addWorkExp}
                className="flex items-center gap-1 text-sm font-medium text-accent hover:opacity-80 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                Add role
              </button>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {form.workExperience.map((exp, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                    Role {index + 1}
                  </span>
                  {form.workExperience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWorkExp(index)}
                      className="text-text-muted hover:text-error transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <FieldLabel>Company Name</FieldLabel>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateWorkExp(index, "company", e.target.value)}
                      placeholder="Company"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <FieldLabel>Job Title</FieldLabel>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateWorkExp(index, "title", e.target.value)}
                      placeholder="Your role"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <FieldLabel>Start Date</FieldLabel>
                    <DateInput
                      value={exp.startDate}
                      onChange={(v) => updateWorkExp(index, "startDate", v)}
                      placeholder="January 2023"
                    />
                  </div>
                  <div>
                    <FieldLabel>End Date</FieldLabel>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <DateInput
                          value={exp.endDate}
                          onChange={(v) => updateWorkExp(index, "endDate", v)}
                          placeholder="Month YYYY"
                          disabled={exp.currentlyWorking}
                        />
                      </div>
                      <label className="flex items-center gap-2 whitespace-nowrap cursor-pointer">
                        <span className="relative flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={exp.currentlyWorking}
                            onChange={(e) =>
                              updateWorkExp(index, "currentlyWorking", e.target.checked)
                            }
                            className="sr-only"
                          />
                          <span
                            className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${
                              exp.currentlyWorking
                                ? "bg-info border-info"
                                : "bg-surface border-border"
                            }`}
                          >
                            {exp.currentlyWorking && (
                              <Check className="h-3 w-3 text-accent-foreground" />
                            )}
                          </span>
                        </span>
                        <span className="text-xs text-text-secondary">
                          Currently working here
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel>Key Responsibilities</FieldLabel>
                  <textarea
                    value={exp.responsibilities}
                    onChange={(e) => updateWorkExp(index, "responsibilities", e.target.value)}
                    placeholder="Describe your key responsibilities and achievements..."
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            ))}

            {form.workExperience.length === 0 && (
              <button
                type="button"
                onClick={addWorkExp}
                className="flex items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-border rounded-lg text-sm text-text-muted hover:border-accent hover:text-accent transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add your first role
              </button>
            )}
          </div>
        </section>

        {/* ── Education ── */}
        <section>
          <SectionHeader>Education</SectionHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Highest Degree</FieldLabel>
              <SelectWrapper>
                <select
                  value={form.education.degree}
                  onChange={(e) => updateEducation("degree", e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select degree</option>
                  <option value="high_school">High School</option>
                  <option value="associates">Associate&apos;s</option>
                  <option value="bachelors">Bachelor&apos;s</option>
                  <option value="masters">Master&apos;s</option>
                  <option value="doctorate">Doctorate</option>
                </select>
              </SelectWrapper>
            </div>
            <div>
              <FieldLabel>Field of Study</FieldLabel>
              <input
                type="text"
                value={form.education.fieldOfStudy}
                onChange={(e) => updateEducation("fieldOfStudy", e.target.value)}
                placeholder="E.g. Computer Science"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>Institution Name</FieldLabel>
              <input
                type="text"
                value={form.education.institution}
                onChange={(e) => updateEducation("institution", e.target.value)}
                placeholder="E.g. State University"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>Graduation Year</FieldLabel>
              <input
                type="text"
                value={form.education.graduationYear}
                onChange={(e) => updateEducation("graduationYear", e.target.value)}
                placeholder="YYYY"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* ── Job Preferences ── */}
        <section>
          <SectionHeader>Job Preferences</SectionHeader>
          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel>Job Titles Seeking</FieldLabel>
              <input
                type="text"
                value={form.jobTitlesSeeking}
                onChange={(e) => updateField("jobTitlesSeeking", e.target.value)}
                placeholder="Frontend Engineer, React Developer"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Remote Preference</FieldLabel>
                <SelectWrapper>
                  <select
                    value={form.remotePreference}
                    onChange={(e) => updateField("remotePreference", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select preference</option>
                    <option value="any">Any</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </SelectWrapper>
              </div>
              <div>
                <FieldLabel>Salary Expectation (Optional)</FieldLabel>
                <input
                  type="text"
                  value={form.salaryExpectation}
                  onChange={(e) => updateField("salaryExpectation", e.target.value)}
                  placeholder="E.g. $130k+"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Preferred Locations (Optional)</FieldLabel>
              <input
                type="text"
                value={form.preferredLocations}
                onChange={(e) => updateField("preferredLocations", e.target.value)}
                placeholder="E.g. New York, London"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>Cover Letter Tone</FieldLabel>
              <SelectWrapper>
                <select
                  value={form.coverLetterTone}
                  onChange={(e) => updateField("coverLetterTone", e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select tone</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="enthusiastic">Enthusiastic</option>
                </select>
              </SelectWrapper>
            </div>
          </div>
        </section>
      </div>

      {/* Save button */}
      <div className="px-6 pb-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            setDirtyAfterSave(false);
            startTransition(() => saveAction(form));
          }}
          disabled={isSaving}
          className="w-full py-3 bg-accent text-accent-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving…" : "Save Profile"}
        </button>
        {!isSaving && saveState.error && (
          <p className="text-sm text-error text-center">{saveState.error}</p>
        )}
        {!isSaving && !dirtyAfterSave && saveState.success && (
          <p className="text-sm text-success text-center">Profile saved.</p>
        )}
      </div>
    </div>
  );
}
