'use client';

import React, { useMemo, useState } from "react";
import { usePlanner } from "@/contexts/PlannerContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Check, Calendar, Hash, Ghost } from "lucide-react";
import { cn } from "@/lib/utils";
import { Temporal } from "temporal-polyfill";
import { SYDNEY_TZ, toSydneyPlainDate } from "@/lib/timeUtils";


const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

type WeekRow = {
    weekNumber: number;
    label: string;
    fullLabel: string;
    days: { date: Temporal.PlainDate; dayOfMonth: number }[];
    isRecess: boolean;
    isExam: boolean;
    isStudy: boolean;
    monthStart?: string;
};

type PeriodCalendarPopupProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedWeek?: number;
    selectedDate?: string;
    onSelectWeek: (weekNumber: number) => void;
    onSelectDate?: (date: string, weekNumber: number) => void;
};

type HoverInfo = { type: "week"; label: string } | { type: "date"; dateStr: string; weekLabel: string } | null	;	;

const PeriodCalendarPopup = ({
    open,
    onOpenChange,
    selectedWeek,
    selectedDate,
    onSelectWeek,
    onSelectDate,
}: PeriodCalendarPopupProps) => {
    const { planner } = usePlanner();
    const today = useMemo(() => Temporal.Now.plainDateISO(SYDNEY_TZ), []);
    const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

    const weekRows: WeekRow[] = useMemo(() => {
        const weeks = planner.calendar?.week ?? {};
        const entries = Object.entries(weeks)
            .map(([num, data]) => ({ num: Number(num), data }))
            .filter((e) => !Number.isNaN(e.num))
            .sort((a, b) => a.num - b.num);

        if (entries.length === 0) return [];

        let prevMonth = -1;
        let prevYear = -1;

        return entries.map((entry) => {
            const { num, data } = entry;
            const startDate = data.startDate;
            if (!startDate) return null;

            const mondayPlain = toSydneyPlainDate(startDate);
            if (!mondayPlain) return null;
            const days: WeekRow["days"] = [];

            for (let d = 0; d < 7; d++) {
                const dayPlain = mondayPlain.add({ days: d });
                days.push({ date: dayPlain, dayOfMonth: dayPlain.day });
            }

            const label = data.weekLabelShort?.length ? data.weekLabelShort.join(" · ") : `W${num}`;
            const fullLabel = data.weekLabel?.length ? data.weekLabel.join(" · ") : `Week ${num}`;

            let monthStart: string | undefined;
            const month = mondayPlain.month;
            const year = mondayPlain.year;

            if (month !== prevMonth || year !== prevYear) {
                monthStart = `${MONTH_NAMES[month - 1]} ${year}`;
                prevMonth = month;
                prevYear = year;
            }

            return {
                weekNumber: num,
                label,
                fullLabel,
                days,
                isRecess: Boolean(data.hasRecessPeriod),
                isExam: Boolean(data.hasExamPeriod),
                isStudy: Boolean(data.hasStudyPeriod),
                monthStart,
            } satisfies WeekRow;
        }).filter(Boolean) as WeekRow[];
    }, [planner.calendar?.week]);

    const periodLabel = useMemo(() => {
        if (weekRows.length === 0) return "No period loaded";
        const begin = weekRows[0].days[0].date;
        const end = weekRows[weekRows.length - 1].days[6].date;
        return `${MONTH_NAMES[begin.month - 1]}, ${begin.day} ${begin.year} – ${MONTH_NAMES[end.month - 1]}, ${end.day} ${end.year}`;
    }, [weekRows]);

    const handlePickWeek = (weekNum: number) => {
        onSelectWeek(weekNum);
        onOpenChange(false);
    };

    const handleDayClick = (day: Temporal.PlainDate, weekNum: number) => {
        if (onSelectDate) onSelectDate(day.toString(), weekNum);
        onOpenChange(false);
    };

    // Current selection label
    const currentSelectionLabel = useMemo(() => {
        if (selectedDate) {
            const d = Temporal.PlainDate.from(selectedDate);
            return `${MONTH_NAMES[d.month - 1]} ${d.day}, ${d.year}`;
        }
        if (selectedWeek !== undefined) {
            const row = weekRows.find((r) => r.weekNumber === selectedWeek);
            return row ? row.fullLabel : `Week ${selectedWeek}`;
        }
        return null;
    }, [selectedDate, selectedWeek, weekRows]);

    // Hover preview label
    const hoverLabel = useMemo(() => {
        if (!hoverInfo) {
            return null;
        }
        if (hoverInfo.type === "week") {
            console.log(hoverInfo.label)
            return hoverInfo.label + " - You don't know specific date";
        }
        const d = Temporal.PlainDate.from(hoverInfo.dateStr);
        return `${hoverInfo.weekLabel} - ${MONTH_NAMES[d.month - 1]} ${d.day}, ${d.year} `;
    }, [hoverInfo]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="fixed p-0 max-w-2xl w-full border-none bg-transparent shadow-none sm:max-w-2xl max-h-[90vh] h-auto" showCloseButton={false}>
                <Card className="w-full max-h-[90vh] flex flex-col border-none shadow-2xl">
                    <CardHeader className="shrink-0 pb-0">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl font-bold text-slate-900">Pick a Week or Date</CardTitle>
                            <CardDescription className="text-sm font-medium text-slate-500">{periodLabel}</CardDescription>
                        </div>

						{/* Preview box */}
						<div className="w-fit">
							<div className={cn(
								"flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-200",
								hoverLabel
									? "border-primary/30 bg-primary/5"
									: currentSelectionLabel
										? "border-green-200 bg-green-50/50"
										: "border-slate-200 bg-slate-50/50"
							)}>
								{hoverLabel ? (
									<>
										<span className="text-xs text-muted-foreground">Selected:</span>
										<span className="text-xs font-semibold text-primary">{hoverLabel}</span>
									</>
								) : currentSelectionLabel ? (
									<>
										{selectedDate ? <Calendar className="size-3.5 text-green-600 shrink-0" /> : <Hash className="size-3.5 text-green-600 shrink-0" />}
										<span className="text-xs text-muted-foreground">Selected:</span>
										<span className="text-xs font-semibold text-green-700">{currentSelectionLabel}</span>
									</>
								) : (
									<span className="text-xs text-muted-foreground">Hover over a week or date to preview</span>
								)}
							</div>
                        </div>


                        <CardAction>
                            <Button size="icon" variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
                                <X className="size-5 text-slate-400" />
                            </Button>
                        </CardAction>
                    </CardHeader>

                    

                    <CardContent className="overflow-y-auto flex-1 px-6 pb-6">
                        {weekRows.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No study period loaded.</p>
                        ) : (
                            <div className="space-y-3 " onMouseLeave={() => setHoverInfo(null)}>
                                {/* HEADER */}
                                <div className="sticky top-0 z-10 grid grid-cols-[5rem_repeat(7,1fr)] gap-0 border-b border-slate-100 bg-background">
                                    <div className="text-[13px] font-medium text-slate-500 py-3">Week</div>
                                    {DAY_LABELS.map((d) => (
                                        <div key={d} className="text-[13px] font-medium text-slate-500 text-center py-3">{d}</div>
                                    ))}
                                </div>

                                {weekRows.map((row) => {
                                    const rowHovering = hoverInfo?.type === "week" && hoverInfo.label === row.fullLabel;
                                    const dayHovering = hoverInfo?.type === "date" && hoverInfo.weekLabel === row.fullLabel;

                                    return (
                                    <React.Fragment key={row.weekNumber}>
										{/* MONTH HEADER */}
                                        {row.monthStart && (
                                            <div className="pt-2 pb-2">
                                                <span className="text-[13px] font-bold text-slate-900 tracking-tight">
                                                    {row.monthStart}
                                                </span>
                                            </div>
                                        )}

                                        <div
                                            className={cn(
                                                "grid grid-cols-[5rem_repeat(7,1fr)] items-center group transition-all duration-200 cursor-pointer py-1",
                                                selectedWeek === row.weekNumber
                                                    ? "bg-red-50/80 rounded-lg ring-1 ring-red-100"
                                                    : rowHovering && !dayHovering
                                                        ? "bg-red-50/60 rounded-lg ring-1 ring-red-100/70"
                                                        : "hover:bg-slate-50 rounded-lg"
                                            )}
                                            onMouseEnter={() => setHoverInfo({ type: "week", label: row.fullLabel })}
                                            onMouseLeave={() => setHoverInfo(null)}
                                            onClick={() => handlePickWeek(row.weekNumber)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            {/* WEEK SELECTOR */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePickWeek(row.weekNumber);
                                                }}
                                                className="flex items-center justify-start text-[13px] font-bold group-hover:cursor-pointer"
                                            >
                                                <div
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 size-9  px-2 py-1.5 rounded-md transition-colors",
                                                        selectedWeek === row.weekNumber
                                                            ? "text-primary"
                                                            : rowHovering && !dayHovering
                                                                ? "bg-primary text-primary-foreground"
                                                                : "text-slate-500",
                                                        (row.isRecess || row.isExam || row.isStudy) && "font-semibold"
                                                    )}
                                                >
                                                    {selectedWeek === row.weekNumber && <Check className="size-3.5 stroke-[3px]" />}
                                                    {row.label}
                                                </div>
                                            </button>

                                            {/* DAYS */}
                                            {row.days.map((day, dIdx) => {
                                                const dateStr = day.date.toString();
                                                const isSelectedDate = selectedDate === dateStr;
                                                const isToday = Temporal.PlainDate.compare(day.date, today) === 0;

                                                return (
                                                    <Button
                                                        key={dIdx}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDayClick(day.date, row.weekNumber);
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.stopPropagation();
                                                            setHoverInfo({ type: "date", dateStr, weekLabel: row.fullLabel });
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.stopPropagation();
                                                            setHoverInfo({ type: "week", label: row.fullLabel });
                                                        }}
                                                        variant="ghost"
                                                        className={cn(
                                                            "py-1.5 text-[13px] text-center transition-all cursor-pointer hover:bg-primary hover:text-white rounded-md font-semibold",
                                                            selectedWeek === row.weekNumber ? "text-slate-600" : "text-slate-400",
                                                            isSelectedDate && "bg-primary text-white font-bold rounded-md shadow-sm scale-105",
                                                            isToday && !isSelectedDate && "text-red-600 font-bold underline underline-offset-4"
                                                        )}
                                                        size={"icon"}
                                                    >
                                                        {day.dayOfMonth}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </React.Fragment>
                                )})}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
};

export default PeriodCalendarPopup;
