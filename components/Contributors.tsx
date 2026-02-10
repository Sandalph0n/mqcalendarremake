'use client';


import Image from "next/image";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState } from "react";
import { Button } from "./ui/button";
import { Crown, Sparkles } from "lucide-react";


const GOAT = {
  name: "Ms Charanya Ramakrishnan",
  image: "/contributors/char.jpeg",
  role: "Course Director - Bachelor of IT | Development Supervisor",
}

const contributors = [

  {
    name: "Khoi Nguyen Vu",
    image: "/contributors/khoinguyenvu.jpg",
    role: "Bachelor of CyberSecurity | Lead Software Developer",
  },
  {
    name: "Tran Khoi Nguyen Nguyen",
    image: "/contributors/khoinguyennguyen.jpg",
    role: "Bachelor of Information Technology | Software Developer",
  },
];

export default function Contributors() {
  const [goatOpen, setGoatOpen] = useState<boolean>(false)


  return (
    <div className="w-full mt-0 mb-20">
      <div className="mb-5 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-3">
          Our Contributors
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          The people behind the product, passionate about what they do.
        </p>
      </div>

      <div className="my-2">
        <Collapsible
          open={goatOpen}
          onOpenChange={setGoatOpen}
          className="flex w-full flex-col gap-2 items-center"
        >
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className={[
                "group relative size-14 overflow-hidden rounded-full border-0 bg-transparent p-0 shadow-none",
                "text-foreground transition-all duration-300",
                "hover:-translate-y-0.5",
                "focus-visible:outline-none focus-visible:ring-0",
              ].join(" ")}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-[260%] group-hover:opacity-100"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100 data-[state=open]:opacity-100"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(166,25,46,0.22), rgba(214,51,132,0.22), rgba(166,25,46,0.22))",
                }}
              />

              <span className="relative flex items-center justify-center">
                <Crown className="size-6 text-current transition-colors duration-300 group-hover:text-primary-foreground data-[state=open]:text-primary-foreground" aria-hidden />
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2">
            <div className="flex items-center justify-center gap-2 p-2.5 pt-0 text-sm">
              <div className="w-full max-w-[360px] space-y-3">
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/70 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 px-4 py-2 text-xs font-semibold text-foreground">
                  <Sparkles className="size-4 text-primary" aria-hidden />
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    The True Queen
                  </span>
                  <Sparkles className="size-4 text-primary" aria-hidden />
                </div>

                <div
                  key={GOAT.name}
                  className="group relative w-full bg-card border border-border rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  style={{
                    animationDelay: `${100}ms`,
                  }}
                >
                  <div className="relative h-[300px] overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
                    <Image
                      src={GOAT.image}
                      alt={GOAT.name}
                      width={500}
                      height={500}
                      className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  <div className="relative px-6 py-6 text-center space-y-3">
                    <h3 className="text-xl font-semibold text-foreground leading-tight">
                      {GOAT.name}
                    </h3>
                    <p className="text-sm font-medium bg-gradient-to-r from-primary via-accent to-primary text-transparent bg-clip-text leading-relaxed">
                      {GOAT.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

      </div>

      <div className="flex flex-wrap items-stretch justify-center gap-8">
        {contributors.map((contributor, index) => (
          <div
            key={contributor.name}
            className="group relative w-full max-w-[320px] bg-card border border-border rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="relative h-[300px] overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
              <Image
                src={contributor.image}
                alt={contributor.name}
                width={500}
                height={500}
                className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            <div className="relative px-6 py-6 text-center space-y-3">
              <h3 className="text-xl font-semibold text-foreground leading-tight">
                {contributor.name}
              </h3>
              <p className="text-sm font-medium bg-gradient-to-r from-primary via-accent to-primary text-transparent bg-clip-text leading-relaxed">
                {contributor.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
