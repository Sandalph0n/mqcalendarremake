'use client';
import React ,{ createContext, useContext, useState, useEffect } from "react";
import Settings from "@/config/AppSetting" 


export type PlannerProps = {
	year?: number,
	session?: number,
	subjects?: {
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
	planner: PlannerProps | null
	setPlanner: React.Dispatch<React.SetStateAction<PlannerProps | null>>
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
  const [planner, setPlanner] = useState<PlannerProps | null>(() => {
    try{
      return getStorageValue()
    }
    catch(err){
      console.error("Failed to load planner from localStorage", err);
    }
    return null;
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
