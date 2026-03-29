import { useState } from "react";

const sections = [
  {
    id: "eula",
    label: "End User License Agreement",
  },
  {
    id: "privacy",
    label: "Privacy Policy",
  },
];

export default function Legal() {
  const [active, setActive] = useState<"eula" | "privacy">("eula");

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Legal</h1>
        <p className="text-muted-foreground text-sm">
          Last updated: 29 March 2026 &mdash; CaféInvest Rwanda &bull; African Leadership University Research Initiative
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-8 border-b border-border">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id as "eula" | "privacy")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              active === s.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ──────────────────── EULA ──────────────────── */}
      {active === "eula" && (
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using CaféInvest Rwanda (the &ldquo;Platform&rdquo;), you agree to be bound by this End
              User License Agreement (&ldquo;EULA&rdquo;). If you do not agree, you must discontinue use immediately.
              This Platform is an academic research prototype developed at the African Leadership University; it is
              <strong> not</strong> a registered financial service or investment advisor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. License Grant</h2>
            <p className="text-muted-foreground leading-relaxed">
              Subject to these terms, the team grants you a limited, non-exclusive, non-transferable,
              revocable licence to access and use the Platform solely for personal, non-commercial,
              educational, and research purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Restrictions</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>You may not copy, modify, distribute, or create derivative works of the Platform.</li>
              <li>You may not reverse-engineer, decompile, or disassemble any part of the Platform.</li>
              <li>You may not use the Platform for commercial trading or financial advisory services.</li>
              <li>You may not scrape, harvest, or systematically extract data from the Platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Investment Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              All price data, forecasts, ROI projections, and back-test results are provided
              <strong> for informational and educational purposes only</strong>. They do not constitute financial,
              investment, legal, or tax advice. Past performance does not guarantee future results.
              You acknowledge that all investment decisions are made at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Data Accuracy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Price and regional data are sourced from publicly available agricultural datasets and may
              contain errors or lag behind real-time market conditions. The Platform makes no warranty,
              express or implied, as to the accuracy, completeness, or timeliness of any data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content, design elements, and underlying code are the intellectual property of the
              CaféInvest Rwanda research team unless otherwise noted. Third-party datasets remain the
              property of their respective owners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your access to the Platform at any time, without
              notice, for conduct that violates this EULA or is otherwise harmful to users, third parties,
              or the integrity of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, the CaféInvest Rwanda team shall not be liable for
              any indirect, incidental, consequential, or punitive damages arising from your use of, or
              inability to use, the Platform or any data contained therein.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              This EULA is governed by the laws of the Republic of Rwanda. Any disputes shall be resolved
              in the competent courts of Rwanda, without regard to conflict-of-law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Changes to this EULA</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this EULA from time to time. Continued use of the Platform after any change
              constitutes acceptance of the revised terms. The &ldquo;Last updated&rdquo; date at the top of this
              page reflects the most recent revision.
            </p>
          </section>
        </div>
      )}

      {/* ──────────────────── PRIVACY POLICY ──────────────────── */}
      {active === "privacy" && (
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              CaféInvest Rwanda (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed to protecting your privacy.
              This Privacy Policy explains what information we collect, how we use it, and your rights
              regarding that information. This is an academic prototype; we collect minimal data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-2">
              We collect only the information necessary to operate and improve the Platform:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                <strong>Usage data</strong> &mdash; pages visited, features used, browser type, and general
                geographic region (country level), collected via anonymous analytics.
              </li>
              <li>
                <strong>Session preferences</strong> &mdash; currency selection and display settings stored
                locally in your browser (localStorage). This data never leaves your device.
              </li>
              <li>
                <strong>No account data</strong> &mdash; the Platform does not require registration; we do not
                collect names, email addresses, or passwords.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>To monitor platform performance and fix technical issues.</li>
              <li>To understand which features are most useful to researchers and investors.</li>
              <li>To fulfil academic reporting requirements for the ALU research initiative.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              We do <strong>not</strong> sell, rent, or share your data with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Cookies &amp; Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use only functional browser storage (localStorage) to remember your in-session preferences
              (e.g., currency toggle). We do not use advertising cookies or cross-site tracking cookies.
              If an analytics service is integrated in future, we will update this policy and request consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Platform uses publicly hosted mapping tiles (OpenStreetMap/Leaflet) for the regional map
              feature. Your IP address may be visible to tile-serving infrastructure as a standard part of
              HTTP requests. We recommend reviewing OpenStreetMap&apos;s privacy policy if this is a concern.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              Anonymous aggregate usage logs are retained for a maximum of 12 months, after which they are
              permanently deleted. LocalStorage data is retained in your browser until you clear it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Under applicable data-protection law (including Rwanda&apos;s Law No. 058/2021 relating to the
              protection of personal data and privacy), you have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Request access to any personal data we hold about you.</li>
              <li>Request correction or deletion of your personal data.</li>
              <li>Object to processing of your personal data.</li>
              <li>Lodge a complaint with the relevant supervisory authority.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Because we do not collect identifiable personal data, most of these rights are satisfied by
              default. To exercise any right, contact us at the address below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We take reasonable technical measures to protect the Platform and its data. However, no
              internet transmission is completely secure. Use of the Platform is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Platform is not directed at children under 13. We do not knowingly collect personal
              data from children. If you believe a child has provided us with personal data, please
              contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any privacy-related queries or to exercise your rights, please contact the CaféInvest
              Rwanda research team via the African Leadership University&apos;s official channels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">11. Changes to this Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may revise this Privacy Policy periodically. The &ldquo;Last updated&rdquo; date at the top of
              the Legal page indicates when the most recent changes were made. Continued use of the
              Platform after changes constitutes acceptance of the revised policy.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
