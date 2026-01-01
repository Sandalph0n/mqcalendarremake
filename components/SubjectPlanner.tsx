import React from 'react'
import { BookA } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

const SubjectPlanner = () => {
	return (
		<Card className="w-full border-none shadow-lg bg-linear-to-br from-background via-background/70 to-[#2f302f]/20 rounded-2xl">
			<CardHeader className="flex flex-col gap-2">
				<div className="flex items-center gap-3">
					<div className="h-11 w-11 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shadow-md">
						<BookA className="size-5" />
					</div>
					<div>
						<CardTitle className="text-xl">Subject Planner</CardTitle>
						<CardDescription>Fetch and manage your unit assignments.</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<input
						type="text"
						placeholder="Enter Unit Code, e.g. COMP1000"
						className="w-full rounded-md border px-3 py-2 bg-white/80 dark:bg-secondary/80 dark:text-white/80"
					/>
					<Button className="shrink-0">Fetch</Button>
				</div>
			</CardContent>
		</Card>
	)
}

export default SubjectPlanner
