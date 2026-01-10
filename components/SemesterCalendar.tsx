import React from "react";
import { cn } from "@/lib/utils";
import { SessionCalendarProps, usePlanner } from "@/contexts/PlannerContext";
import { addDaysLocal, addTimes, dateFromSydneyLocalTime } from "@/lib/timeUtils";
import { ExternalLink } from "lucide-react";

type CellData = {
  weight: number;
  assignments: {
    subject?: string;
    name?: string;
    weighting?: number;
    dueText?: string;
    isHurdle?: boolean;
    anchor?: string;
    unitGuideURL?: string;
  }[];
};

const PRIMARY_BASE: [number, number, number] = [198, 32, 62];

const SemesterCalendar = () => {
  const { planner } = usePlanner();
  const subjects = planner.subjects ?? [];
  const calendar = planner.calendar as SessionCalendarProps;
  const weeks = planner.calendar?.week ?? {};
  const weekEntries = Object.entries(weeks)
    .map(([num, data]) => {
      const n = Number(num);
      if (Number.isNaN(n)) return null;
      const label = data.weekLabelShort?.length ? data.weekLabelShort.join(" • ") : `Week ${n}`;
      return { number: n, label };
    })
    .filter(Boolean)
    .sort((a, b) => a!.number - b!.number) as { number: number; label: string }[];

  const headerHeight = "2.75rem";
  const rowHeight = "3rem";
  const subjectColWidth = "7rem";
  const gridTemplateRows = `${headerHeight} repeat(${Math.max(subjects.length, 1)}, ${rowHeight})`;
  const gridTemplateCols = `${subjectColWidth} ${weekEntries.map(() => "minmax(2rem,1fr)").join(" ") || "1fr"}`;
  // Change this to test different current day if needed
  const today = new Date();

  const periods = [calendar.firstHalf, calendar.recess, calendar.secondHalf, calendar.examPeriod];
  const start = new Date(planner.milestone?.["study period start"]!);
  const end = new Date(planner.milestone?.["exams end"]!);

  const periodOverlay: { color: string; start: number; end: number }[] = [];
  let lastEndOverlay = 0;
  for (const period of periods) {
    if (!period) continue;
    let color = "";
    if (period === calendar.firstHalf || period === calendar.secondHalf) {
      color = `bg-green-200/30`;
    } else if (period === calendar.recess) {
      color = `bg-amber-200/30`;
    } else if (period === calendar.examPeriod) {
      color = `bg-blue-200/30`;
    }
    const startOverlay = lastEndOverlay;
    const endOverlay =
      ((addDaysLocal(new Date(period.endDate!), -1).getTime() - start.getTime()) /
        (end.getTime() - start.getTime())) *
      100;
    lastEndOverlay = endOverlay;
    periodOverlay.push({
      color,
      start: startOverlay,
      end: endOverlay,
    });
  }
  if (periodOverlay.length) {
    periodOverlay[periodOverlay.length - 1].end = 100;
  }

  let todayPercent: number | null = null;
  if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && !Number.isNaN(today.getTime())) {
    const raw = ((addTimes(today, { days: -1, hours: -12 }).getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100;
    todayPercent = Math.max(0, Math.min(100, raw));
  }

  // Build per-subject cell data
  const cellMatrix: CellData[][] = subjects.map(() =>
    weekEntries.map(() => ({ weight: 0, assignments: [] }))
  );
  subjects.forEach((subject, sIdx) => {
    for (const asm of subject.assignments ?? []) {
      if (!asm.dueWeek) continue;
      const colIdx = weekEntries.findIndex((w) => w.number === asm.dueWeek);
      if (colIdx < 0) continue;
      cellMatrix[sIdx][colIdx].weight += asm.weighting ?? 0;
      cellMatrix[sIdx][colIdx].assignments.push({
        subject: subject.unitCode || subject.unitName,
        name: asm.name,
        weighting: asm.weighting,
        dueText: asm.dueText,
        isHurdle: asm.isHurdle,
        anchor: asm.anchor,
        unitGuideURL: subject.unitGuideURL,
      });
    }
  });

  // Total weight per week across all subjects (for column-wide colouring)
  const columnWeights = weekEntries.map((_, colIdx) =>
    subjects.reduce((acc, _subj, sIdx) => acc + (cellMatrix[sIdx]?.[colIdx]?.weight ?? 0), 0)
  );
  const maxColumnWeight = columnWeights.length ? Math.max(...columnWeights, 0.0001) : 0.0001;
  const columnWeightToBg = (weight: number) => {
    if (!weight || weight <= 0) return undefined;
    const ratio = Math.min(weight / maxColumnWeight, 1);
    const alpha = 0.15 + ratio * 0.6; // 0.15 -> 0.75 scaled by heaviest week
    return `rgba(${PRIMARY_BASE[0]}, ${PRIMARY_BASE[1]}, ${PRIMARY_BASE[2]}, ${alpha.toFixed(3)})`;
  };

  return (
    <div className="w-full bg-card text-card-foreground shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div
          className="grid relative"
          style={{
            gridTemplateRows,
            gridTemplateColumns: gridTemplateCols,
            minWidth: `${160 + weekEntries.length * 60}px`,
          }}
        >
          {/* Period overlay (header only) */}
          <div
            className="absolute pointer-events-none"
            style={{ left: `${subjectColWidth}`, right: 0, top: 0, height: headerHeight }}
          >
            {periodOverlay.map((overlay) => (
              <div
                key={overlay.color + overlay.start}
                className={cn("absolute", `${overlay.color}`)}
                style={{
                  width: `${overlay.end - overlay.start}%`,
                  left: `${overlay.start}%`,
                  top: 0,
                  bottom: 0,
                }}
              />
            ))}
          </div>
          {/* Current day line (full height) */}
          {todayPercent !== null && (
            <div
              className="absolute pointer-events-none"
              style={{ left: `${subjectColWidth}`, right: 0, top: 0, bottom: 0 }}
            >
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-primary/70"
                style={{ left: `${todayPercent}%` }}
              />
            </div>
          )}

          {/* Top-left header (sticky) */}
          <div className="flex items-center justify-center font-semibold text-sm bg-muted sticky left-0 z-10">
            Subject
          </div>

          {/* Week headers */}
          {weekEntries.length === 0 ? (
            <div className="flex items-center px-3 text-sm text-muted-foreground bg-muted/40">
              No weeks available
            </div>
          ) : (
            weekEntries.map((w) => (
              <div
                key={`wk-header-${w.number}`}
                className="flex items-center p-3 justify-center text-xs font-semibold uppercase tracking-wide bg-muted/40 border-x"
              >
                {w.label}
              </div>
            ))
          )}

          {/* Subject column */}
          {subjects.length === 0 ? (
            <div className="col-start-1 row-start-2 flex items-center px-3 text-sm text-muted-foreground bg-card">
              No subjects
            </div>
          ) : (
            subjects.map((subject, idx) => (
              <div
                key={`subj-${subject.unitCode || idx}`}
                className="flex items-center px-3 text-sm bg-card sticky left-0 z-10"
                style={{ gridRowStart: idx + 2 }}
              >
                {subject.unitCode || subject.unitName || `Subject ${idx + 1}`}
              </div>
            ))
          )}

          {/* Content cells */}
          {subjects.map((subject, rowIdx) =>
            weekEntries.map((w, colIdx) => (
              <div
                key={`cell-${rowIdx}-${w.number}`}
                className="relative flex items-center justify-center text-xs text-muted-foreground bg-background/60 group"
                style={{
                  gridRowStart: rowIdx + 2,
                  gridColumnStart: colIdx + 2,
                  // Colour entire column based on total weekly load (even if this subject has none)
                  backgroundColor: columnWeightToBg(columnWeights[colIdx]),
                }}
              >
                {cellMatrix[rowIdx]?.[colIdx]?.weight
                  ? cellMatrix[rowIdx][colIdx].weight.toFixed(1)
                  : "—"}
                {cellMatrix[rowIdx]?.[colIdx]?.assignments.length ? (
                  <div className="absolute z-50 hidden w-72 max-w-[18rem] -translate-x-1/2 -translate-y-2 whitespace-normal rounded-md border border-border bg-card p-3 text-foreground shadow-lg group-hover:block">
                    <div className="text-xs font-semibold mb-1">Assignments</div>
                    <div className="space-y-2">
                      {cellMatrix[rowIdx][colIdx].assignments.map((asm, idx) => (
                        <div key={`c-${rowIdx}-${colIdx}-${idx}`} className="text-xs">
                          <div className="font-semibold">{subject.unitCode ? `${subject.unitCode}: ` : ""}{asm.name || "Untitled"}</div>
                          <div className="text-muted-foreground">
                            Weight: {asm.weighting ?? 0}% | Hurdle: {asm.isHurdle ? "Yes" : "No"}
                          </div>
                          {asm.dueText && (
                            <div className="text-muted-foreground">Due: {asm.dueText}</div>
                          )}
                          {asm.anchor && asm.unitGuideURL && (
                            <a
                              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                              href={`${asm.unitGuideURL}#${asm.anchor}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View in Unit Guide
                              <ExternalLink className="size-3.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SemesterCalendar;
