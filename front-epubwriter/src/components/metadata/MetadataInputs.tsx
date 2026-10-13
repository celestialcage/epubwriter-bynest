import {
  AlignLeft,
  Building2,
  Globe,
  User,
  type LucideIcon,
} from "lucide-react";
import { useId, type ReactNode } from "react";
import type { MetadataFormState, MetaKey } from "./useMetadataForm";
import type { FolderMetadata } from "../../types/types";

const LANGUAGES = [
  { value: "ko", label: "한국어 (ko)" },
  { value: "en", label: "English (en)" },
  { value: "ja", label: "日本語 (ja)" },
];

const inputClass =
  "w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder:text-slate-300";

function Field({
  htmlFor,
  icon: Icon,
  label,
  children,
}: {
  htmlFor: string;
  icon?: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className="text-slate-600 font-medium flex items-center gap-1"
      >
        {Icon && <Icon className="w-3 h-3 text-slate-400" />}
        <span>{label}</span>
      </label>
      {children}
    </div>
  );
}

interface Props {
  form: MetadataFormState;
  original: FolderMetadata;
  titleLabel: string; // "책 제목" | "시리즈 제목"
  onChange: (key: keyof MetadataFormState, value: string) => void;
}

export default function MetadataInputs({
  form,
  original,
  titleLabel,
  onChange,
}: Props) {
  const id = useId();

  // 원래 값이 비어 있을 때만 resolved가 '비웠을 때 적용되는 값'과 같음
  const hint = (key: MetaKey) =>
    original[key] === null
      ? original.resolved[key] || "비어 있음"
      : "비우면 상위/기본값 적용";

  // 목록에 없는 언어 코드가 저장돼 있으면 옵션에 추가해서 값이 사라지지 않게
  const languages =
    form.language === "" || LANGUAGES.some((l) => l.value === form.language)
      ? LANGUAGES
      : [...LANGUAGES, { value: form.language, label: form.language }];

  return (
    <div className="space-y-3">
      <Field htmlFor={`${id}-title`} label={titleLabel}>
        <input
          id={`${id}-title`}
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="제목 입력"
          className={inputClass}
        />
      </Field>

      <Field htmlFor={`${id}-author`} icon={User} label="저자">
        <input
          id={`${id}-author`}
          value={form.author}
          onChange={(e) => onChange("author", e.target.value)}
          placeholder={hint("author")}
          className={inputClass}
        />
      </Field>

      <Field htmlFor={`${id}-publisher`} icon={Building2} label="출판사">
        <input
          id={`${id}-publisher`}
          value={form.publisher}
          onChange={(e) => onChange("publisher", e.target.value)}
          placeholder={hint("publisher")}
          className={inputClass}
        />
      </Field>

      <Field htmlFor={`${id}-language`} icon={Globe} label="언어">
        <select
          id={`${id}-language`}
          value={form.language}
          onChange={(e) => onChange("language", e.target.value)}
          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
        >
          <option value="">
            {original.language === null
              ? `상속/기본값 (${original.resolved.language})`
              : "상속/기본값 사용"}
          </option>
          {languages.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </Field>

      <Field htmlFor={`${id}-description`} icon={AlignLeft} label="소개/설명">
        <textarea
          id={`${id}-description`}
          rows={3}
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder={hint("description")}
          className={`${inputClass} resize-none leading-relaxed`}
        />
      </Field>
    </div>
  );
}
