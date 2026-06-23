import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SITE_NAME } from "../utils/info"; 

const PageNotFound = () => {
  return (
    <>
      <Helmet>
        <title>{`Page Not Found | ${SITE_NAME || "MyApp"}`}</title>
        <meta name="description" content={`The page you are looking for could not be found. Please check the URL or navigate back to ${SITE_NAME || "MyApp"}.`} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
        <div className="text-center max-w-md">
          {/* 404 Icon */}
          <div className="mb-8 flex justify-center">
            <div 
              className="px-3 py-5 rounded-2xl flex items-center justify-center text-6xl font-bold"
              style={{ 
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--brand-primary)"
              }}
            >
              404
            </div>
          </div>

          <h1 
            className="text-3xl font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Page Not Found
          </h1>
          
          <p 
            className="text-base mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              background: "var(--brand-primary)",
              boxShadow: "0 2px 12px rgba(37,99,235,0.3)",
              color: "#fff",
            }}
            aria-label="Go back to homepage"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default PageNotFound;