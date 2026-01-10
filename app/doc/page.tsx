'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Endpoint = {
	title: string;
	method: string;
	path: string;
	description: string;
	payload: string;
	response: string;
	notes?: string[];
};

const subjectSampleResponse = `{
  "subject": {
    "unitCode": "COMP1000",
    "unitName": "Introduction to Computer Programming",
    "session": 2,
    "year": 2025,
    "unitGuideURL": "https://unitguides.mq.edu.au/unit_offerings/173184/unit_guide",
    "assignments": [
      {
        "name": "Programming Skills Demonstration",
        "weighting": 30,
        "isWeekly": false,
        "isHurdle": false,
        "isExam": false,
        "dueText": "Week 6",
        "anchor": "assessment_task_587018"
      },
      {
        "name": "Programming Exam",
        "weighting": 30,
        "isWeekly": false,
        "isHurdle": false,
        "isExam": false,
        "dueText": "Week 11",
        "anchor": "assessment_task_587017"
      },
      {
        "name": "Project Handover and Review",
        "weighting": 40,
        "isWeekly": false,
        "isHurdle": false,
        "isExam": false,
        "dueText": "Week 12",
        "anchor": "assessment_task_587019"
      }
    ]
  }
}`;

const endpoints: Endpoint[] = [
	{
		title: "Find a subject via Unit Guide search",
		method: "POST",
		path: "/api/find-subject",
		description:
			"Searches the public Unit Guide site by year, session, and unitCode, then returns a normalized subject with assignments.",
		payload: `{
  "year": 2025,
  "session": 2,
  "unitCode": "COMP1000"
}`,
		response: subjectSampleResponse,
		notes: [
			"Returns 404 if the Unit Guide search does not find a matching year/session/unitCode.",
			"Assignments may need manual week/date mapping after parsing.",
		],
	},
	{
		title: "Fetch a subject directly by Unit Guide URL",
		method: "POST",
		path: "/api/fetch-subject",
		description:
			"Skips search and parses a specific Unit Guide page into a subject payload with assignments.",
		payload: `{
  "subjectURL": "https://unitguides.mq.edu.au/unit_offerings/173184/unit_guide"
}`,
		response: subjectSampleResponse,
		notes: [
			"Use this when you already know the Unit Guide URL.",
			"Returns 500 if the Unit Guide page is unavailable or unparsable.",
		],
	},
	{
		title: "Fetch Macquarie milestones for a session",
		method: "POST",
		path: "/api/milestone",
		description:
			"Returns session milestones (teaching, recess, exams) for a given year and session, plus the ordered keys used across calendars.",
		payload: `{
  "year": 2025,
  "session": 2
}`,
		response: `{
  "year": 2025,
  "session": 2,
  "milestone": {
    "study period start": "2025-07-28T14:00:00.000Z",
    "recess start": "2025-09-22T14:00:00.000Z",
    "recess end": "2025-10-05T13:00:00.000Z",
    "session classes resume": "2025-10-06T13:00:00.000Z",
    "last day of classes": "2025-11-09T13:00:00.000Z",
    "exams start": "2025-11-10T13:00:00.000Z",
    "exams end": "2025-11-28T13:00:00.000Z",
    "study period end": "2025-11-28T13:00:00.000Z"
  },
  "keys": [
    "study period start",
    "recess start",
    "recess end",
    "session classes resume",
    "last day of classes",
    "exams start",
    "exams end",
    "study period end"
  ]
}`,
		notes: [
			"Dates are ISO strings (UTC) derived from Australia/Sydney calendar data.",
			"Returns 404 if the session is unsupported.",
		],
	},
];

const CodeBlock = ({ label, code }: { label: string; code: string }) => (
	<div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3">
		<div className="text-xs font-semibold text-muted-foreground">{label}</div>
		<pre className="max-h-[320px] overflow-auto rounded-lg bg-background/80 p-3 text-xs text-foreground">
			{code}
		</pre>
	</div>
);

export default function ApiDocsPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background px-4 py-10">
			<div className="mx-auto w-full max-w-6xl space-y-8">
				<Card className="relative overflow-hidden border-none bg-gradient-to-br from-background via-card/80 to-muted/60 shadow-xl">
					<div className="absolute right-6 top-6 hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
						Public APIs
					</div>
					<CardHeader className="space-y-4">
						<div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
							API reference
						</div>
						<CardTitle className="text-4xl font-bold tracking-tight">Integrate your planner data</CardTitle>
						<CardDescription className="text-base text-foreground/80">
							Use these public endpoints to fetch Unit Guide data, normalize assignments, and load Macquarie session milestones.
						</CardDescription>
						<div className="flex flex-wrap gap-3">
							<Button asChild>
								<Link href="/subject-planner">Try in Subject Planner</Link>
							</Button>
							<Button asChild variant="outline">
								<Link href="/user-manual">Open user manual</Link>
							</Button>
						</div>
					</CardHeader>
				</Card>

				<Card className="border-border/80 bg-card/95 shadow-lg">
					<CardHeader className="space-y-2">
						<CardTitle className="text-2xl">Usage basics</CardTitle>
						<CardDescription>All endpoints are POST-only and read public Unit Guide data.</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3 md:grid-cols-3">
						<div className="rounded-lg border border-dashed border-border/80 bg-muted/40 p-3 text-sm text-foreground/80">
							Base URL: <span className="font-mono">https://assignmentplanner.vercel.app/</span>
						</div>
						<div className="rounded-lg border border-dashed border-border/80 bg-muted/40 p-3 text-sm text-foreground/80">
							Auth: not required. Be polite with frequency; endpoints call the public Unit Guide site.
						</div>
						<div className="rounded-lg border border-dashed border-border/80 bg-muted/40 p-3 text-sm text-foreground/80">
							Content-Type: <span className="font-mono">application/json</span>. Responses are JSON with error bodies on non-2xx.
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/80 bg-card/95 shadow-lg">
					<CardHeader className="space-y-2">
						<CardTitle className="text-2xl">Quick JavaScript fetch</CardTitle>
						<CardDescription>Drop-in snippet to call the API from a browser or Node.js.</CardDescription>
					</CardHeader>
					<CardContent>
						<CodeBlock
							label="Example"
							code={`async function fetchSubject() {
  const res = await fetch("https://assignmentplanner.vercel.app/api/find-subject", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      year: 2025,
      session: 2,
      unitCode: "COMP1000",
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Request failed");
  }
  const data = await res.json();
  console.log("Subject:", data.subject);
}

fetchSubject().catch(console.error);`}
						/>
					</CardContent>
				</Card>

				<div className="grid gap-4">
					{endpoints.map((ep) => (
						<Card key={ep.path} className="border-border/80 bg-card/95 shadow-lg">
							<CardHeader className="space-y-3">
								<div className="flex flex-wrap items-center gap-3">
									<div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
										{ep.method}
									</div>
									<CardTitle className="text-xl">{ep.title}</CardTitle>
									<span className="font-mono text-sm text-muted-foreground">{ep.path}</span>
								</div>
								<CardDescription className="text-sm text-muted-foreground">
									{ep.description}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid gap-4 lg:grid-cols-2">
									<CodeBlock label="Request" code={ep.payload} />
									<CodeBlock label="Response (truncated example)" code={ep.response} />
								</div>
								{ep.notes && (
									<ul className="grid gap-2 text-sm text-foreground/80 md:grid-cols-2">
										{ep.notes.map((note) => (
											<li
												key={note}
												className="flex gap-2 rounded-lg border border-dashed border-border/80 bg-muted/40 px-3 py-2"
											>
												<span className="font-semibold text-primary">Note</span>
												<span>{note}</span>
											</li>
										))}
									</ul>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
