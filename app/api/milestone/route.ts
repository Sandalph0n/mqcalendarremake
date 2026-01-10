import { NextResponse, NextRequest } from "next/server";
import {
    getMileStoneByPeriod,
    PERIOD_MILESTONE_KEYS,
    PeriodMileStoneKey,
    PeriodMileStoneProps,
} from "@/lib/data/MacquarieCalendarEntry";
import { arch } from "os";

// type ParsedEntry = {
//   studyPeriod: string;
//   dateName: string;
//   date: string; // ISO yyyy-mm-dd
//   originalDate: string;
// };

// function parseDate(d: string): string | null {
//   const parts = d.split("/").map((p) => p.trim());
//   if (parts.length !== 3) return null;
//   const [day, month, year] = parts.map((v) => parseInt(v, 10));
//   if (
//     Number.isNaN(day) ||
//     Number.isNaN(month) ||
//     Number.isNaN(year) ||
//     day < 1 ||
//     month < 1 ||
//     month > 12
//   ) {
//     return null;
//   }
//   const iso = `${year.toString().padStart(4, "0")}-${month
//     .toString()
//     .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
//   return iso;
// }

// export async function POST(req: Request) {
//   try {
//     const { year, session } = await req.json();
//     const parsedYear = parseInt(year, 10);
//     const parsedSession = parseInt(session, 10);

//     if (!parsedYear || !parsedSession) {
//       return NextResponse.json(
//         { error: "Both year and session are required (numbers)." },
//         { status: 400 }
//       );
//     }

//     const sessionLabel = `Session ${parsedSession}`;
//     const entries = await loadEntries();

//     const milestones: ParsedEntry[] = entries
//       .filter((e) => e.study_period === sessionLabel)
//       .map((e) => {
//         const iso = parseDate(e.date);
//         return {
//           studyPeriod: e.study_period,
//           dateName: e.date_name,
//           date: iso ?? "",
//           originalDate: e.date,
//         };
//       })
//       .filter((e) => e.date && e.date.startsWith(`${parsedYear}-`))
//       .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

//     return NextResponse.json({
//       year: parsedYear,
//       session: parsedSession,
//       studyPeriod: sessionLabel,
//       milestones,
//     });
//   } catch (err) {
//     console.error("Failed to load milestones", err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// export function GET() {
//   return NextResponse.json(
//     { error: "Method Not Allowed" },
//     { status: 405, statusText: "Method Not Allowed" }
//   );
// }

export type MileStoneAPIProps = NextResponse<{
    year: number;
    session: number;
    milestone: PeriodMileStoneProps;
    key: PeriodMileStoneKey;
} | null>;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const year = Number(body?.year);
        const session = Number(body?.session);

        if (!Number.isFinite(year) || !Number.isFinite(session)) {
            return NextResponse.json(
                {
                    error: "Invalid payload",
                    message: `year and session must be numbers, got year: ${year} /session: ${session}`,
                },
                { status: 400 }
            );
        }

        const milestone = getMileStoneByPeriod(year, session);
        if (!milestone) {
            return NextResponse.json(
                {
                    error: "Not Found",
                    message: `No milestone found for given year/session, got year: ${year} /session: ${session}`,
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            year,
            session,
            milestone,
            keys: PERIOD_MILESTONE_KEYS,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
            { error: "Internal Server Error", message },
            { status: 500 }
        );
    }
}

export function GET() {
    return NextResponse.json(
        { error: "Method Not Allowed" },
        { status: 405, statusText: "Method Not Allowed" }
    );
}
