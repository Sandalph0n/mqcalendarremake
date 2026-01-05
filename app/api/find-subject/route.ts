import { NextResponse, NextRequest } from "next/server";

import {JSDOM} from "jsdom" 
import { fetchSubjectFromUnitGuide } from "../fetch-subject/route";


export async function POST(req: NextRequest){
    try{
        const body = await req.json();
        const year = Number(body?.year);
        const session = Number(body?.session);
        const unitCode = body?.unitCode;

        if (!year || !session || !unitCode){
            return NextResponse.json(
                {
                    error: "Invalid payload",
                    message: "Request must include year, session and unitcode",
                },
                { status: 400 }
            );
        }
        const formURL = `https://unitguides.mq.edu.au/units/search/${year}?query=${unitCode}` 

        const unitSearch = await fetch(formURL);
        const unitSearchHtml = await unitSearch.text()
        const document = (new JSDOM(unitSearchHtml)).window.document
        // Lấy danh sách link unit guide từ bảng search
        const subjectTable = document.getElementsByClassName("table-search-results")[0]
        const rawHrefs = subjectTable
            ? Array.from(subjectTable.getElementsByTagName("a")).map((a) => a.getAttribute("href"))
            : [];

        const unitGuideURLs = rawHrefs
            .filter(Boolean)
            .map((href) => new URL(href as string, formURL).toString());

        for (const url of unitGuideURLs){
            try{
                const subject = await fetchSubjectFromUnitGuide(url);
                const matchYear = subject.year === year;
                const matchSession = subject.session === session;
                const matchUnit = subject.unitCode?.toLowerCase().trim() === unitCode.toLowerCase().trim();

                if (matchYear && matchSession && matchUnit){
                    return NextResponse.json({ subject });
                }
            }
            catch(err){
                // Bỏ qua link hỏng, thử link kế tiếp
                continue;
            }
        }

        return NextResponse.json(
            { error: "Not Found", message: "No matching Unit Guide found for provided year/session/unitCode." },
            { status: 404 }
        );
    }
    catch(err){
        const message = err instanceof Error ? err.message : String(err);
        console.log(message)

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
