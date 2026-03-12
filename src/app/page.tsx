import { CyberneticBentoGrid } from "@/components/ui/cybernetic-bento-grid";
import { Hero } from "@/components/ui/hero";
import { CodeDemo } from "@/components/ui/code-demo";
import { RatingGraph } from "@/components/ui/rating-graph";
import { HeadToHead } from "@/components/ui/head-to-head";
import { SheetGenerator } from "@/components/ui/sheet-generator";

export default function Home() {
  return (
    <main>
      <Hero
        title="CPAssist that works for you."
        subtitle="Transform your learning with intelligent assistance. Simple, powerful, reliable."
        actions={[
          {
            label: "Login",
            href: "/login",
            variant: "outline",
          },
          {
            label: "Sign Up",
            href: "/signup",
            variant: "default",
          },
        ]}
        titleClassName="text-5xl md:text-6xl font-extrabold"
        subtitleClassName="text-lg md:text-xl max-w-[600px]"
        actionsClassName="mt-8"
      />
      <CodeDemo />
      <section className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          <div className="flex h-full flex-col">
            <RatingGraph />
            <p className="mt-6 text-muted-foreground text-center italic">
              "Track your progression and visualize your path to grandmaster."
            </p>
          </div>
          <div className="flex h-full flex-col">
            <HeadToHead />
            <p className="mt-6 text-muted-foreground text-center italic">
              "Compare two Codeforces profiles to uncover strengths and gaps."
            </p>
          </div>
          <div className="flex h-full flex-col">
            <SheetGenerator />
            <p className="mt-6 text-muted-foreground text-center italic">
              "Generate custom practice sheets based on your weak topics."
            </p>
          </div>
        </div>
      </section>
      <CyberneticBentoGrid />
    </main>
  );
}
