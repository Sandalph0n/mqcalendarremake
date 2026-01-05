const SYDNEY_TZ = "Australia/Sydney";


// Lấy độ lệch của thời gian theo timezone của một instant date đưa vào, so với thời gian của date đó tại UTC
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

    const parts = dtf.formatToParts(instant);
    const map: Record<string, string> = {};
    for (const { type, value } of parts) {
        map[type] = value;
    }

    
    const asUTC = Date.UTC(
        Number(map.year),
        Number(map.month) - 1,
        Number(map.day),
        Number(map.hour),
        Number(map.minute),
        Number(map.second),
    );

    return (asUTC - instant.getTime()) / 60_000;
}

export function dateFromSydneyLocalTime(
    y: number,
    m1to12: number,
    d: number,
    h = 0,
    min = 0,
    s = 0,
    ms = 0,
): Date {
    const utcBase = Date.UTC(y, m1to12 - 1, d, h, min, s, ms);

    const offsetMin = getTimeZoneOffsetMinutes(new Date(utcBase), SYDNEY_TZ);

    return new Date(utcBase - offsetMin * 60_000);
}



// const timeZone = "Australia/Sydney" 
const timeZone = "Asia/Ho_Chi_Minh" 

const dtf = new Intl.DateTimeFormat("en-AU", {
    timeZone ,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
});


const day = new Date()



const parts = dtf.formatToParts(day)

const print = console.log

print(parts)

print(day.toUTCString())
