'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Download, LineChart, ListChecks, ShieldCheck, Sparkles, Wand2 } from "lucide-react";



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
		title: "Assessments",
		icon: ListChecks,
		points: [
			"Click a subject to expand and edit assessments.",
			"Choose to enter by date (YYYY-MM-DD) or by week. Date mode auto-maps to a week using the term calendar.",
			"Mark Hurdle / Exam / Weekly, update weight, and add an anchor to open the exact Unit Guide section.",
		],
		action: { label: "Manage subjects", href: "/subject-planner#subject-planner" },
	},
	{
		title: "Heatmap & overlay",
		icon: LineChart,
		points: [
			"Subject planner tab: see weekly load per subject; hover for assessment details + Unit Guide link.",
			"Semester planner tab: column color is based on total weight of all subjects that week.",
			"Overlay shows teaching / recess / exam and a Today line so you know your position in the term.",
		],
		action: { label: "Open Calendar", href: "/calendar" },
	},
];

const tips = [
	"No data showing? Recheck year/session or Fetch the subject again (uppercase not required).",
	"Week looks wrong after entering a date: ensure your timezone is Sydney/AU or pick Week directly in Assessment.",
	"Total weight not 100%? Update each assessment in the Advanced section.",
	"Want a clean slate? In Subject Planner, delete the subject then add it again.",
];

const dataNotes = [
	"No separate backend: the app only reads public Unit Guides and stores to localStorage.",
	"No login required. Reopen the tab and your plan stays on the device.",
	"Export/import JSON (Offload) to back up or move devices (feature in progress).",
];

export default function UserDocumentPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background px-4 py-10">
			<div className="mx-auto w-full max-w-6xl space-y-8">
				
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
												{block.icon === ListChecks ? "Edit assessments" : "Set up and read the calendars"}
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
