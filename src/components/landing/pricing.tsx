import Link from "next/link";
import { PLANS } from "@/lib/constants";

export function Pricing() {
  const plans = Object.values(PLANS);

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">Choose Your Plan</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            The higher your plan, the more milhas you earn per kilometer. Like
            airline miles, but for athletes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isPopular = "popular" in plan && plan.popular;
            return (
              <div
                key={plan.slug}
                className={`relative bg-card border rounded-2xl p-6 flex flex-col ${
                  isPopular
                    ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                    : "border-border"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {plan.priceCents === 0
                      ? "Free"
                      : `R$${(plan.priceCents / 100).toFixed(2).replace(".", ",")}`}
                  </span>
                  {plan.priceCents > 0 && (
                    <span className="text-muted-foreground text-sm">/month</span>
                  )}
                </div>
                <div className="mt-4 py-3 px-4 rounded-lg bg-muted text-center">
                  <span className="text-2xl font-bold text-primary">
                    {plan.conversionRate}x
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    milhas per km
                  </p>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-primary mt-0.5">&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-6 block text-center py-2.5 rounded-lg font-medium transition-colors ${
                    isPopular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  {plan.priceCents === 0 ? "Get Started" : "Subscribe"}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
