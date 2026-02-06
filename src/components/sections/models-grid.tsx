import React from 'react';
import Image from 'next/image';

const MODELS_DATA = [
  {
    title: 'GPT-5.2',
    isNew: true,
    description: 'The best model for coding and agentic tasks across industries',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bc36fd50-cc8c-484c-b5b9-7b7b897c8edf-platform-openai-com/assets/images/gpt-5_2-1.jpg',
    href: '/docs/models/gpt-5-2',
  },
  {
    title: 'GPT-5 mini',
    isNew: false,
    description: 'A faster, cost-efficient version of GPT-5 for well-defined tasks',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bc36fd50-cc8c-484c-b5b9-7b7b897c8edf-platform-openai-com/assets/images/gpt-5-mini-2.jpg',
    href: '/docs/models/gpt-5-mini',
  },
  {
    title: 'GPT-5 nano',
    isNew: false,
    description: 'Fastest, most cost-efficient version of GPT-5',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bc36fd50-cc8c-484c-b5b9-7b7b897c8edf-platform-openai-com/assets/images/gpt-5-nano-3.jpg',
    href: '/docs/models/gpt-5-nano',
  },
];

const ModelsGrid = () => {
  return (
    <section className="mt-12 mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-semibold text-[#000000] leading-[1.4]">
          Models
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
        {MODELS_DATA.map((model, index) => (
          <a 
            key={index} 
            href={model.href} 
            className="group flex flex-col no-underline"
          >
            {/* Image Container */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[8px] border border-[#e5e5e5] mb-3">
              <Image
                src={model.image}
                alt={model.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            
            {/* Content */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[14px] font-semibold text-[#000000]">
                  {model.title}
                </span>
                {model.isNew && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-[#e2f5ea] text-[#10a37f] text-[11px] font-medium leading-none">
                    New
                  </span>
                )}
              </div>
              <p className="text-[14px] text-[#6e6e73] leading-[1.5] font-normal">
                {model.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default ModelsGrid;