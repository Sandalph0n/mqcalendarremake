import React from 'react'
import { BookA } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const SubjectPlanner = () => {
	return (
		<Card className="w-full border-none shadow-lg bg-linear-to-br from-background via-background/70 to-[#2f302f]/20">
			<CardHeader className="flex flex-col gap-2">
				<div className="flex items-center gap-3">
					<div className="h-11 w-11 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shadow-md">
						<BookA className="size-5" />
					</div>
					<div>
						<CardTitle className="text-xl">Subject Planner</CardTitle>
						<CardDescription>Manage subjects and assignments (placeholder).</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent />
		</Card>
	)
}

export default SubjectPlanner
