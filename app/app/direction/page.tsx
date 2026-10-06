"use client";

import Link from "next/link";
import { useStore } from "@/components/Providers";
import { recommendedArchetype, researchEpisodes } from "@/lib/analytics";

export default function DirectionPage() {
  const { episodes, mode } = useStore();
  const rec = recommendedArchetype(episodes);
  const n = researchEpisodes(episodes).length;
  return (
    <article className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-medium">Research direction</h1>
      <p className="text-sm text-muted">
        {mode === "demo"
          ? "SYNTHETIC DEMO DATA — NOT REAL USER EVIDENCE."
          : "From uploaded research evidence only."}{" "}
        Observed in {n} retrieval episodes among analyzed conversations.
      </p>
      <section>
        <h2 className="text-lg font-medium">Strongest observed retrieval problem</h2>
        <p>{rec?.name ?? "Insufficient evidence."}</p>
      </section>
      <section>
        <h2 className="text-lg font-medium">Why it matters</h2>
        <p className="text-sm">{rec?.opportunity.whyAttractive}</p>
        <p className="mt-2 text-sm">
          Strategic question: increase the percentage of users who successfully
          retrieve a photo they remember but cannot precisely describe. Vague
          memory retrieval is recognition over a shortlist, not unique lookup.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-medium">Evidence</h2>
        <p className="text-sm">
          {rec?.frequency} supporting episodes:{" "}
          {rec?.evidenceIds.map((id) => (
            <Link key={id} href={`/app/evidence/${id}`} className="mr-2">
              {id}
            </Link>
          ))}
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {rec?.quotes.slice(0, 3).map((q, i) => (
            <li key={i}>{q.replace("SYNTHETIC DEMO DATA — NOT REAL USER EVIDENCE", "").trim()}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-medium">What users remember</h2>
        <p className="text-sm">{rec?.memoryPattern}</p>
      </section>
      <section>
        <h2 className="text-lg font-medium">What users forget</h2>
        <p className="text-sm">{rec?.missingInformation}</p>
      </section>
      <section>
        <h2 className="text-lg font-medium">Where current retrieval breaks</h2>
        <p className="text-sm">
          Failure {rec?.failurePoint}: {rec?.searchBehavior}. Typical product
          behavior is a short “best” set or an index that lacks the remembered
          clue.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-medium">Current workaround</h2>
        <p className="text-sm">{rec?.workaround}</p>
      </section>
      <section>
        <h2 className="text-lg font-medium">Opportunity</h2>
        <p className="text-sm">
          Overall score {rec?.opportunity.overall} among analyzed conversations only — not absolute
          truth. Investigate the incomplete-query job: a complete, time-ordered candidate set plus
          text-in-image as a date substitute. Do not assume “better Ask” is the answer.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-medium">Confidence</h2>
        <p className="text-sm">
          Medium for public qualitative evidence; High that the incomplete-clue job exists in this
          corpus; Low for population prevalence.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-medium">What must be validated through interviews</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>Are class nouns used as dated filters in real sessions?</li>
          <li>Is the photo often already in Classic / OCR results?</li>
          <li>How dominant is OCR vs faces vs unnamed places vs captions?</li>
          <li>Do users recover after a failed search, or stop?</li>
        </ul>
      </section>
      <p className="rounded bg-paper p-4 text-sm font-medium">
        AI discovery generates hypotheses. Primary user research validates them.
      </p>
    </article>
  );
}
