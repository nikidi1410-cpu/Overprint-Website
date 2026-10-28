import { Hero } from "@/components/hero/Hero";
import { Process } from "@/components/process/Process";
import { RecentRuns } from "@/components/runs/RecentRuns";
import { PrintQueue } from "@/components/queue/PrintQueue";
import { KineticFooter } from "@/components/footer/KineticFooter";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export default function Home() {
  return (
    <>
      <main className="relative z-10 bg-paper">
        <Hero />
        <Process />
        <RecentRuns />
        <PrintQueue />
      </main>
      <KineticFooter />
      <ScrollProgress />
    </>
  );
}
