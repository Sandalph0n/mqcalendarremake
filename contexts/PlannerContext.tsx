'use client';
import React ,{ createContext, useContext, useState } from "react";

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


type PlannerContextValue = {
  planner: PlannerProps | null;
  setPlanner: React.Dispatch<React.SetStateAction<PlannerProps | null>>;
};

const PlannerContext = createContext<PlannerContextValue | null>(null);




export function PlannerProvider({children}: {children: React.ReactNode}){
  const [planner, setPlanner] = useState<PlannerProps | null>(null);
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

