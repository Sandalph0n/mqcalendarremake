import { Temporal } from "temporal-polyfill";

/**
 * Time utilities backed by Temporal for the Australia/Sydney timezone.
 *
 * Notes:
 * - Use `Temporal.ZonedDateTime` for any value that needs timezone context.
 * - Use `Temporal.PlainDate` for date-only values (weeks, milestones, etc.).
 * - Helpers here normalise inputs (Date strings, JS Date, Temporal types) into Temporal objects.
 */

export const SYDNEY_TZ = "Australia/Sydney";

// Keep the existing formatters for convenience.
export const weekdayFormatter = new Intl.DateTimeFormat("en-AU", { weekday: "short", timeZone: SYDNEY_TZ });

export type TimePeriod = {
	startDate?: Temporal.ZonedDateTime;
	endDate?: Temporal.ZonedDateTime;
};

/**
 * Normalize any supported value into a ZonedDateTime in the Sydney timezone.
 * Accepts ISO strings, JS Date, Temporal types.
 */
export function toSydneyZonedDateTime(
	value?: string | Date | Temporal.ZonedDateTime | Temporal.PlainDate | Temporal.PlainDateTime | Temporal.Instant | null,
): Temporal.ZonedDateTime | null {
	if (value === null || value === undefined) return null;
	try {
		if (value instanceof Temporal.ZonedDateTime) {
			return value.withTimeZone(SYDNEY_TZ);
		}
		if (value instanceof Temporal.PlainDateTime) {
			return value.toZonedDateTime(SYDNEY_TZ);
		}
		if (value instanceof Temporal.PlainDate) {
			return value.toZonedDateTime({ timeZone: SYDNEY_TZ, plainTime: Temporal.PlainTime.from("00:00") });
		}
		if (value instanceof Temporal.Instant) {
			return value.toZonedDateTimeISO(SYDNEY_TZ);
		}
		if (value instanceof Date) {
			if (Number.isNaN(value.getTime())) return null;
			return Temporal.Instant.fromEpochMilliseconds(value.getTime()).toZonedDateTimeISO(SYDNEY_TZ);
		}
		if (typeof value === "string") {
			// Try ISO string first, then date-only fallback.
			try {
				return Temporal.ZonedDateTime.from(value).withTimeZone(SYDNEY_TZ);
			} catch {
				const plain = Temporal.PlainDate.from(value);
				return plain.toZonedDateTime({ timeZone: SYDNEY_TZ, plainTime: Temporal.PlainTime.from("00:00") });
			}
		}
	} catch (err) {
		console.error("Failed to parse to Sydney ZonedDateTime", err);
		return null;
	}
	return null;
}

/**
 * Normalize any supported value into a PlainDate (Sydney-local date).
 */
export function toSydneyPlainDate(
	value?: string | Date | Temporal.ZonedDateTime | Temporal.PlainDate | Temporal.PlainDateTime | Temporal.Instant | null,
): Temporal.PlainDate | null {
	const zdt = toSydneyZonedDateTime(value);
	return zdt ? zdt.toPlainDate() : null;
}

/**
 * Date key (yyyy-mm-dd) for Sydney local date.
 */
export function dateKeySydney(
	value: string | Date | Temporal.ZonedDateTime | Temporal.PlainDate | Temporal.PlainDateTime | Temporal.Instant,
) {
	const d = toSydneyPlainDate(value);
	return d ? d.toString() : "";
}

/**
 * Convert a yyyy-mm-dd key (Sydney-local) into a ZonedDateTime at 00:00 Sydney.
 */
export function dateFromSydneyKey(key: string): Temporal.ZonedDateTime {
	return Temporal.PlainDate.from(key).toZonedDateTime({
		timeZone: SYDNEY_TZ,
		plainTime: Temporal.PlainTime.from("00:00"),
	});
}

/**
 * Format a Temporal value for display in en-AU, pinned to Sydney timezone.
 */
export function formatDateAU(value: Temporal.ZonedDateTime | Temporal.PlainDate | string | Date): string {
	const zdt = toSydneyZonedDateTime(value);
	if (!zdt) return "";
	return zdt.toLocaleString("en-AU", {
		weekday: "short",
		day: "2-digit",
		month: "short",
		year: "numeric"
	});
}

/**
 * Add a duration to a ZonedDateTime or Instant.
 */
export type AddTimeDelta = Temporal.DurationLike;
export function addTimes(value: Temporal.ZonedDateTime | Temporal.Instant, delta: AddTimeDelta) {
	return value.add(delta);
}

/**
 * Add N calendar days respecting wall-clock semantics.
 * Accepts ZonedDateTime or PlainDate; returns same type as input where possible.
 */
export function addDaysLocal(d: Temporal.ZonedDateTime | Temporal.PlainDate, days: number) {
	if (d instanceof Temporal.ZonedDateTime) {
		return d.add({ days });
	}
	return d.add({ days });
}

/**
 * Construct a ZonedDateTime from Sydney-local wall clock parts.
 */
export function dateFromSydneyLocalTime(
	y: number,
	m1to12: number,
	d: number,
	h = 0,
	min = 0,
	s = 0,
	ms = 0,
): Temporal.ZonedDateTime {
	return Temporal.ZonedDateTime.from({
		timeZone: SYDNEY_TZ,
		year: y,
		month: m1to12,
		day: d,
		hour: h,
		minute: min,
		second: s,
		millisecond: ms,
	});
}

export function isBetweenDates(
	start: Temporal.ZonedDateTime,
	end: Temporal.ZonedDateTime,
	day: Temporal.ZonedDateTime,
): boolean {
	return Temporal.ZonedDateTime.compare(day, start) >= 0 && Temporal.ZonedDateTime.compare(day, end) < 0;
}

export function isBetweenPeriod(period: TimePeriod, day: Temporal.ZonedDateTime): boolean {
	if (!period.startDate || !period.endDate) return false;
	return isBetweenDates(period.startDate, period.endDate, day);
}

/**
 * Helper: convert to midnight in the same zone.
 * Accepts ZonedDateTime and returns ZonedDateTime.
 */
export function zonedMidnight(date: Temporal.ZonedDateTime) {
	return date.with({
		hour: 0,
		minute: 0,
		second: 0,
		millisecond: 0,
		microsecond: 0,
		nanosecond: 0,
	});
}

/**
 * Backward-compatible helper: convert a PlainDate or ZonedDateTime to ZonedDateTime at midnight.
 */
export function plainDateToZonedMidnight(
	date: Temporal.PlainDate | Temporal.ZonedDateTime,
	timeZone: string = SYDNEY_TZ,
) {
	if (date instanceof Temporal.ZonedDateTime) {
		return zonedMidnight(date.withTimeZone(timeZone));
	}
	return date.toZonedDateTime({ timeZone, plainTime: Temporal.PlainTime.from("00:00") });
}
