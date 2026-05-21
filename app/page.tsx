import Image from "next/image";

export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-8"
      style={{ background: "#0a0a0f" }}
    >
      <Image
        src="/dai-logo.png"
        alt="DePaul AI logo"
        width={148}
        height={148}
        priority
        className="rounded-3xl shadow-2xl"
      />

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-5xl font-light tracking-[0.25em] uppercase text-white">
          Coming Soon
        </p>
      </div>
    </div>
  );
}
