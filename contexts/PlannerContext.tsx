'use client';
import React ,{ createContext, useContext, useState, useEffect } from "react";
import Settings from "@/config/AppSetting" 
import { PeriodMileStoneKey } from "@/lib/data/MacquarieCalendarEntry";
import { TimePeriod } from "@/lib/timeUtils";

export type MilestoneMap = Partial<Record<PeriodMileStoneKey, string>>;
export type AssignmentProps = {
	name?: string
	weighting?: number
	isWeekly?: boolean
	isHurdle?: boolean 
	isExam?: boolean,
	dueText?: string
	dueDate?: string
	dueWeek?: number
	anchor?: string
}

export type SessionCalendarProps = {
	week:{ 
		[week: number  ]: { 
			startDate?: Date
			endDate?: Date
			weekLabel?: string[]
			events?: Partial<Record<PeriodMileStoneKey, string>>
			hasStudyPeriod?: boolean
			hasRecessPeriod?: boolean
			hasExamPeriod?: boolean
		}
		
	}
	firstHalf?: TimePeriod
	recess?: TimePeriod
	secondHalf?: TimePeriod
	examPeriod?: TimePeriod
}


export type SubjectProps=  {
	year?: number
	session?: number
	unitCode?: string
	unitName?: string
	unitGuideURL?: string
	assignments?: AssignmentProps[]
	
}

export type PlannerProps = {
	year?: number,
	session?: number,
	calendar?: SessionCalendarProps,
	milestone?: MilestoneMap,
	milestoneKeys?: string[],
	subjects: SubjectProps[],
	orders?: string[],
};






type PlannerContextValue = {
	planner: PlannerProps 
	setPlanner: React.Dispatch<React.SetStateAction<PlannerProps >>
}
const PlannerContext = createContext<PlannerContextValue | null>(null);


export function getStorageValue(): PlannerProps | null{
	try{
		const raw = localStorage.getItem(Settings.STORAGE_KEY);
		if (raw){
			return(JSON.parse(raw));
		}
  }
	catch(err){
		return null;
	}
	return null;
} 


export function PlannerProvider({children}: {children: React.ReactNode}){
  const [planner, setPlanner] = useState<PlannerProps>(() => {
		const defaultPlanner = {
				subjects: []
			};
    try{
      return getStorageValue() ?? defaultPlanner
    }
    catch(err){
      console.error("Failed to load planner from localStorage", err);
    }
    return defaultPlanner;
  });

  // persist vào localStorage khi state đổi
  useEffect(() => {
    if (!planner) return;
    try{
      localStorage.setItem(Settings.STORAGE_KEY, JSON.stringify(planner));
    }
    catch(err){
      console.error("Failed to save planner to localStorage", err);
    }
  }, [planner]);

  return (
    <PlannerContext.Provider value={{planner, setPlanner}}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner(){
  const plannerContext = useContext(PlannerContext);

  if (!plannerContext){
    throw new Error("usePlanner must be used within PlannerProvider");
  }

  return plannerContext;

}
