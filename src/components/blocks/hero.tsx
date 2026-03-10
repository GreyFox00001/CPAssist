import { Hero } from "@/components/ui/hero"

function HeroDemo() {
  return (
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
  )
}

export { HeroDemo }
