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
		title: "3) Review assignments",
		body: "Open each subject to see parsed assignments. Tweak name, weight, week, or due date if the Unit Guide wording differs.",
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

const deepDive = [
	{
		title: "Study period & milestone",
		icon: CalendarClock,
		points: [
			"Enter year/session and hit Save. If it is out of range, you'll get an immediate error.",
			"Milestones become weeks + labels (teaching, recess, exam) reused across all calendars.",
		],
		action: { label: "Set up study period", href: "/subject-planner#study-period" },
	},
	{
		title: "Assignments",
		icon: ListChecks,
		points: [
			"Click a subject to expand and edit assignments.",
			"Choose to enter by date (YYYY-MM-DD) or by week. Date mode auto-maps to a week using the term calendar.",
			"Mark Hurdle / Exam / Weekly, update weight, and add an anchor to open the exact Unit Guide section.",
		],
		action: { label: "Manage subjects", href: "/subject-planner#subject-planner" },
	},
	{
		title: "Heatmap & overlay",
		icon: LineChart,
		points: [
			"Subject planner tab: see weekly load per subject; hover for assignment details + Unit Guide link.",
			"Semester planner tab: column color is based on total weight of all subjects that week.",
			"Overlay shows teaching / recess / exam and a Today line so you know your position in the term.",
		],
		action: { label: "Open Calendar", href: "/calendar" },
	},
];

const tips = [
	"No data showing? Recheck year/session or Fetch the subject again (uppercase not required).",
	"Week looks wrong after entering a date: ensure your timezone is Sydney/AU or pick Week directly in Assignment.",
	"Total weight not 100%? Update each assignment in the Advanced section.",
	"Want a clean slate? In Subject Planner, delete the subject then add it again.",
];

const dataNotes = [
	"No separate backend: the app only reads public Unit Guides and stores to localStorage.",
	"No login required. Reopen the tab and your plan stays on the device.",
	"Export/import JSON (Offload) to back up or move devices (feature in progress).",
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
							Step-by-step guide to set your study period, fetch subjects from the Unit Guide, tidy assignments, and read workload heatmaps.
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

				<div className="grid gap-4 md:grid-cols-3">
					{deepDive.map((block) => {
						const Icon = block.icon;
						return (
							<Card key={block.title} className="h-full border-border/80 bg-card/95 shadow-lg">
								<CardHeader className="space-y-3">
									<div className="flex items-center gap-3">
										<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
											<Icon className="size-5" aria-hidden />
										</div>
										<div>
											<CardTitle className="text-xl leading-tight">{block.title}</CardTitle>
											<CardDescription className="text-sm text-muted-foreground">
												{block.icon === ListChecks ? "Edit assignments" : "Set up and read the calendars"}
											</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-3">
									<ul className="space-y-2 text-sm text-foreground/80">
										{block.points.map((pt) => (
											<li key={pt} className="flex gap-2">
												<Wand2 className="mt-1 size-4 text-primary" aria-hidden />
												<span>{pt}</span>
											</li>
										))}
									</ul>
									{block.action && (
										<Button asChild variant="outline" className="w-full">
											<Link href={block.action.href}>{block.action.label}</Link>
										</Button>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>

				<Card className="border-border/80 bg-card/95 shadow-lg">
					<CardHeader className="space-y-2">
						<CardTitle className="text-2xl">Tips & quick fixes</CardTitle>
						<CardDescription>Common issues when entering schedules and how to resolve them.</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="grid gap-3 text-sm text-foreground/80 md:grid-cols-2">
							{tips.map((tip) => (
								<li key={tip} className="flex gap-2 rounded-lg border border-dashed border-border/80 bg-muted/40 px-3 py-2">
									<ShieldCheck className="mt-0.5 size-4 text-primary" aria-hidden />
									<span>{tip}</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>

				<Card className="border-border/80 bg-card/95 shadow-md">
					<CardHeader className="space-y-2">
						<CardTitle className="text-2xl">Data & storage</CardTitle>
						<CardDescription>Privacy-first and local persistence.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{dataNotes.map((note) => (
							<div key={note} className="flex items-start gap-3 rounded-lg bg-primary/5 px-3 py-2 text-sm text-foreground/80">
								<Download className="mt-0.5 size-4 text-primary" aria-hidden />
								<span>{note}</span>
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
