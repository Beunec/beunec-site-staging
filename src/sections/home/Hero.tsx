import { KineticHeadline } from "@/components/motion/KineticHeadline";
import { HeroMindMap } from "./HeroMindMap";

export const Hero = () => {
  return (
    <section className="w-full relative pt-28 md:pt-36 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 lg:items-end mb-12 md:mb-16">
          {/* The headline builds word by word, then the phrase it is about is underlined */}
          <KineticHeadline
            lead="Understanding, developing, and actualizing"
            emphasis="Agentic Infrastructure"
            className="lg:col-span-7 text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[3.75rem] leading-[1.05] tracking-tight text-foreground font-extrabold"
          />

          <p
            className="kt-fade lg:col-span-5 text-lg md:text-xl leading-relaxed text-muted-foreground max-w-xl lg:ml-auto lg:mb-1"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", ["--d" as string]: "0.45s" }}
          >
            To move toward what is unstable, understand it without fear or exaggeration, and
            contribute the research, invention, governance, and deployment required to make it
            stable.
          </p>
        </div>
      </div>

      {/* Outside max-w-7xl so it can expand wall-to-wall past the page margin */}
      <div className="kt-fade" style={{ ["--d" as string]: "0.55s" }}>
        <HeroMindMap />
      </div>
    </section>
  );
};
