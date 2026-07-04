import Link from "next/link";

export default function HomePage() {
  return (
    <section aria-labelledby="home-heading" className="space-y-4">
      <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Creative studio</p>
      <h1 id="home-heading" className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
        Không gian để ý tưởng thành hình.
      </h1>
      <p className="max-w-2xl text-lg text-stone-300">
        Photo studio, podcast booth và phòng thu âm dành cho những buổi sáng tạo cần một không gian tử tế.
      </p>
      <Link
        className="mt-4 inline-flex rounded-full bg-amber-300 px-6 py-3 font-semibold text-stone-950 hover:bg-amber-200"
        href="/studios"
      >
        Khám phá studio
      </Link>
    </section>
  );
}
