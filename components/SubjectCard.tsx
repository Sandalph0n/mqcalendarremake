'use client';

import React, { useState } from "react";
import { SubjectProps, usePlanner } from "@/contexts/PlannerContext";
import { MoreHorizontal, ExternalLink, ClipboardList, X, ClipboardCheck } from "lucide-react";
import { Button } from "./ui/button";
import AssessmentCard from "./AssessmentCard";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	CardHeader,
	CardTitle,
	CardDescription,
	CardAction,
	CardContent,
	CardFooter,
	Card
} from "./ui/card";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "./ui/dialog";

type Props = {
	subject: SubjectProps;
	index: number;
};

const SubjectCard = ({ subject, index }: Props) => {
	const assessments = subject.assessments ?? [];
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
	const { planner, setPlanner } = usePlanner();
	const code = (subject.unitCode || `Subject ${index + 1}`).toUpperCase().trim();
	const unitGuideURL = subject.unitGuideURL;
	return (
		<div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
			<div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
			<div className="flex items-start justify-between gap-3 p-5">
				<div
					className="flex flex-1 flex-col gap-2 rounded-xl p-1 text-left transition-colors"

				>
					<div className="flex flex-wrap items-center gap-3">
						<div className="rounded-xl bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
							{code}
						</div>
						{assessments.length > 0 && (
							<span className="flex items-center gap-1 rounded-md bg-accent/60 px-2 py-1 text-[11px] font-medium text-accent-foreground">
								<ClipboardList className="size-3.5" />
								{assessments.length} assessment
								{assessments.length > 1 ? "s" : ""}
							</span>
						)}
						{notFinishedAsm > 0 && (
							<span className="flex items-center gap-1 rounded-md bg-destructive/60 px-2 py-1 text-[11px] font-medium text-accent-foreground">
								<ClipboardList className="size-3.5" />
								{notFinishedAsm} assessment
								{notFinishedAsm > 1 ? "s" : ""} not finished
							</span>
						)}
						{notFinishedAsm === 0 && (
							<span className="flex items-center gap-1 rounded-md bg-green-800/60 px-2 py-1 text-[11px] font-medium text-accent-foreground">
								<ClipboardCheck className="size-3.5" />
								Good to go
							</span>
						)}
					</div>
					<p className="text-sm font-semibold text-foreground/90">
						{subject.unitName || "Untitled subject"}
					</p>
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



			<Dialog open={isEditing} onOpenChange={setIsEditing} >
				<DialogContent className={cn("fixed p-0 max-w-6xl w-full border-none bg-transparent shadow-none sm:max-w-5xl sm:max-h-5xl max-h-[90%] h-full")} showCloseButton={false}>
					<Card className="pt-0 w-full max-h-[90vh] ">
						<div className="flex items-start justify-between gap-3 p-5">
							<div className="flex flex-1 flex-col gap-2 rounded-xl p-1 text-left transition-colors">
								<div className="flex flex-wrap items-center gap-3">
									<div className="rounded-xl bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
										{code}
									</div>
									{assessments.length > 0 && (
										<span className="flex items-center gap-1 rounded-md bg-accent/60 px-2 py-1 text-[11px] font-medium text-accent-foreground">
											<ClipboardList className="size-3.5" />
											{assessments.length} assessment
											{assessments.length > 1 ? "s" : ""}
										</span>
									)}
									{notFinishedAsm > 0 && (
										<span className="flex items-center gap-1 rounded-md bg-destructive/60 px-2 py-1 text-[11px] font-medium text-accent-foreground">
											<ClipboardList className="size-3.5" />
											{notFinishedAsm} assessment
											{notFinishedAsm > 1 ? "s" : ""} not finished
										</span>
									)}

									{notFinishedAsm === 0 && (
										<span className="flex items-center gap-1 rounded-md bg-green-800/60 px-2 py-1 text-[11px] font-medium text-accent-foreground">
											<ClipboardCheck className="size-3.5" />
											Good to go
										</span>
									)}

								</div>
								<p className="text-sm font-semibold text-foreground/90">
									{subject.unitName || "Untitled subject"}
								</p>
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
										onClick={() => {
											setIsEditing(false);
										}}
									>
										<X />
									</Button>
								</div>
							</div>
						</div>

						<CardContent className="overflow-y-auto ">
							{assessments.length === 0 ? (
								<p className="text-sm text-muted-foreground">No assessments parsed.</p>
							) : (
								<div className="space-y-3  ">
									{assessments.map((asm, aIdx) => (
										<AssessmentCard
											key={`${asm.anchor || asm.name || aIdx}-${aIdx}`}
											assessment={asm}
											subjectIndex={index}
											index={aIdx}
											unitGuideURL={subject.unitGuideURL}
										/>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</DialogContent>
			</Dialog>
		</div>
	);
};


export default SubjectCard;
