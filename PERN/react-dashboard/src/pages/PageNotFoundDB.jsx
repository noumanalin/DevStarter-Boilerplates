import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SITE_NAME } from "../utils/info";


const PageNotFoundDB = () => {
  return (
    <>
      <Helmet>
        <title>{`Dashboard Page Not Found | ${SITE_NAME || "MyApp"}`}</title>
        <meta name="description" content={`The dashboard page you are looking for could not be found. Please check the URL or navigate back to your dashboard on ${SITE_NAME || "MyApp"}.`} />
      </Helmet>

      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="text-center max-w-md">
          {/* 404 Icon */}
          <div className="mb-8 flex justify-center">
            <div 
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-6xl font-bold"
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
            Dashboard Page Not Found
          </h1>
          
          <p 
            className="text-base mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            The dashboard page you're looking for doesn't exist or may have been moved to a different location.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              background: "var(--brand-primary)",
              boxShadow: "0 2px 12px rgba(37,99,235,0.3)",
              color: "#fff",
            }}
            aria-label="Go back to dashboard"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
};

export default PageNotFoundDB;