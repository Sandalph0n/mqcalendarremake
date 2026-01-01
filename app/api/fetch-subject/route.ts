import { NextResponse, NextRequest } from "next/server";
import { JSDOM } from "jsdom";
import { AssignmentProps, SubjectProps } from "@/contexts/PlannerContext";

// Hàm dùng chung: fetch Unit Guide và parse thành SubjectProps
export async function fetchSubjectFromUnitGuide(
    subjectURL: string
): Promise<SubjectProps> {
    const result: SubjectProps = {};

    const unitGuide = await fetch(subjectURL, { cache: "no-store" });
    if (!unitGuide.ok) {
        throw new Error(`Failed to fetch Unit Guide (${unitGuide.status})`);
    }
    const unitGuideHtml = await unitGuide.text();

    const document = new JSDOM(unitGuideHtml).window.document;
    const header = document.getElementsByClassName(
        "unit-guide-header-container"
    )[0];
    if (!header) {
        throw new Error("Unit Guide header not found");
    }

    const h1Header = header.getElementsByTagName("h1")[0];
    const h3Header = header.getElementsByTagName("h3")[0];

    result.unitCode = h1Header?.innerHTML.split("–")[0].trim() ?? "";
    result.unitName = h1Header?.innerHTML.split("–")[1]?.trim() ?? "";

    const sessionText = h3Header?.innerHTML.split(",")[0] ?? "";
    result.session = Number(
        sessionText.split("–")[1]?.trim().split(" ")[1]?.trim()
    );
    result.year = Number(sessionText.split("–")[0]?.trim());

    let assignmentTable = document.getElementById("assessment-tasks-section");
    if (!assignmentTable) {
        throw new Error("Assignments Not Found");
    }
    assignmentTable = assignmentTable.getElementsByTagName("table")[0];
    assignmentTable = assignmentTable.getElementsByTagName("tbody")[0];

    const assingments = assignmentTable.getElementsByTagName("tr");
    const parsedAssignments: AssignmentProps[] = [];

    for (const asm of assingments) {
        const parsedAsm: AssignmentProps = {
            name: "",
            weighting: 0,
            isWeekly: false,
            isHurdle: false,
            isExam: false,
            dueText: "",
            dueDate: undefined,
            dueWeek: undefined,
            anchor: "",
        };

        const titleCell = asm.getElementsByClassName("title")[0] as
            | HTMLElement
            | undefined;
        const anchor = titleCell ? titleCell.querySelector("a") : null;
        parsedAsm.name =
            anchor?.textContent?.trim() || titleCell?.textContent?.trim() || "";
        const rawHref = anchor?.getAttribute("href") || "";
        parsedAsm.anchor = rawHref.startsWith("#") ? rawHref.slice(1) : rawHref;

        const weightCell = asm.getElementsByClassName("weighting")[0] as
            | HTMLElement
            | undefined;
        const weightText = weightCell?.textContent || "";
        const weightMatch = weightText.match(/([0-9]+(?:\.[0-9]+)?)/);
        parsedAsm.weighting = weightMatch ? parseFloat(weightMatch[1]) : 0;

        const hurdleCell = asm.getElementsByClassName("hurdle")[0] as
            | HTMLElement
            | undefined;
        const hurdleText = hurdleCell?.textContent?.toLowerCase() || "";
        parsedAsm.isHurdle = /yes|true|hurdle/.test(hurdleText);

        const dueCell = asm.getElementsByClassName("due")[0] as
            | HTMLElement
            | undefined;
        const dueText = dueCell?.textContent?.trim() || "";
        parsedAsm.dueText = dueText;
        parsedAsm.isExam = /exam/.test(
            `${parsedAsm.name} ${dueText}`.toLowerCase()
        );

        const weeklyText = `${parsedAsm.name} ${parsedAsm.dueText}`.toLowerCase();
        parsedAsm.isWeekly = weeklyText.includes("weekly");

        parsedAssignments.push(parsedAsm);
    }

    result.unitGuideURL = subjectURL;
    result.assignments = parsedAssignments;

    return result;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const subjectURL = body?.subjectURL;
        if (!subjectURL) {
            return NextResponse.json(
                {
                    error: "Invalid payload",
                    message: "Request must include a valid Unit Guide URL",
                },
                { status: 400 }
            );
        }

        const subject = await fetchSubjectFromUnitGuide(subjectURL);
        return NextResponse.json({ subject });
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
