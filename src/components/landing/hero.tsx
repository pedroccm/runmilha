import Link from "next/link";

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Now in Beta
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.1]">
          Your Kilometers
          <br />
          <span className="text-primary">Deserve Rewards</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect your Strava, run or ride, earn milhas for every kilometer, and
          exchange them for exclusive rewards from top brands.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            Start Earning Milhas
          </Link>
          <a
            href="#features"
            className="border border-border px-8 py-3.5 rounded-xl text-lg font-medium hover:bg-muted transition-colors"
          >
            How It Works
          </a>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div>
            <p className="text-3xl font-bold text-primary">0→1</p>
            <p className="text-sm text-muted-foreground mt-1">Beta Launch</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">4</p>
            <p className="text-sm text-muted-foreground mt-1">Plans</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">1.5x</p>
            <p className="text-sm text-muted-foreground mt-1">Max Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
}
