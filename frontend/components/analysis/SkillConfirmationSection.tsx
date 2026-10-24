"use client";

import React, { useState } from "react";
import { SkillVerificationItem } from "@/types/analysis";

interface SkillConfirmationSectionProps {
  activeSkillPrompt: {
    skillName: string;
    description: string;
    details: string;
  };
  skillsToVerify: SkillVerificationItem[];
  onConfirmSkill?: (skillId: string, level: "proficient" | "basic" | "unknown") => void;
}

export default function SkillConfirmationSection({
  activeSkillPrompt,
  skillsToVerify: initialSkills,
  onConfirmSkill,
}: SkillConfirmationSectionProps) {
  const [skills, setSkills] = useState(initialSkills);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  const handleSelectOption = (level: "proficient" | "basic" | "unknown", levelText: string) => {
    setSelectedResponse(level);
    if (onConfirmSkill) {
      onConfirmSkill("verify-1", level);
    }

    // Update first skill state smoothly in UI
    setSkills((prev) =>
      prev.map((s, idx) =>
        idx === 0
          ? {
              ...s,
              status: level,
              badgeText: levelText,
            }
          : s
      )
    );
  };

  return (
    <section className="bg-surface rounded-lg p-6 sm:p-8 shadow-xs border border-border/80 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs shrink-0">
            2
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-text">
            Xác nhận Skill
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted pl-9.5">
          Những kỹ năng JD yêu cầu nhưng hồ sơ CV hiện tại chưa đề cập hoặc chưa rõ mức độ
        </p>
      </div>

      {/* Main AI Prompter Box */}
      <div className="bg-primary-soft/40 border border-primary/20 p-5 sm:p-6 rounded-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 max-w-2xl">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary border border-primary/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Hỏi nhanh từ EduBot AI
            </span>
            <p className="text-sm sm:text-base font-medium text-text">
              Hệ thống AI nhận thấy JD tuyển dụng yêu cầu kỹ năng{" "}
              <strong className="text-primary font-bold">{activeSkillPrompt.skillName}</strong>{" "}
              nhưng chưa thấy trong CV của bạn. Bạn có kinh nghiệm với công nghệ này không?
            </p>
            <span className="text-xs text-muted">
              Kỹ năng mục tiêu:{" "}
              <span className="font-semibold text-text">
                {activeSkillPrompt.details}
              </span>
            </span>
          </div>
        </div>

        {/* 3 Interactive Choice Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap self-stretch md:self-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={() => handleSelectOption("proficient", "Thành thạo")}
            className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-95 ${
              selectedResponse === "proficient"
                ? "bg-primary text-on-primary ring-2 ring-primary/40"
                : "bg-primary text-on-primary hover:opacity-95"
            }`}
          >
            Có, thành thạo
          </button>
          <button
            type="button"
            onClick={() => handleSelectOption("basic", "Biết cơ bản")}
            className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all border active:scale-95 ${
              selectedResponse === "basic"
                ? "bg-primary-soft text-primary border-primary ring-2 ring-primary/30"
                : "bg-surface text-primary border-border hover:bg-surface-2"
            }`}
          >
            Biết cơ bản
          </button>
          <button
            type="button"
            onClick={() => handleSelectOption("unknown", "Chưa biết")}
            className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all active:scale-95 border ${
              selectedResponse === "unknown"
                ? "bg-surface-2 text-text border-text/40"
                : "bg-surface-2 text-muted border-transparent hover:text-text"
            }`}
          >
            Chưa biết
          </button>
        </div>
      </div>

      {/* Skill Status Chips List */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-semibold text-muted">
          Trạng thái các kỹ năng cần đối soát:
        </span>

        <div className="flex items-center gap-2.5 flex-wrap">
          {skills.map((item, idx) => {
            const isPending = item.status === "pending";
            const isConfirmed = item.status === "proficient" || item.status === "basic";

            return (
              <div
                key={item.id}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isPending
                    ? "bg-surface text-text border-primary/50 shadow-xs ring-2 ring-primary/20"
                    : isConfirmed
                    ? "bg-surface text-text border-border"
                    : "bg-surface-2 text-muted border-border/60"
                }`}
              >
                {isPending && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                )}

                {isConfirmed && (
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}

                <span>{item.skillName}</span>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isPending
                      ? "bg-primary-soft text-primary"
                      : isConfirmed
                      ? "bg-surface-2 text-primary"
                      : "bg-surface text-muted"
                  }`}
                >
                  {item.badgeText}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
