import React from "react";
import { cn } from "@/lib/utils";
import { SessionCalendarProps, SubjectProps, usePlanner } from "@/contexts/PlannerContext";
import { addDaysLocal, addTimes, plainDateToZonedMidnight, toSydneyPlainDate, toSydneyZonedDateTime, SYDNEY_TZ } from "@/lib/timeUtils";
import { ExternalLink } from "lucide-react";
import { Temporal } from "temporal-polyfill";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

type CellData = {
  weight: number;
  assessments: {
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
const SECONDARY_BASE: [number, number, number] = [32, 32, 197];


const SemesterCalendar = () => {
  const { planner } = usePlanner();
  const cloneSubjects = planner.subjects ?? [];
  const subjects = [...cloneSubjects];

  if (subjects.length > 0) {
    const newOverall: SubjectProps = {
      id: "overallSemesterEntry",
      unitCode: "Overall %"
    }
    subjects.push(newOverall);
  }

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
  const today = Temporal.Now.zonedDateTimeISO(SYDNEY_TZ);

  const periods = [calendar.firstHalf, calendar.recess, calendar.secondHalf, calendar.examPeriod];
  const studyStartKey = planner.milestone?.["study period start"];
  const examsEndKey = planner.milestone?.["exams end"];
  const start = studyStartKey ? toSydneyZonedDateTime(studyStartKey) : null;
  const end = examsEndKey ? toSydneyZonedDateTime(examsEndKey) : null;

  const periodOverlay: { color: string; start: number; end: number }[] = [];
  let todayPercent: number | null = null;

  if (start && end) {
    const spanMs = end.epochMilliseconds - start.epochMilliseconds;
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
      const periodEnd = toSydneyPlainDate(period.endDate);
      if (!periodEnd) continue;
      const startOverlay = lastEndOverlay;
      const endOverlay =
        ((plainDateToZonedMidnight(addDaysLocal(periodEnd, -1)).epochMilliseconds - start.epochMilliseconds) /
          spanMs) *
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

    const adjustedToday = addTimes(today, { days: -1, hours: -12 }) as Temporal.ZonedDateTime;
    const raw = ((adjustedToday.epochMilliseconds - start.epochMilliseconds) / spanMs) * 100;
    todayPercent = Math.max(0, Math.min(100, raw));
  }

  // Build per-subject cell data
  const cellMatrix: CellData[][] = subjects.map(() =>
    weekEntries.map(() => ({ weight: 0, assessments: [] }))
  );
  // Build overall percentage data

  const overallIdx = cellMatrix.length - 1;
  // console.log(overallIdx)
  // console.log(cellMatrix[overallIdx].length)




  // console.log(cellMatrix)
  subjects.forEach((subject, sIdx) => {
    for (const asm of subject.assessments ?? []) {
      if (!asm.dueWeek) continue;
      const colIdx = weekEntries.findIndex((w) => w.number === asm.dueWeek);
      if (colIdx < 0) continue;
      cellMatrix[sIdx][colIdx].weight += asm.weighting ?? 0;
      cellMatrix[sIdx][colIdx].assessments.push({
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

  for (let i = 0; i < cellMatrix[overallIdx].length; i++) { // column iteration
    let totalPerW = 0;
    for (let j = 0; j < subjects.length - 1; j++) {// row iteration
      totalPerW += cellMatrix[j][i].weight;
    }
    cellMatrix[overallIdx][i].weight = totalPerW;
  }


  // Total weight per week across all subjects (for column-wide colouring)
  const columnWeights = weekEntries.map((_, colIdx) =>
    subjects.reduce((acc, _subj, sIdx) => acc + (cellMatrix[sIdx]?.[colIdx]?.weight ?? 0), 0)
  );
  const maxColumnWeight = columnWeights.length ? Math.max(...columnWeights, 0.0001) : 0.0001;
  const columnWeightToBg = (weight: number, base: [number, number, number]) => {
    if (!weight || weight <= 0) return undefined;
    const ratio = Math.min(weight / maxColumnWeight, 1);
    const alpha = 0.25 + ratio * 0.6; // 0.15 -> 0.75 scaled by heaviest week
    return `rgba(${base[0]}, ${base[1]}, ${base[2]}, ${alpha.toFixed(3)})`;
  };

  return (
    <div className="w-full bg-card text-card-foreground shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <TooltipProvider>
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
                  className={cn("flex items-center px-3 text-sm bg-card sticky left-0 z-10",
                    idx == subjects.length - 1 ? "border-t border-gray-600/40" : ""
                  )}
                  style={{ gridRowStart: idx + 2 }}
                >
                  {subject.unitCode || subject.unitName || `Subject ${idx + 1}`}
                </div>
              ))
            )}

            {/* Content cells */}
            {subjects.map((subject, rowIdx) =>
              weekEntries.map((w, colIdx) => {
                const cell = cellMatrix[rowIdx]?.[colIdx];
                const hasAssessments = Boolean(cell?.assessments.length);

                const cellContent = (
                  <div
                    className={cn(
                      "relative flex items-center justify-center text-xs bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary/40",
                      rowIdx == subjects.length - 1 ? "border-t border-gray-600/40" : "",
                      cell?.weight ? " text-gray-100 " : "text-muted-foreground"
                    )}
                    tabIndex={0}
                    style={{
                      gridRowStart: rowIdx + 2,
                      gridColumnStart: colIdx + 2,
                      textShadow: cell?.weight ? "0 1px 2px rgba(0, 0, 0, 0.35)" : "none",
                      backgroundColor: columnWeightToBg(
                        columnWeights[colIdx],
                        rowIdx != subjects.length - 1 ? PRIMARY_BASE : SECONDARY_BASE
                      ),
                    }}
                  >
                    {cell?.weight ? cell.weight.toFixed(1) : "—"}
                  </div>
                );

                if (!hasAssessments) {
                  return React.cloneElement(cellContent, { key: `cell-${rowIdx}-${w.number}` });
                }

                return (
                  <Tooltip key={`cell-${rowIdx}-${w.number}`} delayDuration={0}>
                    <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="center"
                      sideOffset={6}
                      className="w-72 max-w-[18rem] bg-card text-foreground border border-border shadow-lg"
                      // arrowClassName="fill-[hsl(var(--card))] stroke-[hsl(var(--card))]"
                      arrowClassName='bg-background fill-background'

                    >
                      <div className="text-xs font-semibold mb-1">Assessments</div>
                      <div className="space-y-2">
                        {cell.assessments.map((asm, idx) => (
                          <div key={`c-${rowIdx}-${colIdx}-${idx}`} className="text-xs">
                            <div className="font-semibold">
                              {subject.unitCode ? `${subject.unitCode}: ` : ""}
                              {asm.name || "Untitled"}
                            </div>
                            <div className="text-muted-foreground">
                              Weight: {asm.weighting ?? 0}% | Hurdle: {asm.isHurdle ? "Yes" : "No"}
                            </div>
                            {asm.dueText && <div className="text-muted-foreground">Due: {asm.dueText}</div>}
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
                    </TooltipContent>
                  </Tooltip>
                );
              })
            )}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default SemesterCalendar;
