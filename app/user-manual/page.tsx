'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
	{
		title: "1) Set your study period",
		body: "Choose year and session in Subject Planner. Dates are validated against supported Macquarie sessions.",
		cta: { label: "Open Subject Planner", href: "/subject-planner" },
	},
	{
		title: "2) Add subjects",
		body: "Enter the unit code and fetch. Each subject is saved locally so your plan stays after refresh.",
	},
	{
		title: "3) Review & edit assignments",
		body: "Open a subject to view parsed assignments. Adjust due date or week, weight, and flags (Hurdle, Weekly, Exam) if the Unit Guide format differs.",
	},
	{
		title: "4) Build your calendars",
		body: "Use Calendar to see milestone dates (Generic Calendar) and workload heatmaps: per-subject or semester-wide. Hover cells to see assignment details and Unit Guide links.",
		cta: { label: "View Calendar", href: "/calendar" },
	},
	{
		title: "5) Color cues & overlays",
		body: "Heatmap color intensity scales with total weighting. Overlays mark study/recess/exam periods and a line shows “today” relative to the term.",
	},
	{
		title: "6) Storage & data",
		body: "All data stays in your browser (localStorage). No private campus data is accessed; only public Unit Guide content is used.",
	},
];

export default function HowToUsePage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background px-4 py-10">
			<div className="mx-auto w-full max-w-5xl space-y-6">
				<Card className="shadow-lg border-border/80 bg-card/95 backdrop-blur">
					<CardHeader className="space-y-2">
						<CardTitle className="text-3xl font-bold tracking-tight">How to use this planner</CardTitle>
						<CardDescription>
							Follow these steps to fetch subjects, tidy assignments, and visualize your semester workload.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{steps.map((step) => (
							<Card key={step.title} className="border-border bg-card/90">
								<CardHeader className="pb-2">
									<CardTitle className="text-lg">{step.title}</CardTitle>
									<CardDescription className="text-foreground/80">{step.body}</CardDescription>
								</CardHeader>
								{step.cta && (
									<CardContent className="pt-0">
										<Button asChild variant="outline">
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
