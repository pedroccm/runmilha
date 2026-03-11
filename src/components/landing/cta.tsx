import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold">
          Ready to Turn Your Training Into Rewards?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Join RunMilha today and start earning milhas for every kilometer you
          run or ride. It&apos;s free to get started.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-block bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
        >
          Create Free Account
        </Link>
      </div>
    </section>
  );
}
