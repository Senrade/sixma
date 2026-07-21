import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import GameController, {
  type CaseData,
} from "@/components/controllers/GameController";

export default async function MissionPage({
  params,
}: {
  params: Promise<{ case_id: string }>;
}) {
  const { case_id: caseId } = await params;
  const filePath = path.join(process.cwd(), "public", "data", "cases.json");

  let cases: CaseData[];

  try {
    const fileContents = await readFile(filePath, "utf8");
    cases = JSON.parse(fileContents) as CaseData[];
  } catch (error) {
    console.error("Failed to read case data:", error);
    notFound();
  }

  const currentCase = cases.find((caseData) => caseData.case_id === caseId);

  if (!currentCase) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full bg-slate-900 text-white">
      <GameController caseData={currentCase} />
    </main>
  );
}
