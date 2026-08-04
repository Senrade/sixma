import { HomeContent } from "@/components/home/HomeContent";
import { getCases } from "@/lib/cases";

export default async function Home() {
  const cases = await getCases();
  return <HomeContent cases={cases} />;
}
