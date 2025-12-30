'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"


import React from 'react'

const PeriodCalendar = () => {
	return (
		<div className="relative">
			<div className="flex flex-col absolute -top-8 left-1/2 -translate-x-1/2 w-60 h-15 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
				<CardTitle>Period Calendar </CardTitle>
			</div>
			<Card className="w-full ">
				<CardHeader className="space-y-2 text-center ">
					<CardDescription className="mt-6">Set the year and session for your study period.</CardDescription>
				</CardHeader>
				<CardContent>
					
				</CardContent>
			</Card>
		</div>
	)
}

export default PeriodCalendar
