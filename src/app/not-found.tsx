import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 bg-gradient-to-br from-[#10b981]/10 via-white to-[#10b981]/5 dark:from-[#0f172a] dark:via-card dark:to-[#10b981]/10">
      <div className="bg-white dark:bg-card shadow-2xl rounded-2xl p-10 flex flex-col items-center max-w-md w-full border border-border relative overflow-hidden">
        {/* Groww-like leaf logo */}
        <div className="absolute -top-8 -right-8 opacity-20 pointer-events-none select-none">
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
            <ellipse cx="48" cy="48" rx="40" ry="40" fill="#10b981" fillOpacity="0.15" />
            <path
              d="M48 72c13.255 0 24-10.745 24-24S61.255 24 48 24 24 34.745 24 48s10.745 24 24 24Z"
              fill="#10b981"
              fillOpacity="0.25"
            />
            <path
              d="M48 68c10.493 0 19-8.507 19-19S58.493 30 48 30 29 38.507 29 49s8.507 19 19 19Z"
              fill="#10b981"
              fillOpacity="0.35"
            />
            <path
              d="M48 60c6.627 0 12-5.373 12-12S54.627 36 48 36s-12 5.373-12 12 5.373 12 12 12Z"
              fill="#10b981"
              fillOpacity="0.5"
            />
          </svg>
        </div>
        {/* Main icon */}
        <svg
          className="w-20 h-20 text-[#10b981] mb-4 drop-shadow-lg"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 48 48"
        >
          <circle cx="24" cy="24" r="22" className="stroke-[#10b981]/40" strokeWidth="2" />
          <path
            d="M16 20c0-4.418 3.582-8 8-8s8 3.582 8 8c0 4.418-3.582 8-8 8s-8-3.582-8-8zm8 12v2"
            className="stroke-[#10b981]"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h1 className="text-3xl font-extrabold text-[#10b981] mb-2 tracking-tight drop-shadow">
          404 - Page Not Found
        </h1>
        <p className="text-muted-foreground mb-6 text-center">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 rounded-md bg-[#10b981] text-white font-semibold shadow-lg hover:bg-[#059669] transition"
        >
          Go back to Dashboard
        </Link>
      </div>
    </div>
  );
}
