'use client';

import GenericCalendar from "@/components/GenericCalendar";
import StudyPeriodSelector from "@/components/StudyPeriodSelector";
import SubjectPlanner from "@/components/SubjectPlanner";
import { usePlanner } from "@/contexts/PlannerContext";
import { cn } from "@/lib/utils";



const SubjectPlannerPage = () => {
	const { planner } = usePlanner();
	const hasStudyPeriod = Boolean(planner?.year && planner?.session);


	
	return (
		<div className='flex flex-col min-h-screen items-center px-4 py-10 bg-linear-to-b from-background via-background to-muted/40'>
			<div className="w-full max-w-6xl flex flex-col gap-16">
				<section id="study-period" className="w-full relative">
					<StudyPeriodSelector/>
				</section>

				{!hasStudyPeriod && (
					<div className="w-full rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
						Select a year and session to view milestones and start planning subjects.
					</div>
				)}

				<div
					className={cn(
						"flex flex-col gap-16 transition-all duration-500 ease-out overflow-hidden",
						hasStudyPeriod
							? "opacity-100 translate-y-0 max-h-1000"
							: "opacity-0 -translate-y-4 max-h-0 pointer-events-none"
					)}
					aria-hidden={!hasStudyPeriod}
				>
					<section id="generic-calender" className="w-full relative">
						<GenericCalendar/>
					</section>
					
					<section id="subject-planner" className="w-full relative">
						<SubjectPlanner/>
					</section>
				</div>
			</div>
		</div>
	)
}

export default SubjectPlannerPage 
