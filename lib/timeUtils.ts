/**
 * Time utilities for working with dates in the Australia/Sydney timezone.
 *
 * @remarks
 * - JavaScript `Date` objects always represent an instant in time (UTC under the hood).
 * - Formatting/parsing with a specific IANA timezone requires `Intl.DateTimeFormat`.
 * - Helpers in this file aim to make grouping and displaying dates consistent for Sydney.
 */

/**
 * IANA timezone identifier for Sydney.
 *
 * @example
 * ```ts
 * new Intl.DateTimeFormat("en-AU", { timeZone: SYDNEY_TZ }).format(new Date());
 * ```
 */
export const SYDNEY_TZ = "Australia/Sydney";

/**
 * Milliseconds per day.
 *
 * @remarks
 * This is a fixed constant (24h). It does not account for DST day-length anomalies.
 */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Formatter for weekday names in Sydney.
 *
 * @remarks
 * Uses `en-AU` locale and `Australia/Sydney` timezone.
 * Output examples: "Mon", "Tue", ...
 */
export const weekdayFormatter = new Intl.DateTimeFormat("en-AU", { weekday: "short", timeZone: SYDNEY_TZ });

/**
 * Formatter that produces a stable date key (yyyy-mm-dd) in Sydney.
 *
 * @remarks
 * Uses the `en-CA` locale because it formats as ISO-like `YYYY-MM-DD`.
 */
export const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: SYDNEY_TZ });

/**
 * Compute the timezone offset (in minutes) for a given instant and IANA timezone.
 *
 * @param instant - The instant to evaluate (a `Date` object).
 * @param timeZone - IANA timezone string (e.g. "Asia/Ho_Chi_Minh", "Australia/Sydney").
 * @returns Offset in minutes such that: `localTime = utcTime + offset`.
 *
 * @remarks
 * This uses `Intl.DateTimeFormat(...).formatToParts()` to derive the wall-clock
 * time in the requested timezone and compares it to the input instant.
 */


export type TimePeriod = {
	startDate?: Date,
	endDate?: Date
}


export function getTimeZoneOffsetMinutes(instant: Date, timeZone: string): number {
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
        Number(map.second)
    );
    return (asUTC - instant.getTime()) / 60000;
}

/**
 * Create a stable Sydney-local date key for grouping (yyyy-mm-dd).
 *
 * @param date - Any `Date` instant.
 * @returns A `YYYY-MM-DD` string representing the Sydney-local calendar date.
 */
export function dateKeySydney(date: Date) {
    return dateKeyFormatter.format(date); // yyyy-mm-dd
}

/**
 * Convert a Sydney-local date key (yyyy-mm-dd) into a `Date` instant that
 * corresponds to 00:00 (midnight) Sydney time.
 *
 * @param key - Date key in `YYYY-MM-DD` format (Sydney-local).
 * @returns A `Date` representing the instant of Sydney midnight for that date.
 *
 * @remarks
 * This intentionally reconstructs an instant that aligns with Sydney midnight,
 * including DST changes.
 */
export function dateFromSydneyKey(key: string): Date {
    const [y, m, d] = key.split("-").map(Number);

    // We want Sydney-local midnight for the given date.
    const utcWallClock = Date.UTC(y, m - 1, d, 0, 0, 0, 0);

    const computeOffsetMinutes = (instantMs: number) => {
        const dtf = new Intl.DateTimeFormat("en-AU", {
            timeZone: SYDNEY_TZ,
            hour12: false,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            fractionalSecondDigits: 3,
        });
        const parts = dtf.formatToParts(new Date(instantMs));
        const map: Record<string, string> = {};
        for (const { type, value } of parts) map[type] = value;

        const asIfUTC = Date.UTC(
            Number(map.year),
            Number(map.month) - 1,
            Number(map.day),
            Number(map.hour),
            Number(map.minute),
            Number(map.second),
            Number(map.fractionalSecond ?? "0"),
        );

        return (asIfUTC - instantMs) / 60_000;
    };

    let off1 = computeOffsetMinutes(utcWallClock);
    let utcInstant = utcWallClock - off1 * 60_000;

    const off2 = computeOffsetMinutes(utcInstant);
    if (off2 !== off1) {
        utcInstant = utcWallClock - off2 * 60_000;
    }

    return new Date(utcInstant);
}

/**
 * Safe `Date` parser.
 *
 * @param value - A date string that the JS `Date` constructor can parse.
 * @returns A valid `Date` or `null` if the input is empty/invalid.
 */
export function toDate(value?: string): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Add arbitrary time deltas to a Date.
 *
 * @param date - Base instant.
 * @param delta - Either a millisecond delta (number) or an object containing any combination
 * of `{ days, hours, minutes, seconds, milliseconds }`.
 * @returns New `Date` shifted by the requested amount.
 *
 * @remarks
 * - This performs pure time arithmetic (adds milliseconds).
 * - For “next calendar day in Sydney” across DST boundaries, prefer working with
 *   date keys (`dateKeySydney`) rather than adding 24h chunks.
 */
export type AddTimeDelta = {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
};


export function addTimes(date: Date, delta: number | AddTimeDelta) {
    const base = date.getTime();

    // Allow passing raw milliseconds directly
    if (typeof delta === "number") {
        return new Date(base + delta);
    }

    const days = delta.days ?? 0;
    const hours = delta.hours ?? 0;
    const minutes = delta.minutes ?? 0;
    const seconds = delta.seconds ?? 0;
    const milliseconds = delta.milliseconds ?? 0;

    const totalMs =
        days * MS_PER_DAY +
        hours * 60 * 60 * 1000 +
        minutes * 60 * 1000 +
        seconds * 1000 +
        milliseconds;

    return new Date(base + totalMs);
}

/**
 * Add time deltas using *local calendar / wall-clock* semantics in a specific timezone.
 *
 * @param date - Base instant.
 * @param delta - Object containing any combination of calendar/wall-clock units.
 * @param timeZone - IANA timezone. Defaults to Sydney.
 * @returns New `Date` such that the *local time* in `timeZone` has advanced by the requested units.
 *
 * @remarks
 * This differs from `addTimes` (instant arithmetic). Here we:
 * - Convert the instant to local wall-clock parts in the target timezone.
 * - Add deltas to the *parts* (year/month/day/hour/...).
 * - Normalize overflows (e.g., 70 minutes => +1 hour +10 minutes).
 * - Rebuild the resulting instant so that the timezone-local wall clock matches.
 *
 * This prevents DST “hour drift”, e.g. `00:00 + 1 day` stays `00:00` even across DST changes.
 */
export type AddLocaleTimeDelta = {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
};

export function addLocaleTimes(date: Date, delta: AddLocaleTimeDelta, timeZone: string = SYDNEY_TZ) {
    // Step 1) Extract local wall-clock parts in the requested timezone.
    // We intentionally do not create a top-level helper; everything stays within this function.
    const dtf = new Intl.DateTimeFormat("en-AU", {
        timeZone,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        // Gives a `fractionalSecond` part in modern runtimes.
        fractionalSecondDigits: 3,
    });

    const parts = dtf.formatToParts(date);
    const map: Record<string, string> = {};
    for (const { type, value } of parts) {
        map[type] = value;
    }

    // Local parts (in `timeZone`)
    let y = Number(map.year);
    let m = Number(map.month); // 1..12
    let d = Number(map.day);
    let h = Number(map.hour);
    let min = Number(map.minute);
    let s = Number(map.second);
    // `fractionalSecond` is supported in modern browsers/Node; fall back to 0 if missing.
    let ms = Number(map.fractionalSecond ?? "0");

    // Step 2) Apply requested deltas to the *local* parts.
    // These are calendar / wall-clock units (NOT milliseconds on the UTC timeline).
    const years = delta.years ?? 0;
    const months = delta.months ?? 0;
    const weeks = delta.weeks ?? 0;
    const days = delta.days ?? 0;
    const hours = delta.hours ?? 0;
    const minutes = delta.minutes ?? 0;
    const seconds = delta.seconds ?? 0;
    const milliseconds = delta.milliseconds ?? 0;

    y += years;
    m += months;
    d += days + weeks * 7;
    h += hours;
    min += minutes;
    s += seconds;
    ms += milliseconds;

    // Step 3) Normalize overflow/underflow between fields using a neutral UTC construction.
    // This is only used to carry/borrow across fields (month length, 70 minutes => +1 hour, etc.).
    // Note: We do NOT interpret this as the final instant yet.
    const normalizedUTC = new Date(Date.UTC(y, m - 1, d, h, min, s, ms));
    y = normalizedUTC.getUTCFullYear();
    m = normalizedUTC.getUTCMonth() + 1;
    d = normalizedUTC.getUTCDate();
    h = normalizedUTC.getUTCHours();
    min = normalizedUTC.getUTCMinutes();
    s = normalizedUTC.getUTCSeconds();
    ms = normalizedUTC.getUTCMilliseconds();

    // Step 4) Rebuild the *real* instant that corresponds to the computed wall-clock time
    // in the given timezone (this is where DST offsets are applied correctly).
    //
    // IMPORTANT: timezone offset depends on the *instant*, so a single lookup can be wrong
    // right at DST boundaries (it may choose the pre/post offset and drift by 1 hour).
    // We solve `utc = utcWallClock - offset(utc)` via a tiny fixed-point iteration.

    // (4.1) Treat the desired wall-clock as if it were UTC to get an initial guess.
    const utcWallClock = Date.UTC(y, m - 1, d, h, min, s, ms);

    // (4.2) Compute offset minutes for an instant using Intl parts including milliseconds.
    // Returns conventional offset: local = utc + offset.
    const computeOffsetMinutes = (instantMs: number) => {
        const dtf2 = new Intl.DateTimeFormat("en-AU", {
            timeZone,
            hour12: false,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            fractionalSecondDigits: 3,
        });
        const parts2 = dtf2.formatToParts(new Date(instantMs));
        const m2: Record<string, string> = {};
        for (const { type, value } of parts2) m2[type] = value;

        const ly = Number(m2.year);
        const lm = Number(m2.month);
        const ld = Number(m2.day);
        const lh = Number(m2.hour);
        const lmin = Number(m2.minute);
        const ls = Number(m2.second);
        const lms = Number(m2.fractionalSecond ?? "0");

        const asIfUTC = Date.UTC(ly, lm - 1, ld, lh, lmin, ls, lms);
        return (asIfUTC - instantMs) / 60_000;
    };

    // (4.3) Iterate (2 passes is enough because DST offsets are piecewise constant).
    let off1 = computeOffsetMinutes(utcWallClock);
    let utcInstant = utcWallClock - off1 * 60_000;

    const off2 = computeOffsetMinutes(utcInstant);
    if (off2 !== off1) {
        utcInstant = utcWallClock - off2 * 60_000;
    }

    return new Date(utcInstant);
}

/**
 * Format a date for display in Australian English, pinned to Sydney timezone.
 *
 * @param date - The instant to format.
 * @returns A human-readable string like "Mon, 20 Jan 2025".
 */
export function formatDateAU(date: Date) {
    return date.toLocaleDateString("en-AU", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: SYDNEY_TZ,
    });
}


/**
 * Create a `Date` instant from a Sydney-local date and time.
 *
 * @param y - Full year (e.g. 2025).
 * @param m1to12 - Month number from 1 to 12.
 * @param d - Day of month (1–31).
 * @param h - Hour in Sydney local time (0–23). Defaults to 0.
 * @param min - Minute in Sydney local time. Defaults to 0.
 * @param s - Second in Sydney local time. Defaults to 0.
 * @param ms - Millisecond in Sydney local time. Defaults to 0.
 * @returns A `Date` representing the exact instant corresponding to the given
 * Sydney-local wall-clock time.
 *
 * @remarks
 * This function is the inverse of formatting in the Sydney timezone.
 * It correctly accounts for daylight saving time (DST) by:
 * 1. Treating the input values as a neutral UTC timestamp.
 * 2. Computing the Sydney offset at that instant.
 * 3. Adjusting the instant to obtain the real UTC time.
 *
 * Prefer this helper when you need to construct a `Date` from user input
 * (year/month/day/time) that is explicitly meant to be interpreted as
 * Sydney-local time.
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
    // (1) Treat the Sydney-local wall-clock as if it were UTC (initial guess)
    const utcWallClock = Date.UTC(y, m1to12 - 1, d, h, min, s, ms);

    // (2) Offset depends on the instant; iterate to stabilize across DST boundaries.
    const computeOffsetMinutes = (instantMs: number) => {
        const dtf = new Intl.DateTimeFormat("en-AU", {
            timeZone: SYDNEY_TZ,
            hour12: false,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            fractionalSecondDigits: 3,
        });
        const parts = dtf.formatToParts(new Date(instantMs));
        const map: Record<string, string> = {};
        for (const { type, value } of parts) map[type] = value;

        const asIfUTC = Date.UTC(
            Number(map.year),
            Number(map.month) - 1,
            Number(map.day),
            Number(map.hour),
            Number(map.minute),
            Number(map.second),
            Number(map.fractionalSecond ?? "0"),
        );

        return (asIfUTC - instantMs) / 60_000;
    };

    let off1 = computeOffsetMinutes(utcWallClock);
    let utcInstant = utcWallClock - off1 * 60_000;

    const off2 = computeOffsetMinutes(utcInstant);
    if (off2 !== off1) {
        utcInstant = utcWallClock - off2 * 60_000;
    }

    // (3) Final instant corresponding to the requested Sydney wall-clock.
    return new Date(utcInstant);
}




export function isBetweenDates(start:Date, end: Date, day:Date): boolean{
    return (day >= start && day < end);
}


export function isBetweenPeriod(period: TimePeriod, day:Date): boolean{
    return (day >= period.startDate! && day < period.endDate!);
}


// Helper: add N calendar days in *local time* without relying on ms arithmetic.
// Constructing a new Date from Y/M/D is DST-safe for midnight in almost all locales.
export const addDaysLocal = (d: Date, days: number) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, 0, 0, 0, 0);
