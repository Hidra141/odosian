import Link from "next/link";

const FEATURES = [
  {
    title: "AI-Powered Analysis",
    description: "Score, rate, and get actionable feedback on your detection rules using advanced language models.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" />
        <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
        <path d="M4 13h4M16 13h4M8 17h8" />
      </svg>
    ),
  },
  {
    title: "MITRE ATT&CK Mapping",
    description: "Automatically map detection rules to tactics, techniques, and sub-techniques with confidence scores.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    title: "Rule Templates",
    description: "Start from battle-tested templates for common threat scenarios and customize to your environment.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  },
  {
    title: "Evasion Risk Detection",
    description: "Identify blind spots and evasion techniques attackers could use to bypass your detection rules.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
  },
  {
    title: "Custom Scoring",
    description: "Define custom fields, scoring criteria, and quality gates tailored to your organization's standards.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    title: "Webhook Integration",
    description: "Push events to external systems with HMAC-signed webhooks for rule changes, analyses, and logins.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <nav className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-text">
            <span className="text-primary">Odo</span>sian
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-text-secondary hover:text-text transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" />
            <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
          </svg>
          AI-Powered Detection Engineering
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text tracking-tight leading-tight mb-6">
          Analyze, Enhance &<br />
          <span className="text-primary">Secure</span> Your SIEM Rules
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Odosian uses AI to score, map, and improve your Elastic SIEM detection rules.
          Find blind spots, reduce false positives, and ship production-ready rules faster.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-border text-text rounded-lg font-medium hover:bg-surface-light transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-text mb-3">
            Everything you need for detection engineering
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            A complete platform for building, analyzing, and maintaining high-quality Elastic SIEM detection rules.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-text mb-3">Ready to improve your detections?</h2>
          <p className="text-text-secondary mb-6">Start analyzing your Elastic SIEM rules in minutes.</p>
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Odosian. AI-Powered SIEM Detection Engine.
          </p>
        </div>
      </footer>
    </div>
  );
}
