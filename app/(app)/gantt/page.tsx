export const dynamic = "force-dynamic";

import { GanttChart } from "@/components/gantt/GanttChart";
import { ganttService } from "@/lib/services/registry";

export default function GanttPage() {
  const cards = ganttService.getGanttData();
  return <GanttChart cards={cards} />;
}
