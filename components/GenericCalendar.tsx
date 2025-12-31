// Skeleton: lấy milestone từ planner -> tính tuần (study/recess) theo ngày Sydney -> gom sự kiện theo tuần -> bổ sung tuần trống (dùng thứ Hai) -> render bảng Date/Week/Event.
'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import React, { useMemo } from 'react'
import { usePlanner } from "@/contexts/PlannerContext";
import { PERIOD_MILESTONE_KEYS } from "@/lib/data/MacquarieCalendarEntry";

const SYDNEY_TZ = "Australia/Sydney";
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const weekdayFormatter = new Intl.DateTimeFormat("en-AU", { weekday: "short", timeZone: SYDNEY_TZ });
const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: SYDNEY_TZ });

type TimelineRow = {
	date: Date;
	weekLabel: string;
	events: string[];
};

// Lấy offset phút giữa một instant UTC và cách hiển thị tại timezone Sydney (để tái tạo 00:00 Sydney)
function getTimeZoneOffsetMinutes(instant: Date, timeZone: string): number {
	const dtf = new Intl.DateTimeFormat("en-AU", {
		timeZone,
		hour12: false,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
	const parts = dtf.formatToParts(instant);
	const map: Record<string, string> = {};
	for (const { type, value } of parts) {
		map[type] = value;
	}
	const asUTC = Date.UTC(
		Number(map.year),
		Number(map.month) - 1,
		Number(map.day),
		Number(map.hour),
		Number(map.minute),
		Number(map.second)
	);
	return (asUTC - instant.getTime()) / 60000;
}

// Khóa ngày theo Sydney (yyyy-mm-dd) để gom sự kiện
function dateKeySydney(date: Date) {
	return dateKeyFormatter.format(date); // yyyy-mm-dd
}

// Từ khóa yyyy-mm-dd (Sydney) tạo lại instant tại 00:00 Sydney
function dateFromSydneyKey(key: string): Date {
	const [y, m, d] = key.split("-").map(Number);
	const utcBase = Date.UTC(y, m - 1, d);
	const offsetMinutes = getTimeZoneOffsetMinutes(new Date(utcBase), SYDNEY_TZ);
	return new Date(utcBase - offsetMinutes * 60_000);
}

// Tiện ích parse Date an toàn
function toDate(value?: string): Date | null {
	if (!value) return null;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d;
}

// Cộng ngày đơn giản (theo milliseconds)
function addDays(date: Date, days: number) {
	return new Date(date.getTime() + days * MS_PER_DAY);
}

// Format ngày AU (Sydney) cho bảng
function formatDateAU(date: Date) {
	return date.toLocaleDateString("en-AU", {
		weekday: "short",
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: SYDNEY_TZ,
	});
}

function getWeekLabel(date: Date, start: Date, recessStart: Date | null, recessEnd: Date | null) {
	const inRecess =
		recessStart && recessEnd && date >= recessStart && date <= recessEnd;

	if (inRecess && recessStart) {
		const delta = Math.floor((date.getTime() - recessStart.getTime()) / MS_PER_DAY);
		const recessWeek = Math.floor(delta / 7) + 1;
		return `Recess Week ${recessWeek}`;
	}

	let elapsedDays = Math.floor((date.getTime() - start.getTime()) / MS_PER_DAY);

	if (recessStart && recessEnd && date > recessEnd) {
		const recessLengthDays =
			Math.floor((recessEnd.getTime() - recessStart.getTime()) / MS_PER_DAY) + 1;
		elapsedDays -= recessLengthDays;
	}

	const week = Math.floor(elapsedDays / 7) + 1;
	return `Week ${week}`;
}

// Tìm thứ Hai trong tuần của một ngày (nếu không có, trả về chính ngày đó)
function findMondayOfWeek(day: Date): Date {
	for (let i = 0; i < 7; i++) {
		const candidate = addDays(day, i);
		if (weekdayFormatter.format(candidate) === "Mon") {
			return candidate;
		}
	}
	return day;
}

const GenericCalendar = () => {
	const { planner } = usePlanner();

	const timeline = useMemo(() => {
		const milestone = planner?.milestone ?? {};

		const start = toDate(milestone["study period start"]);
		if (!start) return { rows: [] as TimelineRow[], ready: false, reason: "Missing study period start" };

		const end =
			toDate(milestone["study period end"]) ||
			toDate(milestone["exams end"]) ||
			addDays(start, 120);
		const recessStart = toDate(milestone["recess start"]);
		const recessEnd = toDate(milestone["recess end"]);

		const eventByDate: Record<string, string[]> = {};
		for (const key of PERIOD_MILESTONE_KEYS) {
			const val = milestone[key];
			const d = toDate(val);
			if (!d) continue;
			const keyStr = dateKeySydney(d);
			if (!eventByDate[keyStr]) eventByDate[keyStr] = [];
			eventByDate[keyStr].push(key);
		}

		const rows: TimelineRow[] = [];
		const weekMap: Record<string, { date: Date; weekLabel: string; events: string[] }> = {};

		// First, map all milestone events to their weeks (keep duplicates)
		for (const key of Object.keys(eventByDate).sort()) {
			const day = dateFromSydneyKey(key);
			const weekLabel = getWeekLabel(day, start, recessStart, recessEnd);
			if (!weekMap[weekLabel]) {
				weekMap[weekLabel] = { date: new Date(day), weekLabel, events: [] };
			}
			weekMap[weekLabel].events.push(...(eventByDate[key] ?? []));
			// prefer Monday as representative if available
			if (weekdayFormatter.format(day) === "Mon") {
				weekMap[weekLabel].date = new Date(day);
			}
		}

		// Then, ensure every week in range exists (empty weeks get Monday as date)
		for (let day = new Date(start); day <= end; day = addDays(day, 7)) {
			const weekLabel = getWeekLabel(day, start, recessStart, recessEnd);
			if (!weekMap[weekLabel]) {
				const monday = findMondayOfWeek(day);
				weekMap[weekLabel] = { date: monday, weekLabel, events: [] };
			}
		}

		for (const row of Object.values(weekMap).sort((a, b) => a.date.getTime() - b.date.getTime())) {
			rows.push({ date: row.date, weekLabel: row.weekLabel, events: row.events });
		}

		return { rows, ready: true, reason: "" };
	}, [planner?.milestone]);

	const hasData = timeline.ready && timeline.rows.length > 0;

	return (
		<Card className="relative w-full overflow-hidden border-none bg-secondary/90 text-secondary-foreground shadow-lg">
			<div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/40 pointer-events-none" />
			<CardHeader className="relative flex flex-col gap-2">
				<CardTitle className="text-xl">Study Milestone Calendar</CardTitle>
				<CardDescription className="text-secondary-foreground/80">
					Shows each day with its study week / recess week and any milestones.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{!hasData ? (
					<div className="rounded-md border border-dashed border-secondary/40 bg-secondary/20 px-4 py-3 text-sm text-secondary-foreground/80">
						Set a study period and fetch milestones to view the calendar.
					</div>
				) : (
					<div className="overflow-auto rounded-lg border border-secondary/30 bg-secondary/20">
						<table className="w-full text-sm">
							<thead className="bg-secondary/40 text-secondary-foreground">
								<tr>
									<th className="px-4 py-2 text-left font-semibold">Date</th>
									<th className="px-4 py-2 text-left font-semibold">Week</th>
									<th className="px-4 py-2 text-left font-semibold">Event</th>
								</tr>
							</thead>
							<tbody>
								{timeline.rows.map((row) => (
									<tr key={row.date.toISOString()} className="odd:bg-secondary/10">
										<td className="px-4 py-2 whitespace-nowrap">{formatDateAU(row.date)}</td>
										<td className="px-4 py-2">{row.weekLabel}</td>
										<td className="px-4 py-2">
											{row.events.length > 0 ? row.events.join(", ") : "—"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default GenericCalendar
