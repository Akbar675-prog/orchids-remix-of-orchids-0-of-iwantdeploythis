import HeroQuickstart from "@/components/sections/hero-quickstart";
import ModelsGrid from "@/components/sections/models-grid";
import StartBuilding from "@/components/sections/start-building";
import { HelpCircle, MessageSquare, BookOpen, Activity, ExternalLink } from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="max-w-[1024px] mx-auto px-8 py-12">
      <HeroQuickstart />
      <ModelsGrid />
      <StartBuilding />
    </div>
  );
}
