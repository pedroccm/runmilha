import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">RM</span>
            </div>
            <span className="font-bold text-xl">RunMilha</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 12, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using RunMilha (&quot;the Service&quot;), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground">
              RunMilha is a fitness rewards platform that converts physical activity kilometers
              into virtual coins called &quot;milhas&quot;. Users connect their fitness tracking accounts
              (Strava, Garmin, Polar) to automatically sync activities. Milhas can be redeemed
              for rewards in our marketplace, including promotional codes, race entries, and other benefits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must be at least 13 years old to use the Service</li>
              <li>One account per person — multiple accounts are not permitted</li>
              <li>You may not use the Service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Milhas and Virtual Currency</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Milhas are virtual coins with no real-world monetary value</li>
              <li>Milhas cannot be transferred, sold, or exchanged for cash</li>
              <li>Milhas are earned based on verified physical activities synced from connected fitness platforms</li>
              <li>The conversion rate (km to milhas) depends on your subscription plan</li>
              <li>Free tier users are subject to a monthly milhas cap</li>
              <li>We reserve the right to adjust conversion rates and caps at any time</li>
              <li>Fraudulent activity (fake GPS data, manipulated activities) will result in account termination</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Subscription Plans</h2>
            <p className="text-muted-foreground">
              RunMilha offers free and paid subscription plans. Paid plans provide higher
              conversion rates and unlimited milhas earning. Subscription fees are billed
              monthly and are non-refundable. You may cancel your subscription at any time,
              and it will remain active until the end of the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Marketplace and Rewards</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Rewards are subject to availability and may be modified or removed at any time</li>
              <li>Redeemed promotional codes and rewards are final and non-refundable</li>
              <li>Some rewards may require a minimum subscription plan</li>
              <li>Reward terms and conditions are set by the respective partner companies</li>
              <li>RunMilha is not responsible for partner products or services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Third-Party Integrations</h2>
            <p className="text-muted-foreground">
              The Service integrates with third-party fitness platforms including Strava,
              Garmin Connect, and Polar Flow. Your use of these services is subject to their
              respective terms and conditions. We are not responsible for the availability or
              accuracy of data provided by third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Prohibited Activities</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Submitting fake, manipulated, or fraudulent activity data</li>
              <li>Using GPS spoofing or activity fabrication tools</li>
              <li>Creating multiple accounts to abuse the milhas system</li>
              <li>Attempting to reverse-engineer or exploit the Service</li>
              <li>Violating any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account at any time for
              violation of these terms. Upon termination, your milhas balance and unredeemed
              rewards will be forfeited. You may delete your account at any time through your
              account settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              The Service is provided &quot;as is&quot; without warranties of any kind. We do not
              guarantee uninterrupted or error-free service. We are not responsible for any
              loss of data, milhas, or rewards due to technical issues.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, RunMilha shall not be liable for any
              indirect, incidental, special, or consequential damages arising from your use
              of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of Brazil. Any disputes shall be resolved
              in the courts of S&atilde;o Paulo, SP, Brazil.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these Terms from time to time. Continued use of the Service
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, contact us at:
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Email:</strong> pedroccm@gmail.com<br />
              <strong>Website:</strong> https://runmilha.netlify.app
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">RM</span>
              </div>
              <span className="font-semibold">RunMilha</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} RunMilha. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
