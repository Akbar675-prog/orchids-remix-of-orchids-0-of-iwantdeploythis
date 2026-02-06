import React from 'react';
import { 
  MessageSquare, 
  Eye, 
  Image as ImageIcon, 
  Headphones, 
  Zap, 
  Sparkles 
} from 'lucide-react';

interface CapabilityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const CapabilityCard = ({ icon, title, description }: CapabilityCardProps) => {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-white hover:bg-[#F2F2F2] transition-colors cursor-pointer group">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#E5E5E5] bg-white group-hover:border-transparent transition-colors mb-auto shrink-0">
        <div className="text-[#000000]">
          {icon}
        </div>
      </div>
      <div className="flex flex-col">
        <h3 className="text-[14px] font-semibold text-[#000000] leading-[1.4] mb-1">
          {title}
        </h3>
        <p className="text-[13px] text-[#6E6E73] leading-[1.5]">
          {description}
        </p>
      </div>
    </div>
  );
};

export default function StartBuilding() {
  const capabilities = [
    {
      icon: <MessageSquare size={18} strokeWidth={1.5} />,
      title: "Read and generate text",
      description: "Use the API to prompt a model and generate text"
    },
    {
      icon: <Eye size={18} strokeWidth={1.5} />,
      title: "Use a model's vision capabilities",
      description: "Allow models to see and analyze images in your application"
    },
    {
      icon: <ImageIcon size={18} strokeWidth={1.5} />,
      title: "Generate images as output",
      description: "Create images with GPT Image 1"
    },
    {
      icon: <Headphones size={18} strokeWidth={1.5} />,
      title: "Build apps with audio",
      description: "Analyze, transcribe, and generate audio with API endpoints"
    },
    {
      icon: <Zap size={18} strokeWidth={1.5} />,
      title: "Build agentic applications",
      description: "Use the API to build agents that use tools and computers"
    },
    {
      icon: <Sparkles size={18} strokeWidth={1.5} />,
      title: "Achieve complex tasks with reasoning",
      description: "Use reasoning models to carry out complex tasks"
    }
  ];

  return (
    <section className="w-full max-w-[1024px] py-12">
      <div className="mb-6 px-4">
        <h2 className="text-[18px] font-semibold text-[#000000] leading-[1.4]">
          Start building
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
        {capabilities.map((capability, index) => (
          <CapabilityCard
            key={index}
            icon={capability.icon}
            title={capability.title}
            description={capability.description}
          />
        ))}
      </div>
    </section>
  );
}