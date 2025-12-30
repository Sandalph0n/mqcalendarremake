'use client';

import StudyPeriodSelector from "@/components/StudyPeriodSelector";



const SubjectPlannerPage = () => {


	
	return (
		<div className='flex flex-col min-h-screen items-center p-8'>

			<section id="study-period" className="w-full relative mt-6">
				<StudyPeriodSelector></StudyPeriodSelector>
			</section>

		</div>
	)
}

export default SubjectPlannerPage
