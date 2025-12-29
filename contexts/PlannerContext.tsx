'use client';
import { createContext, useContext, useState } from "react";

type PlannerProps = {
	year: number,
	session: number,
	subjects: {
		[subjectId: number] : {
			unitCode: string
			unitName: string
			unitGuideURL: string
			assignments: {
				[asmId: string]: {
					name: string
					weighting: number
					isHurdle: boolean 
					dueDate?: string
					dueWeek: number
					anchor: string					
				}
			}
		}
	}
};


export const PlannerContext = createContext<PlannerProps | undefined>(undefined);

export function PlannerProvider(){
	const [planner, setPlanner] = useState(null);

	return{
		

	}

}


export function usePlanner(){
  const plannerContext = useContext(PlannerContext);

  if (!plannerContext){
    throw new Error("usePlanner must be used within PlannerProvider");
  }

  return plannerContext;

}
