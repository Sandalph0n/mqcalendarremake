

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
    // `Date` KHÔNG lưu timezone; nó chỉ lưu một "instant" theo UTC epoch milliseconds.
    // Trường `date_parsed` bên dưới là instant tương ứng với ngày/giờ được hiểu theo Australia/Sydney.
    date_parsed: Date;
}

const SYDNEY_TZ = "Australia/Sydney";


/**
 * Tính offset múi giờ (tính bằng phút) giữa UTC và một IANA timezone (vd: "Australia/Sydney")
 * tại đúng thời điểm (instant) được truyền vào.
 *
 * Vì sao phải làm vòng vèo?    
 * - `Intl.DateTimeFormat` KHÔNG có API trả thẳng offset.
 * - Nó chỉ cho ta "các phần" (year/month/day/hour/minute/second) khi nhìn instant đó dưới timezone target.
 * - Ta sẽ:
 *   (1) format instant theo timezone target → lấy ra các con số địa phương
 *   (2) ghép các con số đó lại thành một timestamp UTC "giả" (coi giờ địa phương như là UTC)
 *   (3) lấy chênh lệch giữa UTC giả và UTC thật → ra offset.
 *
 * Lưu ý:
 * - Hàm này tự xử lý DST (Daylight Saving Time) vì `Intl` tính đúng theo timezone.
 * - Offset được trả về theo PHÚT (vì có timezone lệch 30/45 phút, không chỉ tròn giờ).
 */
function getTimeZoneOffsetMinutes(instant: Date, timeZone: string): number {
    const dtf = new Intl.DateTimeFormat("en-AU", {
        timeZone,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    // Bẻ string format thành từng phần để lấy ra số (year/month/day/hour/minute/second)
    const parts = dtf.formatToParts(instant);
    const map: Record<string, string> = {};
    for (const { type, value } of parts) {
        map[type] = value;
    }

    // Dựng một timestamp UTC "giả": coi các số địa phương (theo timezone target)
    // như là chúng đang ở UTC.
    const asUTC = Date.UTC(
        Number(map.year),
        Number(map.month) - 1,
        Number(map.day),
        Number(map.hour),
        Number(map.minute),
        Number(map.second),
    );

    // Chênh lệch (ms) giữa UTC giả và epoch ms thật của instant.
    // Chia 60_000 để đổi ms → phút (đơn vị tự nhiên của timezone offset).
    return (asUTC - instant.getTime()) / 60_000;
}

/**
 * Tạo `Date` (UTC instant) từ một thời điểm được hiểu theo GIỜ ĐỊA PHƯƠNG Australia/Sydney.
 *
 * Mục tiêu:
 * - Input: (y, m, d, h, min, s, ms) được hiểu là "giờ Sydney".
 * - Output: một `Date` đại diện đúng INSTANT đó (lưu theo UTC epoch ms),
 *          bất kể code chạy ở Sydney/Mỹ/Châu Âu...
 *
 * Vì sao không dùng `new Date(y, m-1, d, ...)`?
 * - `new Date(...)` sẽ hiểu theo timezone MÁY đang chạy (local machine/server), nên deploy ở đâu là sai ở đó.
 *
 * Cách làm:
 * (1) tạo một mốc UTC "trung tính" bằng `Date.UTC(...)` (không phụ thuộc timezone máy)
 * (2) tính offset của Australia/Sydney tại mốc đó (DST-aware)
 * (3) trừ offset để ra instant UTC đúng tương ứng với giờ Sydney.
 */
export function dateFromSydneyLocalTime(
    y: number,
    m1to12: number,
    d: number,
    h = 0,
    min = 0,
    s = 0,
    ms = 0,
): Date {
    // (1) Mốc UTC trung tính: coi các số input như đang ở UTC.
    const utcBase = Date.UTC(y, m1to12 - 1, d, h, min, s, ms);

    // (2) Offset của Sydney tại instant này (tính theo phút, có DST)
    const offsetMin = getTimeZoneOffsetMinutes(new Date(utcBase), SYDNEY_TZ);

    // (3) Trừ offset để ra instant UTC thật tương ứng với giờ Sydney input.
    return new Date(utcBase - offsetMin * 60_000);
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
    "study period start"        ?: Date,
    "recess start"              ?: Date,
    "recess end"                ?: Date,
    "session classes resume"    ?: Date,
    "last day of classes"       ?: Date,
    "exams start"               ?: Date,
    "exams end"                 ?: Date,
    "study period end"          ?: Date,

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
        const pe = ParsedCalendarEntries[i];
        // the period start year alway the same, but the end period day might be in the next year, apply for session 3
        if (year !== pe.year || session != pe.session) {
            continue;
        }

        if (pe.date_name.toLowerCase().trim() === "study period start".toLowerCase().trim()) {
            result["study period start"] = pe.date_parsed;
            for (let j = i+1; j < ParsedCalendarEntries.length; j ++){
                
                const nextRec = ParsedCalendarEntries[j];
                if ((year !== nextRec.year && year !== nextRec.year - 1) || session != nextRec.session) {
                    
                    continue;
                }
                if (isPeriodMileStoneKey(nextRec.date_name)) {
                    result[nextRec.date_name] = nextRec.date_parsed;
                }
                if (nextRec.date_name.toLowerCase().trim() === "study period end".toLowerCase().trim()){
                    return result;
                }
            }
        }
    }
    return null;

}
