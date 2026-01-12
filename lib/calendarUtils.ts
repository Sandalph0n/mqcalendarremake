
import { Temporal } from "temporal-polyfill";
import { SessionCalendarProps, MilestoneMap } from "@/contexts/PlannerContext";
import { isBetweenDates, TimePeriod, isBetweenPeriod, toSydneyPlainDate, toSydneyZonedDateTime, zonedMidnight } from "./timeUtils";
import { PERIOD_MILESTONE_KEYS } from "./data/MacquarieCalendarEntry";

export function milestoneToCalendar(milestone: MilestoneMap): SessionCalendarProps | null{
    const result: SessionCalendarProps = {
        firstHalf: {},
        recess: {},
        secondHalf: {},
        examPeriod: {},
        week: {}
    }

    const startPeriod = toSydneyZonedDateTime(milestone["study period start"]);
    const endDate = toSydneyZonedDateTime(milestone["exams end"]);
    
    // console.log(startPeriod!.toString())

    // return null
    if (!startPeriod || !endDate){
        console.log("Cannot find start date or end date")
        return null;
    }

    // Validate Monday using Date.getDay(): 1 = Monday, 0 = Sunday
    if (startPeriod.dayOfWeek !== 1) {
        console.log("start date is not monday");
        return null;
    }

    // Normalize to local-midnight (date-only) so we can do safe calendar arithmetic.
    
    
    const start = zonedMidnight(startPeriod)
    const end = zonedMidnight(endDate)


    // Gắn start date và enddate cho các tuần
    let currentWeek = 1;
    while (true) {
        // const weekStart = addDaysLocal(start, (currentWeek - 1) * 7);
        const weekStart = start.add({days: ((currentWeek - 1) * 7)})
        if (Temporal.ZonedDateTime.compare(weekStart, end) > 0) break;
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
        result.week[currentWeek].endDate = weekStart.add({days: 7});

        // console.log(result.week[currentWeek].startDate!.dayOfWeek ," ",result.week[currentWeek].startDate!.toString())
        // console.log(result.week[currentWeek].startDate!.dayOfWeek ," ",result.week[currentWeek].endDate!.toString() )
        // console.log("==============================")
        currentWeek++;

    }

    // Iterate with a strongly-typed key list to avoid `string` index errors.
    for (const event of PERIOD_MILESTONE_KEYS ) {
        const time = toSydneyZonedDateTime(milestone[event]);
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
    console.log("Done")

    return result;
} 
