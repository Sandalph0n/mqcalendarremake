'use client';

import React, { useEffect, useMemo, useState } from "react";
import { AssignmentProps, usePlanner } from "@/contexts/PlannerContext";
import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { dateFromSydneyKey, dateFromSydneyLocalTime, isBetweenDates, isBetweenPeriod } from "@/lib/timeUtils";


type AssignmentCardProps = {
	assignment: AssignmentProps;
	subjectIndex: number;
	index: number; // assignment index
	unitGuideURL?: string;
};

const AssignmentCard = ({ assignment, index, subjectIndex, unitGuideURL }: AssignmentCardProps) => {
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [mode, setMode] = useState<"date" | "week">(assignment.dueWeek ? "week" : "date");
	const { planner, setPlanner } = usePlanner();

	const weekOptions = useMemo(() => {
		const weeks = planner.calendar?.week ?? {};
		return Object.entries(weeks)
			.map(([num, data]) => {
				const n = Number(num);
				if (Number.isNaN(n)) return null;
				const label = data.weekLabel?.length ? data.weekLabel.join(" • ") : `Week ${n}`;
				return { value: n, label };
			})
			.filter(Boolean) as Array<{ value: number; label: string }>;
	}, [planner.calendar?.week]);

	function updateAssignment(updates: Partial<AssignmentProps>) {
		if (updates.dueDate){
			
			const auDate = dateFromSydneyKey(updates.dueDate)
			
			for(const w in planner.calendar!.week){
				if (isBetweenDates(new Date(planner.calendar!.week[w].startDate!), new Date(planner.calendar!.week[w].endDate!), auDate)){
					updates.dueWeek = Number(w)
					break
				}
			}
		}
		
		setPlanner((prev) => {
			const subjects = [...(prev?.subjects ?? [])];
			const currentSubject = subjects[subjectIndex];
			if (!currentSubject) return prev ?? { subjects: [] };

			const nextAssignments = [...(currentSubject.assignments ?? [])];
			const currentAsm = nextAssignments[index] ?? {};
			nextAssignments[index] = { ...currentAsm, ...updates };

			subjects[subjectIndex] = { ...currentSubject, assignments: nextAssignments };
			return { ...(prev ?? {}), subjects };
		});

	}

	

	function handleModeChange(nextMode: "date" | "week") {
		setMode(nextMode);
		if (nextMode === "date") {
			updateAssignment({ dueWeek: undefined, dueDate: assignment.dueDate ?? "" });
		} else {
			updateAssignment({ dueDate: undefined, dueWeek: assignment.dueWeek ?? undefined });
		}
	}

	return (
		<div
			className="group rounded-xl border border-border bg-card/70 p-3 shadow-sm transition-colors hover:border-primary/60 hover:bg-card"
		>
			<div className="flex items-start justify-between gap-2">
				<div className="space-y-1">
					<p className="text-sm font-semibold leading-tight">
						{assignment.name || `Assignment ${index + 1}`}
					</p>
					<p className="text-xs text-muted-foreground">
						{assignment.dueText ? `Due date written in the Unit Guide: \"${assignment.dueText}\"` : "No due info"}
					</p>
				</div>
				<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
					{assignment.weighting ?? 0}%
				</span>
			</div>
			{/* To do task for student */}

			<div className="my-2 rounded-2xl bg-destructive/20 mx-auto p-3 border border-dashed border-primary w-fit">
				<p className="text-sm text-muted-foreground text-center">
						Please read carefully the due date from Unit Guide (Quoted above) and put it mannually bellow
				</p>
			</div>

			<div className="mt-3 space-y-2">
				<div className="flex gap-3 text-xs font-semibold text-muted-foreground">
					<label className="flex items-center gap-2">
						<input
							type="radio"
							name={`due-mode-${index}`}
							checked={mode === "date"}
							onChange={() => handleModeChange("date")}
						/>
						Enter date
					</label>
					<label className="flex items-center gap-2">
						<input
							type="radio"
							name={`due-mode-${index}`}
							checked={mode === "week"}
							onChange={() => handleModeChange("week")}
						/>
						Enter week
					</label>
				</div>
				{mode === "date" ? (
					<label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
						Due date (YYYY-MM-DD)
						<input
							type="date"
							className="w-full rounded-md border px-2 py-2 text-sm bg-background"
							value={assignment.dueDate ?? ""}
							onChange={(e) => updateAssignment({ dueDate: e.target.value || undefined })}
						/>
					</label>
				) : (
					<label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
						Due week (choose from calendar)
						<select
							className="w-full rounded-md border px-2 py-2 text-sm bg-background"
							value={assignment.dueWeek ?? ""}
							onChange={(e) => {
								const parsed = parseInt(e.target.value, 10);
								updateAssignment({
									dueWeek: Number.isNaN(parsed) ? undefined : parsed,
									dueDate: undefined,
								});
							}}
						>
							<option value="">Select week</option>
							{weekOptions.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</label>
				)}
			</div>

			<Button
				variant="ghost"
				size="sm"
				className="mt-2 w-fit px-2 py-1 text-xs"
				onClick={() => setShowAdvanced((v) => !v)}
			>
				{showAdvanced ? "Hide advanced settings" : "Show advanced settings"}
			</Button>

			<div
				className={`grid transition-all duration-300 ease-out ${showAdvanced ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
					}`}
			>
				<div className="mt-3 overflow-hidden rounded-lg border border-border bg-muted/30 p-3 space-y-3">
					<div className="grid gap-3 md:grid-cols-2">
						<label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
							Name
							<input
								type="text"
								className="w-full rounded-md border px-2 py-2 text-sm bg-background"
								value={assignment.name ?? ""}
								onChange={(e) => updateAssignment({ name: e.target.value })}
							/>
						</label>
						<label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
							Weight (%)
							<input
								type="number"
								min={0}
								max={100}
								step={0.5}
								className="w-full rounded-md border px-2 py-2 text-sm bg-background"
								value={assignment.weighting ?? 0}
								onChange={(e) =>
									updateAssignment({
										weighting: parseFloat(e.target.value) || 0,
									})
								}
							/>
						</label>
					</div>
					<div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={Boolean(assignment.isHurdle)}
								onChange={(e) => updateAssignment({ isHurdle: e.target.checked })}
							/>
							Hurdle
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={Boolean(assignment.isExam)}
								onChange={(e) => updateAssignment({ isExam: e.target.checked })}
							/>
							Exam
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={Boolean(assignment.isWeekly)}
								onChange={(e) => updateAssignment({ isWeekly: e.target.checked })}
							/>
							Weekly
						</label>
					</div>
					<label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
						Anchor (Unit Guide)
						<input
							type="text"
							className="w-full rounded-md border px-2 py-2 text-sm bg-background"
							value={assignment.anchor ?? ""}
							onChange={(e) => updateAssignment({ anchor: e.target.value })}
						/>
					</label>
				</div>
			</div>

			{assignment.anchor && unitGuideURL && (
				<a
					className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-4 hover:underline"
					href={`${unitGuideURL}#${assignment.anchor}`}
					target="_blank"
					rel="noreferrer"
				>
					View in Unit Guide <ExternalLink className="size-3.5" />
				</a>
			)}
		</div>
	);
};

export default AssignmentCard;
