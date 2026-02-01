'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Download, LineChart, ListChecks, ShieldCheck, Sparkles, Wand2 } from "lucide-react";

const quickSteps = [
	{
		title: "1) Set your study period",
		body: "Enter year and session in Subject Planner. We validate limits and fetch official Macquarie milestones.",
		cta: { label: "Open Subject Planner", href: "/subject-planner#study-period" },
	},
	{
		title: "2) Add subjects",
		body: "Enter the Unit Code (e.g. COMP1000) then Fetch. Subjects are stored locally; no login needed.",
	},
	{
		title: "3) Review assessments",
		body: "Open each subject to see parsed assessments. Tweak name, weight, week, or due date if the Unit Guide wording differs.",
	},
	{
		title: "4) View the heatmap",
		body: "Switch to Calendar to see weekly load: by subject (Subject planner tab) or whole term (Semester planner) with colors by total weight.",
		cta: { label: "Go to Calendar", href: "/calendar" },
	},
	{
		title: "5) Track milestones",
		body: "Generic Calendar shows teaching weeks, recess, exams, and milestones. A vertical line marks where \"today\" sits in the term.",
	},
	{
		title: "6) Save & restore",
		body: "Everything lives in your browser (localStorage). Export/import JSON in Offload (coming soon).",
	},
];



export default function UserManualPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background px-4 py-10">
			<div className="mx-auto w-full max-w-6xl space-y-8">
				<Card className="relative overflow-hidden border-none bg-gradient-to-br from-background via-card/80 to-muted/60 shadow-xl">
					<div className="absolute right-6 top-6 hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
						Local-first, no login
					</div>
					<CardHeader className="space-y-4">
						<div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
							<Sparkles className="size-4" aria-hidden />
							User manual
						</div>
						<CardTitle className="text-4xl font-bold tracking-tight">Plan your semester in minutes</CardTitle>
						<CardDescription className="text-base text-foreground/80">
							Step-by-step guide to set your study period, fetch subjects from the Unit Guide, tidy assessments, and read workload heatmaps.
						</CardDescription>
						<div className="flex flex-wrap gap-3">
							<Button asChild>
								<Link href="/subject-planner">Start planning</Link>
							</Button>
							<Button asChild variant="outline">
								<Link href="/calendar">Open Calendar</Link>
							</Button>
						</div>
					</CardHeader>
				</Card>

				<Card className="shadow-lg border-border/80 bg-card/95">
					<CardHeader className="space-y-2">
						<CardTitle className="text-2xl">Quick path (6 steps)</CardTitle>
						<CardDescription>Go from study-period setup to a heatmap with just a few actions.</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-2">
						{quickSteps.map((step) => (
							<Card key={step.title} className="border-border bg-card/90 shadow-sm">
								<CardHeader className="pb-3">
									<CardTitle className="text-lg">{step.title}</CardTitle>
									<CardDescription className="text-foreground/80">{step.body}</CardDescription>
								</CardHeader>
								{step.cta && (
									<CardContent className="pt-0">
										<Button asChild variant="outline" className="w-full">
											<Link href={step.cta.href}>{step.cta.label}</Link>
										</Button>
									</CardContent>
								)}
							</Card>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
