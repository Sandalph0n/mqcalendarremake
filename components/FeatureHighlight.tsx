import { LucideIcon } from "lucide-react";

interface FeatureHighlightProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureHighlight({
  icon: Icon,
  title,
  description,
}: FeatureHighlightProps) {
  return (
    <div className="flex gap-4 group">
      <div className="flex-shrink-0">
        <div className="size-12 bg-gradient-to-br from-[#A6192E] to-[#6A0D83] rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Icon className="size-6 text-white" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
