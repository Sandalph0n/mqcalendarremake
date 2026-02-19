// Skeleton: lấy milestone từ planner -> tính tuần (study/recess) theo ngày Sydney -> gom sự kiện theo tuần -> bổ sung tuần trống (dùng thứ Hai) -> render bảng Date/Week/Event.
'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import React, { useMemo } from "react";
import { usePlanner } from "@/contexts/PlannerContext";
import { Temporal } from "temporal-polyfill";
import { formatDateAU, toSydneyZonedDateTime } from "@/lib/timeUtils";
import { capitalizeWords } from "@/lib/utils";

type WeekRow = {
	weekNumber: number;
	weekLabel: string;
	rows: Array<{
		date?: Temporal.ZonedDateTime;
		eventLabel?: string;
	}>;
};

const GenericCalendar = () => {
	const { planner } = usePlanner();
	const calendar = planner.calendar;

	const rows = useMemo<WeekRow[]>(() => {
		if (!calendar?.week) return [];
		const result: WeekRow[] = [];

		for (const [weekKey, weekData] of Object.entries(calendar.week)) {
			const weekNumber = Number(weekKey);
			if (Number.isNaN(weekNumber)) continue;

			const labels = weekData.weekLabel?.length ? weekData.weekLabel.join(" • ") : `Week ${weekNumber}`;
			const monday = toSydneyZonedDateTime(weekData.startDate ?? undefined);
			const dayMap = new Map<string, { date?: Temporal.ZonedDateTime; events: string[] }>();

			let fallbackCounter = 0;
			// Helper to create stable keys
			const dateKey = (d?: Temporal.ZonedDateTime, fallback?: string) =>
				d ? d.toString() : fallback ?? `no-date-${weekNumber}-${fallbackCounter++}`;

			// Ensure Monday row exists (even without events)
			if (monday) {
				const mondayKey = dateKey(monday, `week-${weekNumber}-monday`);
				dayMap.set(mondayKey, { date: monday, events: [] });
			}

			// Events: group by date key so multiple events on same day share one row
			if (weekData.events) {
				for (const [name, val] of Object.entries(weekData.events)) {
					const d = toSydneyZonedDateTime(val);
					const key = dateKey(d ?? undefined, `week-${weekNumber}-${name}`);
					if (!dayMap.has(key)) {
						dayMap.set(key, { date: d ?? undefined, events: [] });
					}
					dayMap.get(key)!.events.push(name);
				}
			}

			const dayRows = Array.from(dayMap.values());

			// Sort rows by date to keep Monday/top-of-week first when dates are present
			dayRows.sort((a, b) => {
				if (!a.date && !b.date) return 0;
				if (!a.date) return 1;
				if (!b.date) return -1;
				return Temporal.ZonedDateTime.compare(a.date, b.date);
			});

			result.push({
				weekNumber,
				weekLabel: labels,
				rows: dayRows.map((row) => ({
					date: row.date,
					eventLabel: row.events.join(", "),
				})),
			});
		}

		result.sort((a, b) => a.weekNumber - b.weekNumber);
		return result;
	}, [calendar?.week]);

	const hasData = rows.length > 0;

	return (
		<Card className="relative w-full overflow-hidden border border-border bg-card text-card-foreground shadow-sm">
			<div className="absolute inset-0 bg-gradient-to-br from-background via-muted/40 to-background opacity-90 pointer-events-none" />
			<CardHeader className="relative flex flex-col gap-2">
				<CardTitle className="text-xl">Study Milestone Calendar</CardTitle>
				<CardDescription className="text-muted-foreground">
					Make sure you choose the right semester; take a quick look at the milestones below.
				</CardDescription>
			</CardHeader>
			<CardContent className="relative space-y-4">
				{!hasData ? (
					<div className="rounded-md border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
						Set a study period and fetch milestones to view the calendar.
					</div>
				) : (
					<div className="overflow-hidden rounded-xl border border-border bg-card/90">
						<div className="overflow-auto">
							<table className="w-full text-sm">
								<thead className="bg-muted text-foreground">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide border-r border-border/60">Week</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide border-r border-border/60">Date</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Event</th>
									</tr>
								</thead>
								<tbody>
									{rows.map((week) =>
										week.rows.map((day, idx) => {
											const isWeekHeader = idx === 0;
											return (
												<tr
													key={`${week.weekNumber}-${idx}`}
													className="border-t border-border/60 bg-card"
												>
													{isWeekHeader ? (
														<td
															className="px-4 py-3 border-r border-border/60 align-middle"
															rowSpan={week.rows.length}
														>
															<div className="flex flex-col items-start justify-center gap-2">
																<span className="inline-flex w-fit items-center gap-2 rounded-lg  px-3 py-1  font-semibold ">
																	{week.weekLabel}
																</span>
																{/* <span className="text-[11px] text-muted-foreground">
																	Week #{week.weekNumber}
																</span> */}
															</div>
														</td>
													) : null}
													<td className="px-4 py-3 whitespace-nowrap border-r border-border/60 align-middle">
														{day.date ? (
															<span className="font-medium">{formatDateAU(day.date)}</span>
														) : (
															<span className="text-muted-foreground">—</span>
														)}
													</td>
													<td className="px-4 py-3">
														{day.eventLabel && day.eventLabel.length > 0 ? (
															<span className="inline-flex items-center gap-2 rounded-lg  py-1 font-medium ">
																{capitalizeWords(day.eventLabel)}
															</span>
														) : (
															<span className="text-muted-foreground">—</span>
														)}
													</td>
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default GenericCalendar;
