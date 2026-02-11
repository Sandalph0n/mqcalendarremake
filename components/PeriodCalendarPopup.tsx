'use client';

import React, { useMemo } from "react";
import { usePlanner } from "@/contexts/PlannerContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Temporal } from "temporal-polyfill";
import { SYDNEY_TZ, toSydneyPlainDate } from "@/lib/timeUtils";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
	selectedWeek?: number; // Choose a week (W1, W2, ...., W13)
	selectedDate?: string; // Choose a date (YYYY-MM-DD)
	onSelectWeek: (weekNumber: number) => void;
	onSelectDate?: (date: string, weekNumber: number) => void;
};

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

	const weekRows: WeekRow[] = useMemo(() => {
		const weeks = planner.calendar?.week ?? {};
		const entries = Object.entries(weeks)
			.map(([num, data]) => ({ num: Number(num), data }))
			.filter((e) => !Number.isNaN(e.num))
			.sort((a, b) => a.num - b.num);

		if (entries.length === 0) return [];

		console.log(entries);
		console.log(weeks);

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
				days.push({
					date: dayPlain,
					dayOfMonth: dayPlain.day,
				});
			}

			const label = data.weekLabelShort?.length
				? data.weekLabelShort.join(" · ")
				: `W${num}`;
			const fullLabel = data.weekLabel?.length
				? data.weekLabel.join(" · ")
				: `Week ${num}`;

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


	// Period Label - Example: "Feb 24, 2026 – Jun 15, 2026"
	const periodLabel = useMemo(() => {
		if (weekRows.length === 0) return "No period loaded";
		const begin = weekRows[0].days[0].date;
		const end = weekRows[weekRows.length - 1].days[6].date;

		return `${MONTH_NAMES[begin.month - 1]} ${begin.day}, ${begin.year} – ${MONTH_NAMES[end.month - 1]} ${end.day}, ${end.year}`;
	}, [weekRows]);

	function handlePickWeek(weekNum: number) {
		onSelectWeek(weekNum);
		onOpenChange(false);
	}

	function handlePickDate(dateStr: string, weekNum: number) {
		if (onSelectDate) {
			onSelectDate(dateStr, weekNum);
		}
		onOpenChange(false);
	}

	function handleDayClick(day: Temporal.PlainDate, weekNum: number) {
		handlePickDate(day.toString(), weekNum);
	}

	const title = "Pick a Week or Date for this assignment ";
	const subtitle = `${periodLabel}`;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="fixed p-0 max-w-2xl w-full border-none bg-transparent shadow-none sm:max-w-2xl max-h-[85vh] h-auto"
				showCloseButton={false}
			>
				<Card className="w-full max-h-[85vh] flex flex-col">
					<CardHeader className="shrink-0">
						<CardTitle className="text-lg">{title}</CardTitle>
						<CardDescription>{subtitle}</CardDescription>
						<CardAction>
							<Button
								size="icon"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								<X className="size-4" />
							</Button>
						</CardAction>
					</CardHeader>

					<CardContent className="overflow-y-auto flex-1 px-3 pb-4">
						{weekRows.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-8">
								No study period loaded. Set your study period first.
							</p>
						) : (
							<div className="space-y-0">
								{/* DAY OF WEEK HEADER */}
								<div className="grid grid-cols-[5rem_repeat(7,1fr)] gap-0 mb-1 sticky top-0 bg-card z-10 pb-1 border-b border-border">
									<div className="text-xs font-semibold text-muted-foreground px-1 flex items-center">
										Week
									</div>
									{DAY_LABELS.map((d) => (
										<div
											key={d}
											className="text-xs font-semibold text-muted-foreground text-center py-1"
										>
											{d}
										</div>
									))}
								</div>


								{weekRows.map((row) => (
									<React.Fragment key={row.weekNumber}>
										{/* MONTH DIVIDER */}
										{row.monthStart && (
											<div className="pt-3 pb-1 px-1">
												<span className="text-xs font-bold text-foreground tracking-wide uppercase">
													{row.monthStart}
												</span>
											</div>
										)}

									{/* WEEK ROW */}
									<div
										className={cn(
											"grid grid-cols-[5rem_repeat(7,1fr)] gap-0 items-center rounded-lg transition-colors",
											selectedWeek === row.weekNumber
												? !(row.isRecess || row.isExam || row.isStudy)
													? "bg-primary/10 ring-1 ring-primary/30"
													: ""
												: "hover:bg-muted/50",
										)}
										style={
											selectedWeek === row.weekNumber && (row.isRecess || row.isExam || row.isStudy)
												? {
													outline: `2px solid ${row.isRecess ? "#373A36" : row.isExam ? "#80225F" : "#76232F"}`,
													outlineOffset: "-1px",
													borderRadius: "0.5rem",
												}
												: undefined
										}
									>
										{/* WEEK LABEL BUTTON */}
										<div className="flex items-center px-1 py-1">
											<Button
												size="icon"
												variant="outline"
												className={cn(
													"w-full flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer",
													"shadow-sm hover:shadow active:scale-95",
													(row.isRecess || row.isExam || row.isStudy)
														? "text-white"
														: selectedWeek === row.weekNumber
															? "bg-primary text-primary-foreground"
															: "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent",
													row.isRecess && "italic",
												)}
												style={
													(row.isRecess || row.isExam || row.isStudy)
														? {
															backgroundColor: row.isRecess
																? "#373A36"
																: row.isExam
																	? "#80225F"
																	: "#76232F",
														}
														: undefined
												}
												title={`Select ${row.fullLabel}`}
												onClick={() => handlePickWeek(row.weekNumber)}
											>
												{selectedWeek === row.weekNumber && (
													<Check className="size-3 shrink-0" />
												)}
												<span className="whitespace-nowrap">{row.label}</span>
											</Button>
										</div>

											{/* Day cells */}
											{row.days.map((day, dIdx) => {
												const dateStr = day.date.toString();
												const isToday = Temporal.PlainDate.compare(day.date, today) === 0;
												const isSelectedDate = selectedDate === dateStr;

												return (
													<button
														key={dIdx}
														className={cn(
															"relative flex items-center justify-center py-2 text-xs rounded-md transition-colors",
															isSelectedDate
																? "bg-primary text-primary-foreground font-bold ring-2 ring-primary/50"
																: isToday
																	? "bg-primary/80 text-primary-foreground font-bold"
																	: "text-foreground/70 hover:bg-muted",
															!isSelectedDate && !isToday && "hover:bg-primary/10 hover:text-primary cursor-pointer",
															dIdx >= 5 && !isSelectedDate && !isToday && "text-foreground/40",
														)}
														title={
															`Select ${dateStr}`
														}
														onClick={() => handleDayClick(day.date, row.weekNumber)}
													>
														{day.dayOfMonth}
													</button>
												);
											})}
										</div>
									</React.Fragment>
								))}
							</div>
						)}

						{/* NOTE COLOURS */}
						<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted-foreground border-t border-border pt-3">
							<span className="flex items-center gap-1.5">
								<span className="inline-block size-3 rounded-md" style={{ backgroundColor: "#373A36" }} />
								Recess
							</span>
							<span className="flex items-center gap-1.5">
								<span className="inline-block size-3 rounded-md" style={{ backgroundColor: "#80225F" }} />
								Exam
							</span>
							<span className="flex items-center gap-1.5">
								<span className="inline-block size-3 rounded-md" style={{ backgroundColor: "#76232F" }} />
								Study
							</span>
							<span className="flex items-center gap-1.5">
								<span className="inline-block size-3 rounded-md bg-primary ring-2 ring-primary/50" />
								Selected date
							</span>
						</div>
					</CardContent>
				</Card>
			</DialogContent>
		</Dialog>
	);
};

export default PeriodCalendarPopup;
