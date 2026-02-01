'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Settings from "@/config/AppSetting"
import { MilestoneMap, usePlanner } from "@/contexts/PlannerContext";
import { CalendarClock, ShieldCheck } from "lucide-react";
import { milestoneToCalendar } from "@/lib/calendarUtils";

const StudyPeriodSelector = () => {
	const {planner, setPlanner} = usePlanner()
	const [year, setYear] = useState<string>(()=>{
		try {
			if (!planner){
				return ""; // check if valid data
			}
			return planner.year?.toString() ?? "";
		} 
		catch (err) {}
		return "";
	});

	const [session, setSession] = useState<string>(()=>{
		try {
		
			if (!planner){
				return ""; // check if valid data
			}

			return planner.session?.toString() ?? "";
		} 
		catch (err) {}
		return "";
	});
	const [error, setError] = useState<string>("");
	const [isSaved, setIsSaved] = useState<boolean>(()=>{
		return Boolean(year && session);
	})

	async function handleSave() {
		const yr = parseInt(year, 10);
		const ss = parseInt(session, 10);

		if (!yr || !ss) {
			setError("Please enter both year and session.");
			return;
		}

		if (yr < Settings.period_year_min || yr > Settings.period_year_max) {
			setError(`Year must be between ${Settings.period_year_min} and ${Settings.period_year_max}.`);
			return;
		}

		if (ss < Settings.period_session_min || ss > Settings.period_session_max) {
			setError(`Session must be between ${Settings.period_session_min} and ${Settings.period_session_max}.`);
			return;
		}

		setError("");

		try{
			const res = await fetch("/api/milestone", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ year: yr, session: ss }),
			});

			if (!res.ok){
				throw new Error(`Error ${res.status}: Cannot find milestones for year ${yr}, session ${ss}`);
			}

			const data = await res.json() as {
				year: number;
				session: number;
				milestone?: MilestoneMap;
				keys?: string[];
			};
			
			if (!data.milestone){
				throw Error("Can not find milestone")
			}

			const milestoneCalendar = milestoneToCalendar(data.milestone) ;
			if (!milestoneCalendar){
				throw Error("Can not create calendar")
			}

			setPlanner((p) => ({
				...(p ?? { subjects: {} }),
				year: data.year,
				session: data.session,
				milestone: data.milestone ,
				milestoneKeys: data.keys,
				calendar: milestoneCalendar
			}));


			setIsSaved(true);
		}
		catch(err){
			console.error(err);
			setIsSaved(false);
			const message = err instanceof Error ? err.message : String(err);
			setError(message);
		}
	}

	function handleReset() {
		setIsSaved(false);
		setError("");
		setPlanner((p) =>({
			...(p ?? null),
			year: undefined,
			session: undefined,
			milestone: undefined,
			milestoneKeys: undefined,
			subjects: []
		}))
	}

	return (
		<Card className="relative w-full overflow-hidden border-none bg-linear-to-br from-background via-background/70 to-[#f2ede3] dark:to-primary  shadow-lg">
			<div className="absolute left-0 top-0 h-full w-1 bg-primary" aria-hidden />
			<CardHeader className="relative flex flex-col gap-3">
				<div className="flex items-center gap-3">
					<div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
						<CalendarClock className="size-5" />
					</div>
					<div>
						<CardTitle className="text-xl">Study Period</CardTitle>
						<CardDescription>Set year and session before generating calendars.</CardDescription>
					</div>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<ShieldCheck className="size-4 text-primary" />
					<span>Works better for sessions 1 and 2 from 2026 onwards..</span>
				</div>
			</CardHeader>
			<CardContent>
				<div className="relative">
					<div className={cn(
						"transition-all duration-500 ease-in-out overflow-hidden",
						isSaved ? "max-h-0 opacity-0 pointer-events-none" : "max-h-100 opacity-100"
					)}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className="flex flex-col gap-2">
								<span className="text-sm font-medium text-muted-foreground">Year</span>
								<input
									type="number"
									min={Settings.period_year_min}
									max={Settings.period_year_max}
									className="w-full rounded-md border px-3 py-2 bg-background text-foreground"
									value={year}
									onChange={(e) => setYear(e.target.value)}
									placeholder="e.g. 2025"
								/>
							</label>
							<label className="flex flex-col gap-2">
								<span className="text-sm font-medium text-muted-foreground">Session</span>
								<input
									type="number"
									min={Settings.period_session_min}
									max={Settings.period_session_max}
									className="w-full rounded-md border px-3 py-2 bg-background text-foreground"
									value={session}
									onChange={(e) => setSession(e.target.value)}
									placeholder="e.g. 2"
								/>
							</label>
						</div>
						<div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
							{error && <span className="text-sm text-destructive">{error}</span>}
							<Button className="self-end" onClick={handleSave}>Save study period</Button>
						</div>
					</div>
					<div className={cn(
						"transition-all duration-500 ease-in-out overflow-hidden",
						isSaved ? "max-h-40 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
					)}>
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-primary/10 border border-primary/20 rounded-md px-4 py-3">
							<p className="text-sm font-medium">
								You selected year <span className="font-semibold text-primary">{year}</span>, session <span className="font-semibold text-primary">{session}</span>.
							</p>
							<Button variant="outline" onClick={handleReset}>Change study period</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default StudyPeriodSelector
