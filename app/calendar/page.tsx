'use client';

import React, { useState } from "react";
import SubjectCalendar from "@/components/SubjectHeatmap";
import SemesterCalendar from "@/components/SemesterHeatmap";
import { usePlanner } from "@/contexts/PlannerContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, CardAction } from "@/components/ui/card";
import SummaryCalendar from "@/components/SummaryCalendar";
import { Settings } from "lucide-react";
import CalendarSetting from "@/components/CalendarSetting";



const CalendarPage = () => {
	const { planner } = usePlanner();
	const [openSetting, setOpenSetting] = useState<boolean>(false);
	const hasStudyPeriod = !!planner.calendar && Object.keys(planner.calendar?.week ?? {}).length > 0;
	const hasSubjects = (planner.subjects?.length ?? 0) > 0;
	const missing: string[] = [];
	if (!hasStudyPeriod) missing.push("a study period");
	if (!hasSubjects) missing.push("at least one subject");
	const notice =
		missing.length === 0
			? ""
			: `Please set ${missing.join(" and ")} in Subject Planner to see the full calendar.`;

	return (
		<div className="flex flex-col min-h-screen bg-gradient-to-b from-background via-muted/30 to-background px-4 py-10">
			<div className="mx-auto w-full max-w-7xl space-y-6">
				<Card className="shadow-lg border-border/80 bg-card/95 backdrop-blur">
					<CardHeader className="space-y-2 px-6 pt-6 pb-3">
						<CardTitle className="text-3xl font-bold tracking-tight">Calendar & Heatmap</CardTitle>
						<CardDescription>
							Consider the workload intensity for each subject or across the entire semester to help you create a specific study plan.
						</CardDescription>
					</CardHeader>
				</Card>

				{missing.length > 0 ? (
					<Card className="border-dashed border-primary/50 bg-primary/5 px-4 py-3 shadow-sm">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-sm text-foreground">{notice}</p>
							<Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
								<Link href="/subject-planner">Go to Subject Planner</Link>
							</Button>
						</div>
					</Card>
				) : (
					<>
						<Card className="border-border bg-card/90 shadow-sm">
							<CardHeader className="space-y-1 px-6 pt-6 pb-3">
								<div className="flex items-start justify-between gap-4">
									<div>
										<CardTitle className="text-xl">Assessment Heatmap</CardTitle>
										<CardDescription className="text-muted-foreground">
											Review workload per subject and across the semester.
										</CardDescription>
									</div>
									<CardAction className="mt-1">
										<Button size="icon" variant="outline"
											onClick={() => (
												setOpenSetting((prev) => (!prev))
											)}
											aria-label="Open calendar settings"
										>
											<Settings size={20} strokeWidth={2} />
										</Button>
									</CardAction>
								</div>
							</CardHeader>
							<CardContent className="px-6 pb-6 space-y-8">
								<section className="space-y-2">
									<div className="h-px bg-border/70" />
									<p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Subject heatmap</p>
									<p className="text-xs text-muted-foreground">Workload intensity for each subject.</p>
									<SubjectCalendar />
								</section>

								<section className="space-y-2">
									<div className="h-px bg-border/70" />
									<p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Semester heatmap</p>
									<p className="text-xs text-muted-foreground">Combined workload across the whole semester.</p>
									<SemesterCalendar />
								</section>
							</CardContent>
							<CardFooter className="px-6 pb-6 pt-0">
								<CardDescription className="text-destructive ">
									This calendar mirrors your settings from the <Link href="/subject-planner" className="underline underline-offset-2">Subject Planner</Link>. If anything looks off, adjust it there and refresh here.
								</CardDescription>
							</CardFooter>

						</Card>

						<SummaryCalendar />
					</>
				)}
			</div>
			
			<CalendarSetting openSetting={openSetting} setOpenSetting={setOpenSetting}/>
			
		</div>
	);
};

export default CalendarPage;
