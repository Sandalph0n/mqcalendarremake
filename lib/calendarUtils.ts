

import { SessionCalendarProps, MilestoneMap } from "@/contexts/PlannerContext";
import { toDate, addDaysLocal, isBetweenDates, TimePeriod, isBetweenPeriod } from "./timeUtils";
import { PERIOD_MILESTONE_KEYS, PeriodMileStoneKey } from "./data/MacquarieCalendarEntry";

export function milestoneToCalendar(milestone: MilestoneMap): SessionCalendarProps | null{
    const result: SessionCalendarProps = {
        firstHalf: {},
        recess: {},
        secondHalf: {},
        examPeriod: {},
        week: {}
    }

    const startPeriod = toDate(milestone["study period start"]) 
    const endDate = toDate(milestone["exams end"])
    if (!startPeriod || !endDate){
        console.log("Cannot find start date or end date")
        return null;
    }

    // Validate Monday using Date.getDay(): 1 = Monday, 0 = Sunday
    // if (startPeriod.getDay() !== 1) {
    //     console.log("start date is not monday");
    //     return null;
    // }

    // Normalize to local-midnight (date-only) so we can do safe calendar arithmetic.
    const start = new Date(
        startPeriod.getFullYear(),
        startPeriod.getMonth(),
        startPeriod.getDate(),
        0, 0, 0, 0
    );
    const end = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        0, 0, 0, 0
    );


    let currentWeek = 1;
    while (true) {
        const weekStart = addDaysLocal(start, (currentWeek - 1) * 7);
        if (weekStart > end) break;
        // initialize the week if not yet existed
        if (!result.week[currentWeek]) {
            result.week[currentWeek] = {
                startDate: undefined,
                endDate: undefined,
                weekLabel: [],
                weekLabelShort: [],
                events: {},
                hasStudyPeriod: false,
                hasRecessPeriod: false,
                hasExamPeriod: false
            };
        }
        result.week[currentWeek].startDate = weekStart;
        // Keep the same semantics as the old code: endDate is the next Monday at 00:00 (exclusive)
        result.week[currentWeek].endDate = addDaysLocal(weekStart, 7);
        currentWeek++;
    }
    
    // Iterate with a strongly-typed key list to avoid `string` index errors.
    for (const event of PERIOD_MILESTONE_KEYS ) {
        const time = toDate(milestone[event]);
        if (!event || !time) continue;
        for (const w in result.week){
            if (isBetweenDates(result.week[w].startDate!, result.week[w].endDate!, time)){
                result.week[w].events![event] = milestone[event]
                if (event === "study period start"){
                    result.firstHalf!.startDate = time
                }
                else if (event === "recess start"){
                    result.firstHalf!.endDate = time
                    result.recess!.startDate = time
                }
                else if (event === "recess end"){
                    result.recess!.endDate = time
                    
                }
                else if (event === "session classes resume"){
                    result.secondHalf!.startDate = time
                }
                else if (event === "last day of classes"){
                    result.secondHalf!.endDate = time
                }
                else if (event === "exams start"){
                    result.examPeriod!.startDate = time
                }
                else if (event === "exams end"){
                    result.examPeriod!.endDate = time
                }
            }
        }
    }

    const mainPeriodType: TimePeriod[] = [
        result.firstHalf!,
        result.recess!,
        result.secondHalf!,
        result.examPeriod!
    ]

    let studyWeekCount = 1
    let recessWeekCount = 1
    let examWeekCount = 1

    for(const period of mainPeriodType){
        for(const w in result.week){
            if (isBetweenPeriod(period, result.week[w].startDate!) || 
                isBetweenPeriod(result.week[w], period.startDate!)){
                if (period === result.firstHalf || period === result.secondHalf){
                    result.week[w].hasStudyPeriod = true;
                    result.week[w].weekLabel?.push("Study W" + studyWeekCount)
                    result.week[w].weekLabelShort?.push("W" + studyWeekCount)

                    studyWeekCount++;
                }
                else if (period === result.recess){
                    result.week[w].hasRecessPeriod = true;
                    result.week[w].weekLabel?.push("Recess W" + recessWeekCount)
                    result.week[w].weekLabelShort?.push("R" + recessWeekCount)

                    recessWeekCount++;
                }
                else if (period === result.examPeriod){
                    result.week[w].hasExamPeriod = true;
                    result.week[w].weekLabel?.push("Exam W" + examWeekCount)
                    result.week[w].weekLabelShort?.push("E" + examWeekCount)

                    examWeekCount++;
                }
            }
        }
    }
    
    
    return result;
} 