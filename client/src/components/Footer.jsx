import { Link } from "react-router-dom";
import { Vote, ExternalLink, Github } from "lucide-react";

const footerLinks = {
  Learn: [
    { label: "Election Timeline", to: "/timeline" },
    { label: "Eligibility Checker", to: "/eligibility" },
    { label: "Mock Voting", to: "/mock-voting" },
    { label: "AI Assistant", to: "/chat" },
  ],
  Resources: [
    { label: "ECI Official", href: "https://eci.gov.in", external: true },
    { label: "Voter Registration", href: "https://voters.eci.gov.in", external: true },
    { label: "Find Polling Booth", href: "https://electoralsearch.eci.gov.in", external: true },
    { label: "Election Results", href: "https://results.eci.gov.in", external: true },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-dark-900/80 mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center">
                <Vote className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="font-display font-bold text-xl">
                <span className="gradient-text">ElectEd</span>
                <span className="text-white"> AI</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              An AI-powered assistant that makes understanding Indian elections simple, accessible, and empowering for every citizen.
            </p>
            <div className="tricolor-accent mt-4 w-24" aria-hidden="true" />
            <p className="text-xs text-slate-600 mt-4">
              Information sourced from the Election Commission of India (ECI). This is an educational tool — not affiliated with the ECI.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-white mb-4">{section}</h3>
              <ul className="space-y-2.5" role="list">
                {links.map(({ label, to, href, external }) => (
                  <li key={label}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                        aria-label={`${label} (opens in new tab)`}
                      >
                        {label}
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    ) : (
                      <Link
                        to={to}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} ElectEd AI. Built for civic education.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-600">Powered by</span>
            <span className="text-xs font-medium text-primary-400">Google Gemini AI</span>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-600">Firebase</span>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-600">MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
