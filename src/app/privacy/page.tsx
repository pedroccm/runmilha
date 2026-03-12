import Link from "next/link";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 12, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground">
              RunMilha (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a fitness rewards platform that converts
              your physical activity kilometers into virtual coins called &quot;milhas&quot;. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our
              website at runmilha.netlify.app and our mobile application (collectively, the &quot;Service&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>

            <h3 className="text-base font-medium mt-4 mb-2">2.1 Account Information</h3>
            <p className="text-muted-foreground">
              When you create an account, we collect your name, email address, and password.
              If you sign up using a third-party service (Strava, Garmin, Polar, or Google),
              we receive your profile information from that service.
            </p>

            <h3 className="text-base font-medium mt-4 mb-2">2.2 Activity Data</h3>
            <p className="text-muted-foreground">
              When you connect a fitness platform (Strava, Garmin Connect, or Polar Flow),
              we access your activity data including: activity type, distance, duration,
              start time, and pace. We only read activity data — we never post, modify,
              or delete anything on your connected accounts.
            </p>

            <h3 className="text-base font-medium mt-4 mb-2">2.3 Usage Data</h3>
            <p className="text-muted-foreground">
              We automatically collect certain information when you access the Service,
              including your IP address, browser type, operating system, and pages visited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>To create and manage your account</li>
              <li>To sync and process your fitness activities</li>
              <li>To calculate and credit milhas to your wallet</li>
              <li>To enable marketplace transactions and reward redemptions</li>
              <li>To manage your subscription plan</li>
              <li>To improve and optimize the Service</li>
              <li>To communicate with you about your account or the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Third-Party Integrations</h2>
            <p className="text-muted-foreground">
              We integrate with the following third-party fitness platforms:
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1 mt-2">
              <li><strong>Strava</strong> — We use the Strava API to read your activity data. Governed by Strava&apos;s API Agreement.</li>
              <li><strong>Garmin Connect</strong> — We use the Garmin Health API to receive your activity data via push notifications.</li>
              <li><strong>Polar Flow</strong> — We use the Polar AccessLink API to read your exercise data.</li>
              <li><strong>Google</strong> — We offer Google Sign-In for authentication purposes only.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              You can disconnect any third-party service at any time from your account settings.
              Upon disconnection, we stop receiving new data from that service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Storage and Security</h2>
            <p className="text-muted-foreground">
              Your data is stored securely using Supabase (built on PostgreSQL) with
              Row Level Security (RLS) policies ensuring you can only access your own data.
              Authentication tokens for connected services are encrypted and stored securely.
              We use HTTPS for all data transmission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell, trade, or rent your personal information to third parties.
              We do not share your fitness data with other platforms or services.
              Your activity data is used solely for calculating milhas within the RunMilha platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your data for as long as your account is active. If you delete your account,
              we will delete your personal data, activity records, and wallet information within 30 days.
              Some anonymized, aggregated data may be retained for analytics purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
            <p className="text-muted-foreground">You have the right to:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1 mt-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Disconnect third-party services at any time</li>
              <li>Export your data</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              In accordance with Brazil&apos;s General Data Protection Law (LGPD), you may exercise
              these rights by contacting us at the email below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Cookies</h2>
            <p className="text-muted-foreground">
              We use essential cookies for authentication and session management.
              We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              The Service is not intended for users under 13 years of age.
              We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the
              &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy or your personal data, contact us at:
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
