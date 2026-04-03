export function SkillLegend() {
  return (
    <div className="mb-8 grid grid-cols-1 gap-2 rounded-xl border border-border bg-card p-3 text-center sm:grid-cols-3">
      <div className="rounded-md border border-border bg-[#fffdf9] py-2 text-sm font-medium text-[#475569]">
        Entry Level: 0% - 49%
      </div>
      <div className="rounded-md border border-border bg-[#fffdf9] py-2 text-sm font-medium text-[#475569]">
        Intermediary: 50% - 89%
      </div>
      <div className="rounded-md border border-border bg-[#fffdf9] py-2 text-sm font-medium text-[#475569]">
        Senior: 90% - 100%
      </div>
    </div>
  );
}
