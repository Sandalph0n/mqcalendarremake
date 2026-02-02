'use client';

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectCalendar from "@/components/SubjectHeatmap";
import SemesterCalendar from "@/components/SemesterHeatmap";
import GenericCalendar from "@/components/GenericCalendar";
import { usePlanner } from "@/contexts/PlannerContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle , CardFooter} from "@/components/ui/card";
import SummaryCalendar from "@/components/SummaryCalendar";

const CalendarPage = () => {
	const { planner } = usePlanner();
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
					<CardHeader className="space-y-2">
						<CardTitle className="text-3xl font-bold tracking-tight">Calendar & Heatmap</CardTitle>
						<CardDescription>
							Consider the workload intensity for each subject or across the entire semester to help you create a specific study plan.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{missing.length > 0 ? (
							<div className="rounded-xl border border-dashed border-primary/50 bg-primary/5 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<p className="text-sm text-foreground">{notice}</p>
								<Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
									<Link href="/subject-planner">Go to Subject Planner</Link>
								</Button>
							</div>
						) : (
							<>
								<Card className="border-border bg-card/90 shadow-sm">
									<CardHeader className="space-y-1">
										<CardTitle className="text-xl">Assessment Heatmap</CardTitle>
										<CardDescription className="text-muted-foreground">
											Switch between per-subject focus or semester-wide load.
										</CardDescription>
									</CardHeader>
									<CardContent className="p-4">
										<Tabs defaultValue="subject" className="w-full">
											<TabsList className="mb-4 bg-primary ">
												<TabsTrigger className="border-none text-primary-foreground dark:text-primary-foreground data-[state=active]:text-foreground" value="subject">Subject planner</TabsTrigger>
												<TabsTrigger className="border-none text-primary-foreground dark:text-primary-foreground data-[state=active]:text-foreground" value="semester">Semester planner</TabsTrigger>
											</TabsList>
											<TabsContent value="subject" className="space-y-4">
												<SubjectCalendar/>
											</TabsContent>

											<TabsContent value="semester" className="space-y-4">
												<SemesterCalendar/>
											</TabsContent>
										</Tabs>
									</CardContent>
									<CardFooter>
										<CardDescription className="text-destructive ">
											This calendar mirrors your settings from the <Link href="/subject-planner" className="underline underline-offset-2">Subject Planner</Link>. If anything looks off, adjust it there and refresh here.
										</CardDescription>
									</CardFooter>
									
								</Card>

								<SummaryCalendar />
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default CalendarPage;
