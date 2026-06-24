import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LayoutDashboard, FileText, Users, Settings, TrendingUp, Shield, Zap, Database } from "lucide-react";
import { 
  SITE_NAME, 
  linkedIn, 
  github, 
  facebook, 
  instagram, 
  twitter , whatsApp
} from "../utils/info";

const HomePage = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "LinkedIn", link: linkedIn, img: "/icons/icon-linkedin.webp" },
    { name: "GitHub", link: github, img: "/icons/github.webp" },
    { name: "Facebook", link: facebook, img: "/icons/icon-fb.webp" },
    { name: "Instagram", link: instagram, img: "/icons/icon-insta.webp" },
    { name: "Twitter", link: twitter, img: "/icons/icon-t.webp" },
    { name: "WhatsApp", link: whatsApp, img: "/icons/icon-wa.webp" },

  ];

  return (
    <>
      <Helmet>
        <title>{`Admin Dashboard | ${SITE_NAME || "MyApp"}`}</title>
        <meta name="description" content={`${SITE_NAME || "MyApp"} Admin Dashboard - Manage your application, users, content, and analytics all in one place.`} />
      </Helmet>

      {/* Hero Section */}
      <section 
        className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-16"
        style={{ background: "var(--background)" }}
        aria-label="Dashboard welcome section"
      >


        <div className="max-w-4xl mx-auto text-center">
          {/* Dashboard Icon */}
          <div className="mb-8 flex justify-center">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ 
                background: "var(--brand-primary)",
                boxShadow: "0 4px 20px rgba(37,99,235,0.3)"
              }}
            >
              <LayoutDashboard className="w-10 h-10 text-white" />
            </div>
          </div>

          

          {/* Heading */}
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Welcome to{" "}
            <span style={{ color: "var(--brand-primary)" }}>
              {SITE_NAME || "MyApp"}
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-lg sm:text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Powerful <strong>Admin Dashboard</strong> for managing your application, users, content, 
            and analytics. Built with React, Express, and PostgreSQL.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto"
              style={{
                background: "var(--brand-primary)",
                boxShadow: "0 2px 16px rgba(37,99,235,0.35)",
                color: "#fff",
              }}
              aria-label="Go to dashboard"
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Link>

            <Link
              to="/dashboard/manage-blogs"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-full transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              aria-label="Manage content"
            >
              <FileText className="w-5 h-5 mr-2" />
              Manage Content
            </Link>
          </div>

          {/* Tech Stack Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <span 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)"
              }}
            >
              <Database className="w-3.5 h-3.5" />
              PostgreSQL
            </span>
            <span 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)"
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              React
            </span>
            <span 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)"
              }}
            >
              <Shield className="w-3.5 h-3.5" />
              Express
            </span>
            <span 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)"
              }}
            >
              <Database className="w-3.5 h-3.5" />
              MySQL / MongoDB
            </span>
          </div>

          {/* Key Features */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>User Management</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Content Management</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Analytics</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Settings className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Settings</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="border-t px-4 py-6"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)"
        }}
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
           <p 
            className="text-sm text-center sm:text-left mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            &copy; {currentYear} {SITE_NAME || "MyApp"}. All rights reserved.
          </p>


          {/* Made with love and social links */}
         <p 
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Made with{" "}
              <span role="img" aria-label="love">
                ❤️
              </span>{" "}
              by{" "}
              <a
                href={linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium transition-colors hover:underline"
                style={{ color: "var(--brand-primary)" }}
                aria-label="Visit Nouman Ali's LinkedIn profile"
              >
                me
              </a>
            </p>
        </div>
      </footer>
    </>
  );
};

export default HomePage;