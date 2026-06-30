export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text">
            <span className="text-primary">Odo</span>sian
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            AI-Powered SIEM Detection Engine
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
