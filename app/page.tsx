import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="text-xl font-medium">Photo Retrieval Discovery Engine</div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="max-w-3xl text-4xl font-medium leading-tight tracking-tight text-ink">
          Photo Retrieval Discovery Engine
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-ink">
          Discover how people retrieve visual memories when exact metadata is missing.
        </p>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          This research engine converts public user conversations into structured evidence about
          memory, search behavior, retrieval failure, and product opportunity.
        </p>
        <p className="mt-4 max-w-2xl text-sm text-muted">
          Analyzes: what users remember → what they forget → how they search → where retrieval
          breaks → workarounds → strongest opportunities. This is not sentiment analysis.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/app" className="rounded-full bg-blue px-6 py-3 text-white no-underline hover:bg-blue-dark">
            Explore Demo
          </Link>
          <Link
            href="/app/research"
            className="rounded-full border border-line px-6 py-3 text-ink no-underline hover:bg-paper"
          >
            Run Real Research
          </Link>
          <Link
            href="/app/evidence"
            className="rounded-full border border-line px-6 py-3 text-ink no-underline hover:bg-paper"
          >
            View Evidence
          </Link>
        </div>
        <p className="mt-10 max-w-2xl rounded-lg bg-paper p-4 text-sm">
          Public online discussions are directional qualitative evidence and are not representative
          of all Google Photos users. Findings must be validated through primary user research.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          AI-generated interpretations are hypotheses derived from evidence and should not be treated
          as direct user statements. Demo records are labeled{" "}
          <strong className="text-ink">SYNTHETIC DEMO DATA — NOT REAL USER EVIDENCE</strong> and never
          mix with research mode.
        </p>
      </main>
    </div>
  );
}
