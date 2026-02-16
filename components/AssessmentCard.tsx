'use client';

import React, { useMemo, useState } from "react";
import { AssessmentProps, usePlanner } from "@/contexts/PlannerContext";
import { CalendarDays, ChevronDown, ChevronUp, ExternalLink, AlertCircle, Calendar, Hash } from "lucide-react";
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

	

	const dueLabel = assessment.dueDate
		? assessment.dueDate
		: assessment.dueWeek
			? weekOptions.find((w) => w.value === assessment.dueWeek)?.label ?? `Week ${assessment.dueWeek}`
			: null;

	return (
		<div
			className="group rounded-xl border border-border bg-card/70 shadow-sm transition-colors hover:border-primary/60 hover:bg-card"
		>
			{/* Header Row */}
			<div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<p className="text-sm font-semibold leading-tight truncate">
							{assessment.name || `Assessment ${index + 1}`}
						</p>
						{assessment.isHurdle && (
							<span className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
								Hurdle
							</span>
						)}
						{assessment.isExam && (
							<span className="shrink-0 rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
								Exam
							</span>
						)}
					</div>
					<p className="text-xs text-muted-foreground leading-relaxed">
						{assessment.dueText ? `According to Unit Guide: "${assessment.dueText}"` : "No due info in Unit Guide"}
					</p>
				</div>
				<span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary tabular-nums">
					{assessment.weighting ?? 0}%
				</span>
			</div>

			{/* Due selection row */}
			<div className="flex items-center gap-2 px-4 pb-3">
				{isMissingDue ? (
					<div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 w-full">
						<AlertCircle className="size-3.5 text-primary shrink-0" />
						<span className="text-xs font-medium text-primary">
							No due date or week selected
						</span>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="ml-auto shrink-0 h-7 px-2.5 text-xs gap-1.5"
							onClick={() => setCalendarOpen(true)}
						>
							<CalendarDays className="size-3.5" />
							Pick date / week
						</Button>
					</div>
				) : (
					<div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 w-full">
						{assessment.dueDate ? (
							<Calendar className="size-3.5 text-primary shrink-0" />
						) : (
							<Hash className="size-3.5 text-primary shrink-0" />
						)}
						<span className="text-xs font-medium text-foreground">
							{assessment.dueDate ? "Due date:" : "Due week:"}{" "}
							<span className="font-semibold">{dueLabel}</span>
						</span>
						<Button
							variant="outline"
							size="sm"
							className="ml-auto shrink-0 h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-white"
							onClick={() => setCalendarOpen(true)}
						>
							<CalendarDays className="size-3.5" />
							Change
						</Button>
					</div>
				)}
			</div>

			{/* Inline edit for due date / due week when set
			{(assessment.dueDate || assessment.dueWeek) && (
				<div className="px-4 pb-3">
					<div className="grid gap-2 md:grid-cols-2">
						{assessment.dueDate && (
							<label className="flex flex-col gap-1 text-[11px] font-semibold text-muted-foreground">
								Due date
								<input
									type="date"
									className="w-full rounded-md border px-2 py-1.5 text-sm bg-background date-input-no-native-icon"
									value={assessment.dueDate ?? ""}
									onChange={(e) => updateAssessment({ dueDate: e.target.value || undefined })}
								/>
							</label>
						)}
						{assessment.dueWeek && (
							<label className="flex flex-col gap-1 text-[11px] font-semibold text-muted-foreground">
								Due week
								<select
									className="w-full rounded-md border px-2 py-1.5 text-sm bg-background"
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
							</label>
						)}
					</div>
				</div>
			)} */}

			{/* Footer */}
			<div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2">
				<Button
					variant="ghost"
					size="sm"
					className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
					onClick={() => setShowAdvanced((v) => !v)}
				>
					{showAdvanced ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
					{showAdvanced ? "Hide advanced" : "Advanced settings"}
				</Button>
				{assessment.anchor && unitGuideURL && (
					<a
						className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-4 hover:underline"
						href={`${unitGuideURL}#${assessment.anchor}`}
						target="_blank"
						rel="noreferrer"
					>
						Unit Guide <ExternalLink className="size-3" />
					</a>
				)}
			</div>

			{/* Advanced settings panel */}
			<div
				className={`grid transition-all duration-300 ease-out ${showAdvanced ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
			>
				<div className="overflow-hidden">
					<div className="border-t border-border bg-muted/20 px-4 py-3 space-y-3">
						<div className="grid gap-3 md:grid-cols-2">
							<label className="flex flex-col gap-1 text-[11px] font-semibold text-muted-foreground">
								Name
								<input
									type="text"
									className="w-full rounded-md border px-2 py-1.5 text-sm bg-background"
									value={assessment.name ?? ""}
									onChange={(e) => updateAssessment({ name: e.target.value })}
								/>
							</label>
							<label className="flex flex-col gap-1 text-[11px] font-semibold text-muted-foreground">
								Weight (%)
								<input
									type="number"
									min={0}
									max={100}
									step={0.5}
									className="w-full rounded-md border px-2 py-1.5 text-sm bg-background"
									value={assessment.weighting ?? 0}
									onChange={(e) =>
										updateAssessment({
											weighting: parseFloat(e.target.value) || 0,
										})
									}
								/>
							</label>
						</div>
						<div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
							<label className="flex items-center gap-1.5 cursor-pointer">
								<input
									type="checkbox"
									className="rounded"
									checked={Boolean(assessment.isHurdle)}
									onChange={(e) => updateAssessment({ isHurdle: e.target.checked })}
								/>
								Hurdle
							</label>
							<label className="flex items-center gap-1.5 cursor-pointer">
								<input
									type="checkbox"
									className="rounded"
									checked={Boolean(assessment.isExam)}
									onChange={(e) => updateAssessment({ isExam: e.target.checked })}
								/>
								Exam
							</label>
							<label className="flex items-center gap-1.5 cursor-pointer">
								<input
									type="checkbox"
									className="rounded"
									checked={Boolean(assessment.isWeekly)}
									onChange={(e) => updateAssessment({ isWeekly: e.target.checked })}
								/>
								Weekly
							</label>
						</div>
						<label className="flex flex-col gap-1 text-[11px] font-semibold text-muted-foreground">
							Anchor (Unit Guide)
							<input
								type="text"
								className="w-full rounded-md border px-2 py-1.5 text-sm bg-background"
								value={assessment.anchor ?? ""}
								onChange={(e) => updateAssessment({ anchor: e.target.value })}
							/>
						</label>
					</div>
				</div>
			</div>

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
