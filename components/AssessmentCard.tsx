'use client';

import React, { useMemo, useState } from "react";
import { AssessmentProps, usePlanner } from "@/contexts/PlannerContext";
import { CalendarDays, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import PeriodCalendarPopup from "./PeriodCalendarPopup";


type AssessmentCardProps = {
	assessment: AssessmentProps;
	index: number; // assessment index
	unitGuideURL?: string;
	onChange: (updates: Partial<AssessmentProps>) => void;
};

const AssessmentCard = ({ assessment, index, unitGuideURL, onChange }: AssessmentCardProps) => {
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [calendarOpen, setCalendarOpen] = useState(false);
	const { planner } = usePlanner();

	const isMissingDue = !assessment.dueDate && !assessment.dueWeek;

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

	function updateAssessment(updates: Partial<AssessmentProps>) {
		const nextUpdates: Partial<AssessmentProps> = { ...updates };
		
		// If a dueDate is provided, clear any manually set dueWeek.
		// If a numeric dueWeek is provided, clear any existing dueDate.
		if (
			Object.prototype.hasOwnProperty.call(nextUpdates, "dueDate") &&
			typeof nextUpdates.dueDate === "string" &&
			nextUpdates.dueDate
		) {
			nextUpdates.dueWeek = undefined;
		}

		if (
			Object.prototype.hasOwnProperty.call(nextUpdates, "dueWeek") &&
			typeof nextUpdates.dueWeek === "number" &&
			!Number.isNaN(nextUpdates.dueWeek)
		) {
			nextUpdates.dueDate = undefined;
		}

		onChange(nextUpdates);
	}

	

	return (
		<div
			className="group rounded-xl border border-border bg-card/70 p-3 shadow-sm transition-colors hover:border-primary/60 hover:bg-card"
		>
			<div className="flex items-start justify-between gap-2">
				<div className="space-y-1">
					<p className="text-sm font-semibold leading-tight">
						{assessment.name || `Assessment ${index + 1}`}
					</p>
					<p className="text-xs text-primary">
						{assessment.dueText ? `Due date written in the Unit Guide: \"${assessment.dueText}\"` : "No due info"}
					</p>
				</div>
				<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[12px] font-semibold text-primary">
					Weighting:  {assessment.weighting ?? 0}%
				</span>
			</div>
			{/* To do task for student */}

			<div className="mt-3 space-y-3">
				<label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
					Due date (YYYY-MM-DD)
					<div className="flex gap-2">
						<input
							type="date"
							className="w-full rounded-md border px-2 py-2 text-sm bg-background date-input-no-native-icon"
							value={assessment.dueDate ?? ""}
							onChange={(e) => updateAssessment({ dueDate: e.target.value || undefined })}
						/>
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="shrink-0"
							title="Open calendar to pick date/week"
							onClick={() => setCalendarOpen(true)}
						>
							<CalendarDays className="size-4" />
						</Button>
					</div>
				</label>

				<label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
					Due week
					<div className="flex gap-2">
						<select
							className="w-full rounded-md border px-2 py-2 text-sm bg-background"
							value={assessment.dueWeek ?? ""}
							onChange={(e) => {
								const parsed = parseInt(e.target.value, 10);
								updateAssessment({
									dueWeek: Number.isNaN(parsed) ? undefined : parsed,
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
					</div>
				</label>

				{isMissingDue && (
					<p className="text-[11px] font-medium text-destructive">
						Please select either a due date or a due week.
					</p>
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
								value={assessment.name ?? ""}
								onChange={(e) => updateAssessment({ name: e.target.value })}
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
								value={assessment.weighting ?? 0}
								onChange={(e) =>
									updateAssessment({
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
								checked={Boolean(assessment.isHurdle)}
								onChange={(e) => updateAssessment({ isHurdle: e.target.checked })}
							/>
							Hurdle
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={Boolean(assessment.isExam)}
								onChange={(e) => updateAssessment({ isExam: e.target.checked })}
							/>
							Exam
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={Boolean(assessment.isWeekly)}
								onChange={(e) => updateAssessment({ isWeekly: e.target.checked })}
							/>
							Weekly
						</label>
					</div>
					<label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
						Anchor (Unit Guide)
						<input
							type="text"
							className="w-full rounded-md border px-2 py-2 text-sm bg-background"
							value={assessment.anchor ?? ""}
							onChange={(e) => updateAssessment({ anchor: e.target.value })}
						/>
					</label>
				</div>
			</div>

			{assessment.anchor && unitGuideURL && (
				<a
					className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-4 hover:underline"
					href={`${unitGuideURL}#${assessment.anchor}`}
					target="_blank"
					rel="noreferrer"
				>
					View in Unit Guide <ExternalLink className="size-3.5" />
				</a>
			)}

			<PeriodCalendarPopup
				open={calendarOpen}
				onOpenChange={setCalendarOpen}
				selectedWeek={assessment.dueWeek}
				selectedDate={assessment.dueDate}
				onSelectWeek={(weekNum) => {
					updateAssessment({
						dueWeek: weekNum,
					});
				}}
				onSelectDate={(dateStr) => {
					updateAssessment({
						dueDate: dateStr,
					});
				}}
			/>

		</div>
	);
};

export default AssessmentCard;
