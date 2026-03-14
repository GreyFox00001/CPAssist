import Link from "next/link";
import { ArrowRight, FileSpreadsheet } from "lucide-react";

export function SheetGenerator() {
  return (
    <div className="relative group p-8 rounded-3xl border border-border bg-card/40 backdrop-blur-xl overflow-hidden shadow-2xl h-full min-h-140 flex flex-col">
      <div className="mb-8 rounded-2xl border border-border bg-background/30 px-4 py-3">
        <FileSpreadsheet className="w-5 h-5 text-primary" />
      </div>

      <h3 className="text-3xl md:text-4xl font-black mb-4">Personalized Sheets</h3>
      <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
        Generate custom problem sheets tailored to your skill level from any
        Codeforces profile.
      </p>

      <div className="space-y-4 mb-10">
        {[
          "Smart difficulty curation",
          "Progress tracking",
          "Topic-focused training",
        ].map((item) => (
          <div key={item} className="flex items-center gap-3 text-foreground/90">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 border border-border">
              <ArrowRight className="w-4 h-4 text-primary" />
            </span>
            <span className="text-base md:text-xl">{item}</span>
          </div>
        ))}
      </div>

      <Link
        href="/signup"
        className="mt-auto inline-flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-primary/10 px-5 py-3 text-base md:text-xl font-semibold text-primary transition-colors hover:bg-primary/20"
      >
        Create Your Sheet
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
