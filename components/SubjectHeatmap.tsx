import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { SessionCalendarProps, usePlanner } from '@/contexts/PlannerContext'
import { addDaysLocal, addTimes, plainDateToZonedMidnight, toSydneyPlainDate, toSydneyZonedDateTime, SYDNEY_TZ } from '@/lib/timeUtils';
import { Temporal } from "temporal-polyfill";
import { ExternalLink } from "lucide-react";

export const SUBJECT_PALETTE: Array<[number, number, number]> = [
	[59, 130, 246],   // blue
	[34, 197, 94],    // green
	[245, 158, 11],   // amber
	[251, 146, 60],   // orange
	[168, 85, 247],   // purple
	[236, 72, 153],   // pink
	[20, 184, 166],   // teal
	[99, 102, 241],   // indigo
];

type CellData = {
	weight: number;
	assessments: {
		name?: string;
		weighting?: number;
		dueText?: string;
		isHurdle?: boolean;
		anchor?: string;
	}[];
};




const SubjectCalendar = () => {
	const { planner, setPlanner } = usePlanner();
	useEffect(() => {
		const src = planner.subjects ?? [];
		if (src.length === 0) return;

		// Nếu tất cả đều có màu thì thôi (quan trọng để không loop)
		if (!src.some(s => !s.displayColor)) return;

		const subjects = src.map((s, idx) => ({
			...s,
			displayColor: s.displayColor ?? SUBJECT_PALETTE[idx % SUBJECT_PALETTE.length],
		}));

		setPlanner(prev => ({ ...prev, subjects }));
	}, [planner.subjects, setPlanner]);
	const subjects = planner.subjects ?? [];
	const calendar = planner.calendar as SessionCalendarProps;
	const weeks = planner.calendar?.week ?? {};
	const weekEntries = Object.entries(weeks)
		.map(([num, data]) => {
			const n = Number(num);
			if (Number.isNaN(n)) return null;
			const label = data.weekLabelShort?.length ? data.weekLabelShort.join(" • ") : `Week ${n}`;
			// console.log(data)

			return { number: n, label };
		})
		.filter(Boolean)
		.sort((a, b) => (a!.number - b!.number)) as { number: number; label: string }[];

	const headerHeight = "2.75rem";
	const rowHeight = "3rem";
	const subjectColWidth = "7rem"
	const gridTemplateRows = `${headerHeight} repeat(${Math.max(subjects.length, 1)}, ${rowHeight})`;
	const gridTemplateCols = `${subjectColWidth} ${weekEntries.map(() => "minmax(2rem,1fr)").join(" ") || "1fr"}`;
	// Change this value to test a different current day if needed
	const today = Temporal.Now.zonedDateTimeISO(SYDNEY_TZ);
	const weightToBg = (weight: number, base: [number, number, number]) => {
		if (!weight || weight <= 0) return undefined;
		const capped = Math.min(weight, 60);
		const alpha = 0.15 + (capped / 60) * 0.6; // 0.15 -> 0.75
		return `rgba(${base[0]}, ${base[1]}, ${base[2]}, ${alpha.toFixed(3)})`;
	};

	const periods = [calendar.firstHalf, calendar.recess, calendar.secondHalf, calendar.examPeriod];
	const start = toSydneyZonedDateTime(planner.milestone!['study period start']!);
	const end = toSydneyZonedDateTime(planner.milestone!['exams end']!);

	const periodOverlay: {
		color: string;
		start: number;
		end: number;
	}[] = [];

	let todayPercent: number | null = null;

	if (start && end) {
		const spanMs = end.epochMilliseconds - start.epochMilliseconds;
		let lastEndOverlay = 0;

		for (const period of periods) {
			const periodEnd = toSydneyPlainDate(period?.endDate);
			if (!periodEnd) continue;

			let color = "";
			if (period === calendar.firstHalf || period === calendar.secondHalf) {
				color = `bg-green-200/30`;
			} else if (period === calendar.recess) {
				color = `bg-yellow-200/30`;
			} else if (period === calendar.examPeriod) {
				color = `bg-blue-200/30`;
			}

			const startOverlay = lastEndOverlay;
			const endOverLay =
				(plainDateToZonedMidnight(addDaysLocal(periodEnd, -1)).epochMilliseconds - start.epochMilliseconds) /
				spanMs *
				100;
			lastEndOverlay = endOverLay;

			periodOverlay.push({
				color,
				start: startOverlay,
				end: endOverLay,
			});
		}

		if (periodOverlay.length) {
			periodOverlay[periodOverlay.length - 1].end = 100; // ensure the final overlay reaches the end
		}

		const adjustedToday = addTimes(today, { days: -1, hours: -12 }) as Temporal.ZonedDateTime;
		const raw = ((adjustedToday.epochMilliseconds - start.epochMilliseconds) / spanMs) * 100;
		todayPercent = Math.max(0, Math.min(100, raw));
	}

	// Build cell data matrix subjects x weeks
	const cellMatrix: CellData[][] = subjects.map(() =>
		weekEntries.map(() => ({ weight: 0, assessments: [] }))
	);

	subjects.forEach((subject, sIdx) => {
		for (const asm of subject.assessments ?? []) {
			// Prefer an explicitly chosen dueWeek. If it's missing, infer the week
			// from the dueDate so that date-only assessments still appear.
			let weekNum = asm.dueWeek;

			if (!weekNum && asm.dueDate) {
				const due = toSydneyZonedDateTime(asm.dueDate);
				if (due) {
					for (const [wKey, wData] of Object.entries(calendar.week ?? {})) {
						const wNumber = Number(wKey);
						if (Number.isNaN(wNumber)) continue;
						if (wData.startDate && wData.endDate) {
							const start = toSydneyZonedDateTime(wData.startDate);
							const end = toSydneyZonedDateTime(wData.endDate);
							if (
								start &&
								end &&
								Temporal.ZonedDateTime.compare(due, start) >= 0 &&
								Temporal.ZonedDateTime.compare(due, end) < 0
							) {
								weekNum = wNumber;
								break;
							}
						}
					}
				}
			}

			if (!weekNum) continue;

			const colIdx = weekEntries.findIndex((w) => w.number === weekNum);
			if (colIdx < 0) continue;

			cellMatrix[sIdx][colIdx].weight += asm.weighting ?? 0;
			cellMatrix[sIdx][colIdx].assessments.push({
				name: asm.name,
				weighting: asm.weighting,
				dueText: asm.dueText,
				isHurdle: asm.isHurdle,
				anchor: asm.anchor,
			});
		}
	});

	return (
		<div className="w-full  bg-card text-card-foreground shadow-lg overflow-hidden ">
			<div className="overflow-x-auto">
				<div
					className="grid relative  "
					style={{
						gridTemplateRows,
						gridTemplateColumns: gridTemplateCols,
						minWidth: `${160 + weekEntries.length * 60}px`,
					}}
				>
					{/* Overlay for periods/current-day */}
					<div
						className="absolute inset-0 pointer-events-none "
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
					{todayPercent !== null && (
						<div
							className="absolute pointer-events-none"
							style={{ left: `${subjectColWidth}`, right: 0, top: 0, bottom: 0 }}
						>
							<div
								className="absolute top-0 bottom-0 w-0.5 bg-primary/70"
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
						<div className="flex items-center px-3 text-sm text-muted-foreground bg-muted/40 ">
							No weeks available
						</div>
					) : (
						weekEntries.map((w) => (
							<div
								key={`wk-header-${w.number}`}
								className={cn(
									"flex items-center p-3 justify-center text-xs font-semibold uppercase tracking-wide bg-muted/40 border-x"
								)}
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

					{/* Content cells placeholder */}
					{subjects.map((subject, rowIdx) =>
						weekEntries.map((w, colIdx) => (
							<div
								key={`cell-${rowIdx}-${w.number}`}
								className="relative flex items-center justify-center text-xs text-muted-foreground bg-background/60 group" tabIndex={0}
								style={{
									gridRowStart: rowIdx + 2,
									gridColumnStart: colIdx + 2,
									backgroundColor: weightToBg(
										cellMatrix[rowIdx]?.[colIdx]?.weight,
										subject.displayColor ?? SUBJECT_PALETTE[rowIdx % SUBJECT_PALETTE.length]
									),
								}}
							>
								{cellMatrix[rowIdx]?.[colIdx]?.weight
									? cellMatrix[rowIdx][colIdx].weight.toFixed(1)
									: "—"}
								{cellMatrix[rowIdx]?.[colIdx]?.assessments.length ? (
									<div
										className="absolute z-50 hidden w-64 max-w-[16rem] -translate-x-1/2 -translate-y-2 whitespace-normal rounded-md border border-border bg-card p-3 text-foreground shadow-lg group-hover:block group-focus-within:block"
										style={{ left: "50%", top: 0 }}
									>
										<div className="text-xs font-semibold mb-1">Assessments</div>
										<div className="space-y-2">
											{cellMatrix[rowIdx][colIdx].assessments.map((asm, idx) => (
												<div key={`${rowIdx}-${colIdx}-${idx}`} className="text-xs">
													<div className="font-semibold">{asm.name || "Untitled"}</div>
													<div className="text-muted-foreground">
														Weight: {asm.weighting ?? 0}% | Hurdle: {asm.isHurdle ? "Yes" : "No"}
													</div>
													{asm.dueText && (
														<div className="text-muted-foreground">Due: {asm.dueText}</div>
													)}
													{asm.anchor && subjects[rowIdx]?.unitGuideURL && (
														<a
															className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
															href={`${subjects[rowIdx].unitGuideURL}#${asm.anchor}`}
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

export default SubjectCalendar;
