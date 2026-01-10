'use client';

import React, { useState } from "react";
import { SubjectProps, usePlanner } from "@/contexts/PlannerContext";
import { ChevronDown, ExternalLink, ClipboardList } from "lucide-react";
import { Button } from "./ui/button";
import AssignmentCard from "./AssignmentCard";

type Props = {
	subject: SubjectProps;
	index: number;
};

const SubjectCard = ({ subject, index }: Props) => {
	const assignments = subject.assignments ?? [];
	const [isOpen, setIsOpen] = useState(() => {
		for (const asm of assignments) {
			if (!asm.dueWeek && !asm.dueDate) {
				return true;
			}
		}
		return false;
	});
	const { setPlanner } = usePlanner();
	const code = (subject.unitCode || `Subject ${index + 1}`).toUpperCase().trim();
	const unitGuideURL = subject.unitGuideURL;

	function handleDeleteSubject(e: React.MouseEvent<HTMLButtonElement>) {
		e.stopPropagation();
		setPlanner((prev) => {
			const subjects = [...(prev?.subjects ?? [])];
			subjects.splice(index, 1);
			return { ...(prev ?? {}), subjects };
		});
	}

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
						{assignments.length > 0 && (
							<span className="flex items-center gap-1 rounded-md bg-accent/60 px-2 py-1 text-[11px] font-medium text-accent-foreground">
								<ClipboardList className="size-3.5" />
								{assignments.length} assignment
								{assignments.length > 1 ? "s" : ""}
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
						<ChevronDown
							className={`size-5 cursor-pointer transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
							aria-hidden
							onClick={(e) => {
								e.stopPropagation();
								setIsOpen((o) => !o);
							}}
						/>
					</div>
				</div>
			</div>

			<div
				className={`grid overflow-hidden transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
					}`}
			>
				<div className="overflow-hidden border-t border-border bg-muted/40">
					<div className="space-y-3 p-5">
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<span className="font-semibold uppercase tracking-wide">Assignments</span>
							<span>{assignments.length} items</span>
						</div>
						{assignments.length === 0 ? (
							<p className="text-sm text-muted-foreground">No assignments parsed.</p>
						) : (
							<div className="space-y-3">
								{assignments.map((asm, aIdx) => (
									<AssignmentCard
										key={`${asm.anchor || asm.name || aIdx}-${aIdx}`}
										assignment={asm}
										subjectIndex={index}
										index={aIdx}
										unitGuideURL={subject.unitGuideURL}
									/>
								))}
							</div>
						)}
						<div className="flex justify-end pt-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleDeleteSubject}
							>
								Delete subject
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubjectCard;
