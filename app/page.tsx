import Image from "next/image";
import Link from "next/link";
import "./page.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe2, ShieldCheck, Users } from "lucide-react";

const highlights = [
  {
    title: "Independent, student-led",
    description: "Created by students for students. No affiliation or endorsement by Macquarie University.",
    icon: Users,
  },
  {
    title: "Your data stays local",
    description: "The planner never touches internal systems or private records—everything remains on your device.",
    icon: ShieldCheck,
  },
  {
    title: "Public Unit Guides only",
    description: "Information is sourced from the public Unit Guide site so you stay aligned with official outlines.",
    icon: Globe2,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Single Hero Section (includes "How it works" content) */}
      <section
        id="hero"
        className="relative w-full min-h-screen flex items-center bg-gray-300 overflow-hidden"
        aria-label="Homepage hero"
      >
        <Image
          src="/backgrounds/hero-image.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover grayscale-50 filter blur-sm"
          fill
          loading="eager"
          priority
        />
        <div className="absolute inset-0 opacity-80 hero-image" />

        <div className="relative z-10 w-full">
          <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center text-white">
            <div className="space-y-5 text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
                An assessment planner for Macquarie University, built by students.
              </span>
              <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl leading-tight">
                Plan every assessment. Keep it local. Start fast.
              </h1>
              <p className="text-lg sm:text-xl text-gray-100/90 max-w-2xl">
                Collect unit guides, map every task, and visualise your workload—without handing data to anyone else.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  size="lg"
                  className="px-7 py-6 text-base font-semibold shadow-lg hover:shadow-xl"
                >
                  <Link href="/subject-planner">Getting started</Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="px-7 py-6 text-base font-semibold bg-white/15 border-white/30 text-white hover:bg-white/25"
                >
                  <Link href="https://unitguides.mq.edu.au/" target="_blank" rel="noreferrer">
                    View Unit Guides
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm uppercase tracking-wide text-white/80 font-semibold">
                How this app keeps you in control
              </p>
              <div className="grid grid-cols-1 gap-3">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={item.title}
                      className="h-full bg-white/20 backdrop-blur border-white/20 text-white shadow-lg gap-4"
                    >
                      <CardHeader className="flex flex-row items-center gap-3 pb-0">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <CardTitle className="leading-tight">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 text-white/80 text-sm">
                        {item.description}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
