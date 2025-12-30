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
import { getStorageValue, PlannerProps, usePlanner } from "@/contexts/PlannerContext";


const StudyPeriodSelector = () => {
	const {planner, setPlanner} = usePlanner()
	console.log(planner);
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

	function handleSave() {
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
		
		setIsSaved(true);

		setPlanner((p) => ({
			...(p ?? { subjects: {} }),
			year: Number.parseInt(year),
			session: Number.parseInt(session),
		}))

	}

	function handleReset() {
		setIsSaved(false);
		setError("");
		setPlanner((p) =>({
			...(p ?? null),
			year: undefined,
			session: undefined
		}))
	}

	return (
		<div className="relative">
			<div className="flex flex-col absolute -top-8 left-1/2 -translate-x-1/2 w-60 h-15 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
				<CardTitle>Study Period </CardTitle>
			</div>
			<Card className="w-full ">
				<CardHeader className="space-y-2 text-center ">
					<CardDescription className="mt-6">Set the year and session for your study period.</CardDescription>
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
										className="w-full rounded-md border px-3 py-2"
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
										className="w-full rounded-md border px-3 py-2"
										value={session}
										onChange={(e) => setSession(e.target.value)}
										placeholder="e.g. 2"
									/>
								</label>
							</div>
							<div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
								{error && <span className="text-sm text-destructive">{error}</span>}
								<Button onClick={handleSave}>Save</Button>
							</div>
						</div>
						<div className={cn(
							"transition-all duration-500 ease-in-out overflow-hidden",
							isSaved ? "max-h-40 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
						)}>
							<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-muted/50 rounded-md px-4 py-3">
								<p className="text-sm font-medium">
									Your study period is year <span className="font-semibold">{year}</span> session <span className="font-semibold">{session}</span>.
								</p>
								<Button variant="outline" onClick={handleReset}>Reset</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default StudyPeriodSelector
