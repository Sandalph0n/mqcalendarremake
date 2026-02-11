'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AssessmentProps, SubjectProps, usePlanner } from "@/contexts/PlannerContext";
import { MoreHorizontal, ExternalLink, ClipboardList, X, ClipboardCheck, Info } from "lucide-react";
import { Button } from "./ui/button";
import AssessmentCard from "./AssessmentCard";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	CardContent,
	Card
} from "./ui/card";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent  } from "./ui/dialog";

type Props = {
	subject: SubjectProps;
	index: number;
};

function cloneSubject(subject: SubjectProps): SubjectProps {
	return JSON.parse(JSON.stringify(subject)) as SubjectProps;
}

const SubjectCard = ({ subject, index }: Props) => {
	const { planner, setPlanner } = usePlanner();
	const realSubject = useMemo(() => {
		return planner.subjects.find((s) => s.id === subject.id) ?? subject;
	}, [planner.subjects, subject]);

	const assessments = realSubject.assessments ?? [];
	const [isEditing, setIsEditing] = useState(() => {
		for (const asm of assessments) {
			if (!asm.dueWeek && !asm.dueDate) {
				return true;
			}
		}
		return false;
	});
	let notFinishedAsm = 0
	for (const asm of assessments) {
		if (!asm.dueWeek && !asm.dueDate) {
			notFinishedAsm++;
		}
	}

	const [draftSubject, setDraftSubject] = useState<SubjectProps | null>(null);
	const [dirty, setDirty] = useState(false);
	const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
	const [draftResetNotice, setDraftResetNotice] = useState<string>("");
	const [draftEpoch, setDraftEpoch] = useState(0);
	const baselineSubjectJsonRef = useRef<string>("");

	const editingSubject = draftSubject ?? realSubject;
	const editingAssessments = editingSubject.assessments ?? [];
	const editingNotFinishedAsm = useMemo(() => {
		let count = 0;
		for (const asm of editingAssessments) {
			if (!asm.dueWeek && !asm.dueDate) count++;
		}
		return count;
	}, [editingAssessments]);

	useEffect(() => {
		if (!isEditing) {
			setDraftSubject(null);
			setDirty(false);
			setConfirmDiscardOpen(false);
			setDraftResetNotice("");
			baselineSubjectJsonRef.current = "";
			return;
		}

		const nextReal = cloneSubject(realSubject);
		baselineSubjectJsonRef.current = JSON.stringify(nextReal);
		setDraftSubject(nextReal);
		setDraftEpoch((v) => v + 1);
		setDirty(false);
		setDraftResetNotice("");
	}, [isEditing]); // intentionally not depending on realSubject (only snapshot at open time)

	useEffect(() => {
		if (!isEditing) return;
		const nextJson = JSON.stringify(realSubject);
		if (!baselineSubjectJsonRef.current) {
			baselineSubjectJsonRef.current = nextJson;
			return;
		}
		if (nextJson !== baselineSubjectJsonRef.current) {
			baselineSubjectJsonRef.current = nextJson;
			setDraftSubject(cloneSubject(realSubject));
			setDraftEpoch((v) => v + 1);
			setDirty(false);
			setDraftResetNotice("Draft was discarded because planner data changed.");
		}
	}, [isEditing, realSubject]);

	const code = (realSubject.unitCode || `Subject ${index + 1}`).toUpperCase().trim();
	const unitGuideURL = realSubject.unitGuideURL;

	function updateDraftAssessment(assessmentIndex: number, updates: Partial<AssessmentProps>) {
		setDraftSubject((prev) => {
			const base = prev ?? cloneSubject(realSubject);
			const nextAssessments = [...(base.assessments ?? [])];
			const currentAsm = nextAssessments[assessmentIndex] ?? {};
			nextAssessments[assessmentIndex] = { ...currentAsm, ...updates };
			return { ...base, assessments: nextAssessments };
		});
		setDirty(true);
		setDraftResetNotice("");
	}

	function discardDraftAndClose() {
		const baselineJson = baselineSubjectJsonRef.current;
		if (baselineJson) {
			setDraftSubject(JSON.parse(baselineJson) as SubjectProps);
		} else {
			setDraftSubject(cloneSubject(realSubject));
		}
		setDirty(false);
		setDraftResetNotice("");
		setIsEditing(false);
	}

	function attemptCloseEditor() {
		if (!dirty) {
			setIsEditing(false);
			return;
		}
		setConfirmDiscardOpen(true);
	}

	function handleEditingOpenChange(nextOpen: boolean) {
		if (nextOpen) {
			setIsEditing(true);
			return;
		}
		attemptCloseEditor();
	}

	function saveAndClose() {
		if (!draftSubject) {
			setIsEditing(false);
			return;
		}
		setPlanner((prev) => {
			const subjects = prev.subjects ?? [];
			const idx = subjects.findIndex((s) => s.id === draftSubject.id);
			if (idx < 0) return prev;
			const nextSubjects = [...subjects];
			nextSubjects[idx] = {
				...nextSubjects[idx],
				assessments: draftSubject.assessments ?? [],
			};
			return { ...prev, subjects: nextSubjects };
		});
		setDirty(false);
		setDraftResetNotice("");
		setIsEditing(false);
	}

	return (
		<div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
			<div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-accent to-secondary" />
			<div className="flex items-start justify-between gap-3 p-5">
				<div className="flex flex-1 flex-col gap-3 rounded-xl p-1 text-left transition-colors">
					{/* Code + name */}
					<div className="flex flex-wrap items-center gap-2">
						<span className="inline-flex items-center rounded-xl bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
							{code}
						</span>
						<p className="text-sm font-semibold text-foreground/90">
							{realSubject.unitName || "Untitled subject"}
						</p>
					</div>


					<div className="flex flex-wrap items-center gap-2 text-[11px]">
						{assessments.length > 0 && (
							<span className="flex items-center gap-1 rounded-md bg-accent px-2 py-1 font-medium text-accent-foreground">
								<ClipboardList className="size-3.5" />
								{assessments.length} assessment
								{assessments.length > 1 ? "s" : ""}
							</span>
						)}
						{notFinishedAsm > 0 && (
							<span className="flex items-center gap-1 rounded-md bg-destructive px-2 py-1 font-medium text-destructive-foreground">
								<ClipboardList className="size-3.5" />
								{notFinishedAsm} assessment
								{notFinishedAsm > 1 ? "s" : ""} not set up
							</span>
						)}
						{notFinishedAsm === 0 && assessments.length > 0 && (
							<span className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 font-medium text-accent-foreground">
								<ClipboardCheck className="size-3.5" />
								Good to go
							</span>
						)}
					</div>
					{/* <p className="text-sm font-semibold text-foreground/90">
						{realSubject.unitName || "Untitled subject"}
					</p> */}
					{unitGuideURL && (
						<div className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-4 hover:cursor-pointer"
							onClick={(e) => {
								if (!unitGuideURL) return;
								e.preventDefault();
								window.open(unitGuideURL, "_blank", "noopener,noreferrer");
							}}
						>

							Open Unit Guide <ExternalLink className="size-3.5" />
						</div>
					)}
				</div>
				<div className="flex flex-col items-end gap-2">
					<div className="mt-auto">
						{/* Drop down menu */}
						<DropdownMenu>
							<DropdownMenuTrigger>
								<MoreHorizontal
									className={`size-5 cursor-pointer transition-transform ${isEditing ? "rotate-90" : "rotate-0"}`}
									aria-hidden
								// onClick={(e) => {
								// 	e.stopPropagation();
								// 	setIsEditing((o) => !o);
								// }}
								/>

							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{/* <DropdownMenuSeparator /> */}
								<DropdownMenuItem
									onClick={() => {
										setIsEditing(true)
									}}
								>
									Edit
								</DropdownMenuItem>
								{index > 0 &&
									<DropdownMenuItem
										onClick={() => {
											setPlanner((prev) => {
												const newSubject: SubjectProps[] = [...prev.subjects];
												[newSubject[index - 1], newSubject[index]] = [newSubject[index], newSubject[index - 1]]
												return {
													...prev,
													subjects: newSubject
												}
											})
										}}
									>
										Move Up
									</DropdownMenuItem>
								}
								{index < planner.subjects.length - 1 &&
									<DropdownMenuItem
										onClick={() => {
											setPlanner((prev) => {
												const newSubject: SubjectProps[] = [...prev.subjects];
												[newSubject[index], newSubject[index + 1]] = [newSubject[index + 1], newSubject[index]]
												return {
													...prev,
													subjects: newSubject
												}
											})
										}}
									>
										Move Down
									</DropdownMenuItem>}
								<DropdownMenuItem
									onClick={(e: React.MouseEvent<HTMLElement>) => {
										e.stopPropagation()
										setPlanner((prev) => ({
											...prev,
											subjects: prev.subjects.filter((_, i) => i !== index)
										}))
									}}
								>
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>



			<Dialog open={isEditing} onOpenChange={handleEditingOpenChange} >
				<DialogContent className={cn("fixed p-0 max-w-6xl w-full border-none bg-transparent shadow-none sm:max-w-5xl sm:max-h-5xl max-h-[90%] h-full")} showCloseButton={false}>
					<Card className="pt-0 w-full max-h-[90vh] ">
						<div className="flex items-start justify-between gap-3 p-5">
							<div className="flex flex-1 flex-col gap-2 rounded-xl p-1 text-left transition-colors">
								<div className="flex flex-wrap items-center gap-3">
									<div className="rounded-xl bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
										{code}
									</div>
									{editingAssessments.length > 0 && (
										<span className="flex items-center gap-1 rounded-md bg-accent/60 px-2 py-1 text-[11px] font-medium text-accent-foreground">
											<ClipboardList className="size-3.5" />
											{editingAssessments.length} assessment
											{editingAssessments.length > 1 ? "s" : ""}
										</span>
									)}
									{editingNotFinishedAsm > 0 && (
										<span className="flex items-center gap-1 rounded-md bg-destructive/60 px-2 py-1 text-[11px] font-medium text-accent-foreground">
											<ClipboardList className="size-3.5" />
											{editingNotFinishedAsm} assessment
											{editingNotFinishedAsm > 1 ? "s" : ""} not set up
										</span>
									)}

									{editingNotFinishedAsm === 0 && (
										<span className="flex items-center gap-1 rounded-md bg-green-800/60 px-2 py-1 text-[11px] font-medium text-accent-foreground">
											<ClipboardCheck className="size-3.5" />
											Good to go
										</span>
									)}

								</div>
								<p className="text-sm font-semibold text-foreground/90">
									{editingSubject.unitName || "Untitled subject"}
								</p>

								<div className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
									<div className="flex items-start gap-2">
										<Info className="mt-0.5 size-4 text-primary" />
										<div className="space-y-1">
											<p className="font-semibold text-foreground">Instruction</p>
											<p>
												Use the quoted due info in each assessment card to set the correct due date/week.
											</p>
										</div>
									</div>
								</div>

								{unitGuideURL && (
									<div
										className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-4 hover:cursor-pointer"
										onClick={(e) => {
											if (!unitGuideURL) return;
											e.preventDefault();
											window.open(unitGuideURL, "_blank", "noopener,noreferrer");
										}}
									>
										Open Unit Guide <ExternalLink className="size-3.5" />
									</div>
								)}
							</div>
							<div className="flex flex-col items-end gap-2">
								<div className="mt-auto">
									<Button
										variant="ghost"
										className="w-7 h-7"
										onClick={attemptCloseEditor}
									>
										<X />
									</Button>
								</div>
							</div>
						</div>

						<CardContent className="overflow-y-auto pb-6">
							{draftResetNotice && (
								<p className="mb-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
									{draftResetNotice}
								</p>
							)}
							{editingAssessments.length === 0 ? (
								<p className="text-sm text-muted-foreground">No assessments parsed.</p>
							) : (
								<div className="space-y-3  ">
									{editingAssessments.map((asm, aIdx) => (
										<AssessmentCard
											key={`${draftEpoch}-${asm.anchor || asm.name || aIdx}-${aIdx}`}
											assessment={asm}
											index={aIdx}
											unitGuideURL={unitGuideURL}
											onChange={(updates) => updateDraftAssessment(aIdx, updates)}
										/>
									))}
								</div>
							)}

							<div className="mt-6 flex justify-end gap-2">
								<Button
									variant="outline"
									disabled={!dirty}
									onClick={() => setConfirmDiscardOpen(true)}
								>
									Discard
								</Button>
								<Button disabled={!dirty} onClick={saveAndClose}>
									Save
								</Button>
							</div>
						</CardContent>
					</Card>
				</DialogContent>
			</Dialog>

			<Dialog
				open={confirmDiscardOpen}
				onOpenChange={(open) => {
					if (!open) setConfirmDiscardOpen(false);
				}}
			>
				<DialogContent className="max-w-md">
					<div className="space-y-2">
						<p className="text-base font-semibold">Discard changes?</p>
						<p className="text-sm text-muted-foreground">
							Your unsaved edits will be lost.
						</p>
					</div>
					<div className="mt-4 flex justify-end gap-2">
						<Button variant="outline" onClick={() => setConfirmDiscardOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								setConfirmDiscardOpen(false);
								discardDraftAndClose();
							}}
						>
							Discard
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};


export default SubjectCard;
