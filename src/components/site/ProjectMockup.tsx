import claimsScreenshot from "@/assets/project-screenshots/claims-management-platform.png";
import erpScreenshot from "@/assets/project-screenshots/erp-inventory-module.png";
import fieldOpsScreenshot from "@/assets/project-screenshots/field-operations-web-app.png";

const screenshots: Record<string, string> = {
  "claims-management-platform": claimsScreenshot,
  "erp-inventory-module": erpScreenshot,
  "field-operations-web-app": fieldOpsScreenshot,
  "internal-design-system": erpScreenshot,
};

export function ProjectMockup({ slug }: { slug: string }) {
  const src = screenshots[slug] ?? claimsScreenshot;

  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-secondary">
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="block aspect-[16/10] w-full object-cover"
      />
    </div>
  );
}
