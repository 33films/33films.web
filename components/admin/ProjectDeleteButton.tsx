"use client";

import { useFormStatus } from "react-dom";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { adminDeleteProject } from "@/app/actions/platform";

export default function ProjectDeleteButton({ id }: { id: string }) {
  const { dictionary } = useI18n();
  const t = dictionary.admin;

  return (
    <form
      action={adminDeleteProject}
      onSubmit={(e) => {
        if (!confirm(t.deleteProjectConfirm)) e.preventDefault();
      }}
      className="mt-20 max-w-xl border-t border-off-white/10 pt-8"
    >
      <input type="hidden" name="id" value={id} />
      <p className="text-body text-gray">{t.deleteProjectHint}</p>
      <SubmitButton label={t.deleteProject} pendingLabel={t.deletingProject} />
    </form>
  );
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-label mt-6 border border-off-white/20 px-6 py-3 text-gray transition-colors hover:border-off-white hover:text-off-white disabled:opacity-50"
    >
      {pending ? pendingLabel : `${label} →`}
    </button>
  );
}
