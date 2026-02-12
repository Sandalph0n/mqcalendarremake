import React, { useState } from 'react'
import { BookA } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { usePlanner } from '@/contexts/PlannerContext';
import { SubjectProps } from '@/contexts/PlannerContext';
import SubjectCard from './SubjectCard';
import Link from 'next/link';
import { nanoid } from 'nanoid';
const SubjectPlanner = () => {
	const { planner, setPlanner } = usePlanner();

	const [isFetch, setIsFetch] = useState<boolean>(false);
	const [unitCodeInput, setUnitCodeInput] = useState<string>("");
	const [error, setError] = useState<string>("");


	async function handleFetch() {
		// setPlanner((prev) => ({...prev, subjects: []}))
		// console.log(planner) 
		// return
		if (!unitCodeInput) { // check if user entered unit
			setError("Please enter Unit Code to fetch")
			return;
		}
		for (const s of planner.subjects) { // check if the unit is added
			// console.log(s)
			if (s.unitCode?.toLowerCase() == unitCodeInput.toLowerCase()) {
				setError(`${unitCodeInput} is already added to the plan`)
				return
			}
			else {
				console.log(s.unitCode?.toLowerCase(), " ", unitCodeInput.toLowerCase())
			}
		}

		try {
			setIsFetch(true)
			const res = await fetch("/api/find-subject", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					year: planner.year,
					session: planner.session,
					unitCode: unitCodeInput,
				}),
			});

			if (!res.ok) {
				if (res.status == 404) {
					throw new Error(`Cannot find subject ${unitCodeInput} for period ${planner.year} session ${planner.session}. Please check unit guide and try again.`);
				}
				else {
					throw new Error(`Internal server error. Please contact us to report the error!`);
				}
			}

			const data = await res.json() as { subject: SubjectProps };
			const dataWithID = {
				subject: { ...data.subject, id: nanoid() }
			}
			setPlanner(prev => {
				const subjects = prev?.subjects ?? [];
				return {
					...(prev ?? {}),
					subjects: [...subjects, dataWithID.subject],
				};
			})

			setError("")
		}

		catch (err) {
			setError(err instanceof Error ? err.message : String(err))
		}
		finally {
			setIsFetch(false)
		}
	}

	function handleChangeUnit(event: React.ChangeEvent<HTMLInputElement>) {
		setUnitCodeInput(event.target.value)
	}





	return (
		<Card className="w-full border-none shadow-lg bg-linear-to-br from-background via-background/70 to-[#2f302f]/20 rounded-2xl">

			<CardHeader className="flex flex-col gap-2">
				<div className="flex items-center gap-3">
					<div className="h-11 w-11 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shadow-md">
						<BookA className="size-5" />
					</div>
					<div>
						<CardTitle className="text-xl">Subject Planner</CardTitle>
						<CardDescription>Fetch and manage your unit assessments.</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className='flex flex-col gap-2'>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<input
						type="text"
						placeholder="Enter Unit Code, e.g. COMP1000"
						className="w-full rounded-md border px-3 py-2 bg-white/80 dark:bg-secondary/80 dark:text-white/80"
						// className="w-full rounded-md border px-3 py-2 bg-secondary-foreground/80 dark:text-white/80"
						value={unitCodeInput}
						onChange={handleChangeUnit}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleFetch();
							}
						}}
					/>
					<Button
						className="shrink-0"
						disabled={isFetch}
						onClick={handleFetch}
					>
						{!isFetch ? "Fetch" : "Fetching"}
					</Button>
				</div>
				{error ? (
					<div className="my-1 w-full rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
						<p className="text-sm font-semibold text-destructive">{error}</p>
						<p className="mt-1 text-xs text-destructive/90">
							If you believe it&apos;s an error, please{" "}
							<Link href="/contact" className="underline underline-offset-2">
								report it
							</Link>
							.
						</p>
					</div>
				) : (!planner?.subjects || planner.subjects.length === 0) ? (
					<div className="mt-6 flex w-full justify-center">
						<CardDescription>Please add some subject to start building your calendar</CardDescription>
					</div>
				) : null}
				<div className='flex items-center justify-center gap-3 flex-col w-full'>
					{planner?.subjects && planner.subjects.length > 0 && (
						planner.subjects.map(
							(subject, idx) => (
								<SubjectCard key={subject.id} subject={subject} index={idx} />
							)
						)
					)}
				</div>
				{planner?.subjects && planner.subjects.length > 0 && (
					<div className="mt-6 flex justify-center">
						<Button asChild>
							<Link href="/calendar">View Calendar</Link>
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default SubjectPlanner
