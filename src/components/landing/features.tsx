export function Features() {
  const steps = [
    {
      step: "01",
      title: "Connect Your Strava",
      description:
        "Link your Strava account with one click. We automatically sync your runs and rides.",
      icon: "🔗",
    },
    {
      step: "02",
      title: "Train & Earn Milhas",
      description:
        "Every kilometer you run or ride earns you milhas. The more you train, the more you earn.",
      icon: "🏃",
    },
    {
      step: "03",
      title: "Redeem Rewards",
      description:
        "Browse our marketplace and exchange milhas for discounts, products, and exclusive experiences.",
      icon: "🎁",
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Three simple steps to start earning rewards for your training.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item) => (
            <div
              key={item.step}
              className="bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <span className="text-xs font-mono text-primary font-bold">
                STEP {item.step}
              </span>
              <h3 className="text-xl font-semibold mt-2">{item.title}</h3>
              <p className="mt-3 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
