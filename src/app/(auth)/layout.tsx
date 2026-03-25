import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="flex w-full max-w-md flex-col items-center gap-8 px-4">
        <div className="flex flex-col items-center gap-2">
          <Image src="/logo.svg" alt="StayHome" width={180} height={36} priority />
          <p className="text-sm text-zinc-400">
            Home safety for aging in place
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
