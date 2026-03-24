export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="flex w-full max-w-md flex-col items-center gap-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            StayHome
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Home safety for aging in place
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
