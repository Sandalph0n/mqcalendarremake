'use client';


import PeriodCalendar from "@/components/PeriodCalendar";
import StudyPeriodSelector from "@/components/StudyPeriodSelector";



const SubjectPlannerPage = () => {


	
	return (
		<div className='flex flex-col min-h-screen items-center p-8'>

			<section id="study-period" className="w-full relative mt-12">
				<StudyPeriodSelector/>
			</section>

			<section id="general-calender" className="w-full relative mt-24">
				<PeriodCalendar/>
			</section>
			

		</div>
	)
}

export default SubjectPlannerPage
