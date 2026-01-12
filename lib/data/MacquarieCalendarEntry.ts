import { dateFromSydneyLocalTime } from "../timeUtils";
import { Temporal } from "temporal-polyfill";


export type RawCalendarEntry = {
    study_period: string;
    date: string;
    date_name: string;
}

export type ParsedCalendarEntry = {
    study_period: string;
    session: number;
    year: number;
    date: string;
    date_name: string;
    // Temporal.ZonedDateTime to preserve timezone context.
    date_parsed: Temporal.ZonedDateTime;
}




export const RAW_CALENDAR_ENTRIES: readonly RawCalendarEntry[] = [
    {
        "study_period": "Session 1", "date": "19/2/2024", "date_name": "study period start"
    },
    {
        "study_period": "Session 1", "date": "15/4/2024", "date_name": "recess start"
    },
    {
        "study_period": "Session 1", "date": "28/4/2024", "date_name": "recess end"
    },
    {
        "study_period": "Session 1", "date": "29/4/2024", "date_name": "session classes resume"
    },
    {
        "study_period": "Session 1", "date": "2/6/2024", "date_name": "last day of classes"
    },
    {
        "study_period": "Session 1", "date": "3/6/2024", "date_name": "exams start"
    },
    {
        "study_period": "Session 1", "date": "21/6/2024", "date_name": "exams end"
    },
    {
        "study_period": "Session 1", "date": "21/6/2024", "date_name": "study period end"
    },
    {
        "study_period": "Session 2", "date": "22/7/2024", "date_name": "study period start"
    },
    {
        "study_period": "Session 2", "date": "16/9/2024", "date_name": "recess start"
    },
    {
        "study_period": "Session 2", "date": "29/9/2024", "date_name": "recess end"
    },
    {
        "study_period": "Session 2", "date": "30/9/2024", "date_name": "session classes resume"
    },
    {
        "study_period": "Session 2", "date": "3/11/2024", "date_name": "last day of classes"
    },
    {
        "study_period": "Session 2", "date": "4/11/2024", "date_name": "exams start"
    },
    {
        "study_period": "Session 2", "date": "22/11/2024", "date_name": "exams end"
    },
    {
        "study_period": "Session 2", "date": "22/11/2024", "date_name": "study period end"
    },
    {
        "study_period": "Session 3", "date": "9/12/2024", "date_name": "study period start"
    },
    {
        "study_period": "Session 3", "date": "23/12/2024", "date_name": "recess start"
    },
    {
        "study_period": "Session 3", "date": "1/1/2025", "date_name": "recess end"
    },
    {
        "study_period": "Session 3", "date": "2/1/2025", "date_name": "session classes resume"
    },
    {
        "study_period": "Session 3", "date": "19/1/2025", "date_name": "last day of classes"
    },
    {
        "study_period": "Session 3", "date": "20/1/2025", "date_name": "exams start"
    },
    {
        "study_period": "Session 3", "date": "24/1/2025", "date_name": "exams end"
    },
    {
        "study_period": "Session 3", "date": "24/1/2025", "date_name": "study period end"
    },
    {
        "study_period": "Session 1", "date": "24/2/2025", "date_name": "study period start"
    },
    {
        "study_period": "Session 1", "date": "14/4/2025", "date_name": "recess start"
    },
    {
        "study_period": "Session 1", "date": "25/4/2025", "date_name": "recess end"
    },
    {
        "study_period": "Session 1", "date": "28/4/2025", "date_name": "session classes resume"
    },
    {
        "study_period": "Session 1", "date": "8/6/2025", "date_name": "last day of classes"
    },
    {
        "study_period": "Session 1", "date": "10/6/2025", "date_name": "exams start"
    },
    {
        "study_period": "Session 1", "date": "27/6/2025", "date_name": "study period end"
    },
    {
        "study_period": "Session 1", "date": "27/6/2025", "date_name": "exams end"
    },
    {
        "study_period": "Session 2", "date": "28/7/2025", "date_name": "study period start"
    },
    {
        "study_period": "Session 2", "date": "22/9/2025", "date_name": "recess start"
    },
    {
        "study_period": "Session 2", "date": "6/10/2025", "date_name": "recess end"
    },
    {
        "study_period": "Session 2", "date": "7/10/2025", "date_name": "session classes resume"
    },
    {
        "study_period": "Session 2", "date": "9/11/2025", "date_name": "last day of classes"
    },
    {
        "study_period": "Session 2", "date": "10/11/2025", "date_name": "exams start"
    },
    {
        "study_period": "Session 2", "date": "28/11/2025", "date_name": "study period end"
    },
    {
        "study_period": "Session 2", "date": "28/11/2025", "date_name": "exams end"
    },
    {
        "study_period": "Session 3", "date": "15/12/2025", "date_name": "study period start"
    },
    {
        "study_period": "Session 3", "date": "25/12/2025", "date_name": "recess start"
    },
    {
        "study_period": "Session 3", "date": "4/1/2026", "date_name": "recess end"
    },
    {
        "study_period": "Session 3", "date": "5/1/2026", "date_name": "session classes resume"
    },
    {
        "study_period": "Session 3", "date": "25/1/2026", "date_name": "last day of classes"
    },
    {
        "study_period": "Session 3", "date": "27/1/2026", "date_name": "exams start"
    },
    {
        "study_period": "Session 3", "date": "2/2/2026", "date_name": "study period end"
    },
    {
        "study_period": "Session 3", "date": "2/2/2026", "date_name": "exams end"
    },
    {
        "study_period": "Session 1", "date": "23/02/2026", "date_name": "study period start"
    },
    {
        "study_period": "Session 1", "date": "6/04/2026", "date_name": "recess start"
    },
    {
        "study_period": "Session 1", "date": "19/04/2026", "date_name": "recess end"
    },
    {
        "study_period": "Session 1", "date": "20/04/2026", "date_name": "session classes resume"
    },
    {
        "study_period": "Session 1", "date": "7/06/2026", "date_name": "last day of classes"
    },
    {
        "study_period": "Session 1", "date": "9/06/2026", "date_name": "exams start"
    },
    {
        "study_period": "Session 1", "date": "26/06/2026", "date_name": "study period end"
    },
    {
        "study_period": "Session 1", "date": "26/06/2026", "date_name": "exams end"
    },
    {
        "study_period": "Session 2", "date": "27/07/2026", "date_name": "study period start"
    },
    {
        "study_period": "Session 2", "date": "21/09/2026", "date_name": "recess start"
    },
    {
        "study_period": "Session 2", "date": "5/10/2026", "date_name": "recess end"
    },
    {
        "study_period": "Session 2", "date": "6/10/2026", "date_name": "session classes resume"
    },
    {
        "study_period": "Session 2", "date": "8/11/2026", "date_name": "last day of classes"
    },
    {
        "study_period": "Session 2", "date": "9/11/2026", "date_name": "exams start"
    },
    {
        "study_period": "Session 2", "date": "27/11/2026", "date_name": "study period end"
    },
    {
        "study_period": "Session 2", "date": "27/11/2026", "date_name": "exams end"
    },
    {
        "study_period": "Session 3", "date": "14/12/2026", "date_name": "study period start"
    },
    {
        "study_period": "Session 3", "date": "28/12/2026", "date_name": "recess start"
    },
    {
        "study_period": "Session 3", "date": "3/01/2027", "date_name": "recess end"
    },
    {
        "study_period": "Session 3", "date": "4/01/2027", "date_name": "session classes resume"
    },
    {
        "study_period": "Session 3", "date": "24/01/2027", "date_name": "last day of classes"
    },
    {
        "study_period": "Session 3", "date": "25/01/2027", "date_name": "exams start"
    },
    {
        "study_period": "Session 3", "date": "1/02/2027", "date_name": "study period end"
    },
    {
        "study_period": "Session 3", "date": "1/02/2027", "date_name": "exams end"
    }
];


function parseCalendarEntry(): ParsedCalendarEntry[] {
    const parsed: ParsedCalendarEntry[] = [];

    for (const e of RAW_CALENDAR_ENTRIES) {
        // Dữ liệu đầu vào đang ở dạng dd/mm/yyyy (một số record có thể zero-pad).
        const [dStr, mStr, yStr] = e.date.split("/");
        const d = Number(dStr);
        const m = Number(mStr);
        const y = Number(yStr);

        if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) {
            throw new Error(`Invalid date string (expected dd/mm/yyyy): ${e.date}`);
        }

        // Vì data "chỉ ngày" nên ta mặc định 00:00:00.000 theo giờ Sydney.
        const date_parsed = dateFromSydneyLocalTime(y, m, d, 0, 0, 0, 0);


        parsed.push({
            ...e,
            session: Number(e.study_period.split(" ")[1]),
            year: y,
            date_parsed,
        });
    }

    return parsed;
}

export const ParsedCalendarEntries: ParsedCalendarEntry[] = parseCalendarEntry();

export type PeriodMileStoneProps = {
    "study period start"        ?: Temporal.PlainDate,
    "recess start"              ?: Temporal.PlainDate,
    "recess end"                ?: Temporal.PlainDate,
    "session classes resume"    ?: Temporal.PlainDate,
    "last day of classes"       ?: Temporal.PlainDate,
    "exams start"               ?: Temporal.PlainDate,
    "exams end"                 ?: Temporal.PlainDate,
    "study period end"          ?: Temporal.PlainDate,

}

export const PERIOD_MILESTONE_KEYS = [
    "study period start",
    "recess start",
    "recess end",
    "session classes resume",
    "last day of classes",
    "exams start",
    "exams end",
    "study period end",
] as const;

export type PeriodMileStoneKey = typeof PERIOD_MILESTONE_KEYS[number];

function isPeriodMileStoneKey(k: string): k is PeriodMileStoneKey {
    return (PERIOD_MILESTONE_KEYS as readonly string[]).includes(k);
}


export function getMileStoneByPeriod(year: number, session: number) : PeriodMileStoneProps | null{
    const result:PeriodMileStoneProps = {}
    

    for (let i = 0; i < ParsedCalendarEntries.length; i ++) {
        const pe = ParsedCalendarEntries[i]!;
        // the period start year alway the same, but the end period day might be in the next year, apply for session 3
        if (year !== pe.year || session != pe.session) {
            continue;
        }

        if (pe.date_name.toLowerCase().trim() === "study period start".toLowerCase().trim()) {
            result["study period start"] = pe.date_parsed.toPlainDate();
            for (let j = i+1; j < ParsedCalendarEntries.length; j ++){
                
                const nextRec = ParsedCalendarEntries[j]!;
                if ((year !== nextRec.year && year !== nextRec.year - 1) || session != nextRec.session) {
                    
                    continue;
                }
                if (isPeriodMileStoneKey(nextRec.date_name)) {
                    result[nextRec.date_name] = nextRec.date_parsed.toPlainDate();
                }
                if (nextRec.date_name.toLowerCase().trim() === "exams end".toLowerCase().trim()){
                    return result;
                }
            }
        }
    }
    return null;

}
