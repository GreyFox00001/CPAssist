import { CyberneticBentoGrid } from "@/components/ui/cybernetic-bento-grid";
import { Hero } from "@/components/ui/hero";
import { CodeDemo } from "@/components/ui/code-demo";
import { RatingGraph } from "@/components/ui/rating-graph";
import { HeadToHead } from "@/components/ui/head-to-head";
import { SheetGenerator } from "@/components/ui/sheet-generator";
import { ShootingStars } from "@/components/ui/shooting-stars";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,var(--chart-accent-1),transparent_32%),radial-gradient(circle_at_82%_8%,var(--chart-accent-7),transparent_28%),radial-gradient(circle_at_50%_92%,var(--chart-accent-2),transparent_34%)] opacity-[0.08] dark:opacity-[0.14]" />
      </div>
      <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
        <div className="absolute inset-0 starfield-overlay" />
      </div>
      <ShootingStars
        starColor="#0891b2"
        trailColor="#60a5fa"
        minSpeed={14}
        maxSpeed={32}
        minDelay={900}
        maxDelay={2600}
        starWidth={22}
        starHeight={2}
        className="pointer-events-none fixed inset-0 z-40 opacity-70 drop-shadow-[0_0_12px_rgba(14,165,233,0.55)] dark:opacity-80 dark:drop-shadow-[0_0_14px_rgba(103,232,249,0.75)]"
      />
      <ShootingStars
        starColor="#16a34a"
        trailColor="#06b6d4"
        minSpeed={10}
        maxSpeed={26}
        minDelay={1500}
        maxDelay={3600}
        starWidth={18}
        starHeight={2}
        className="pointer-events-none fixed inset-0 z-40 opacity-55 drop-shadow-[0_0_10px_rgba(34,197,94,0.45)] dark:opacity-65 dark:drop-shadow-[0_0_12px_rgba(34,197,94,0.65)]"
      />
      <div className="relative z-10">
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
                &quot;Track your progression and visualize your path to grandmaster.&quot;
              </p>
            </div>
            <div className="flex h-full flex-col">
              <HeadToHead />
              <p className="mt-6 text-muted-foreground text-center italic">
                &quot;Compare two Codeforces profiles to uncover strengths and gaps.&quot;
              </p>
            </div>
            <div className="flex h-full flex-col">
              <SheetGenerator />
              <p className="mt-6 text-muted-foreground text-center italic">
                &quot;Generate custom practice sheets based on your weak topics.&quot;
              </p>
            </div>
          </div>
        </section>
        <CyberneticBentoGrid />
      </div>
    </main>
  );
}
