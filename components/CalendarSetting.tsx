import React, { useMemo } from "react";
// ví dụ: import { usePlanner } from "@/context/PlannerContext";
import { usePlanner } from "@/contexts/PlannerContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronsUpDown, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible"

import { Label } from "./ui/label";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "radix-ui";

type RGB = [number, number, number];

function clamp255(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function rgbToHex(rgb: RGB) {
  const [r, g, b] = rgb.map(clamp255);
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
}

function hexToRgb(hex: string): RGB | null {
  const cleaned = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;

  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return [r, g, b];
}



const CalendarSetting = ({ openSetting, setOpenSetting }: {
  openSetting: boolean,
  setOpenSetting: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  // LEGACY, DON'T DELETE
  // const [colorMenuOpen, setColorMenuOpen] = useState<boolean>(false);

  const { planner, setPlanner } = usePlanner();

  return (
    <div>
      <Dialog open={openSetting} onOpenChange={setOpenSetting}>

        <VisuallyHidden.Root>
          <DialogTitle>Calendar Settings Dialog Box</DialogTitle>
        </VisuallyHidden.Root >
        
        <DialogContent
          className={cn(
            "fixed p-0 max-w-3xl w-full border-none bg-transparent shadow-none sm:max-w-3xl sm:max-h-5xl max-h-[70%] h-full",
          )}
          showCloseButton={false}
        >
          <Card className="0 w-full max-h-[90vh] ">
            <CardHeader>
              <CardTitle>Calendar Settings</CardTitle>

              <CardDescription></CardDescription>
              <CardAction>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setOpenSetting((prev) => !prev)}
                >
                  <X />
                </Button>
              </CardAction>
            </CardHeader>

            <CardContent className="overflow-y-auto flex flex-col ">
              <Separator className="w-[90%] mx-auto mb-2" />

{/*               
              LEGACY - DON'T DELETE
              <Collapsible
                open={colorMenuOpen}
                onOpenChange={setColorMenuOpen}
                className="flex w-full flex-col gap-2"
              >
                <CollapsibleTrigger asChild className="group" >
                  <Button variant="ghost" className="w-full hover:bg-muted hover:text-muted-foreground hover:none">Subject Colors
                    <ChevronDownIcon className="ml-auto group-data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col items-start gap-2 p-2.5 pt-0 text-sm">
                  <div>
                    This panel can be expanded or collapsed to reveal additional
                    content.
                  </div>
                </CollapsibleContent>
              </Collapsible> */}

              {(() => {
                const subjects = planner.subjects ?? [];
                return (
                  <div className="flex flex-col gap-2 px-2">
                    {subjects.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        No subjects yet.
                      </div>
                    ) : (
                      subjects.map((subject) => {
                        const unitCode = subject.unitCode ?? "(No UnitCode)";
                        const unitName = subject.unitName ?? "(No UnitName)";
                        const currentHex = subject.displayColor ? rgbToHex(subject.displayColor) : "#888888";

                        return (
                          <div
                            key={unitCode}
                            className="flex items-center justify-between rounded-md border p-2"
                          >
                            <div className="flex flex-col">
                              <div className="text-sm font-medium">{unitCode} – {unitName}</div>
                              {/* <div className="text-xs text-muted-foreground">
                                Pick a color for this subject
                              </div> */}
                            </div>

                            <div className="flex items-center">
                              <div className="relative h-6 w-6 overflow-hidden rounded border border-border">
                                <input
                                  type="color"
                                  value={currentHex}
                                  onChange={(e) => {
                                    // console.log(e.target.value)

                                    const rgb = hexToRgb(e.target.value);
                                    console.log(e.target.value)
                                    console.log("hi")
                                    if (!rgb) return;

                                    setPlanner((prev) => ({
                                      ...prev,
                                      subjects: (prev.subjects ?? []).map((s) =>
                                        s.unitCode === subject.unitCode
                                          ? { ...s, displayColor: rgb }
                                          : s
                                      ),
                                    }));
                                  }}
                                  // className="absolute inset-0 h-10 w-10 cursor-pointer border-none p-0 opacity-0"
                                  className="absolute inset-0 h-10 w-10 cursor-pointer border-none p-0 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] "

                                  aria-label={`Color for ${unitCode}`}
                                />
                                {/* <div
                                  className="h-full w-full"
                                  style={{ backgroundColor: currentHex }}
                                /> */}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                )
              })()
              }




            </CardContent>

          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarSetting;
