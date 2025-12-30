import Image from "next/image";
import "./page.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarRange, CloudDownload, GitBranch, LayoutList } from "lucide-react";
import Link from "next/link";
import ScrollButton from "@/components/ScrollButton";


export default function Home() {
  const features = [
    {
      title: "Plan and manage your assignments",
      description: "Collect unit guides, capture every task, and keep everything organised in one place.",
      cta: "Start planning",
      icon: LayoutList,
    },
    {
      title: "Visualize your plan",
      description: "Generate a heatmap calendar so you know exactly when the workload spikes.",
      cta: "See calendar",
      icon: CalendarRange,
    },
    {
      title: "Offload your plan",
      description: "Save to your device and reload offline after the first visit—no retyping required.",
      cta: "Enable offline",
      icon: CloudDownload,
    },
    {
      title: "Integrate in your app",
      description: "Use the public API to pull calendar data into your own tools or dashboards.",
      cta: "View docs",
      icon: GitBranch,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section id="hero" className="relative w-full h-[90vh] flex items-center bg-gray-300 overflow-hidden" aria-label="Homepage hero">
        {/* Background image element so we can apply filters */}
        <Image
          src="/backgrounds/hero-image.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover grayscale-50 filter blur-sm"
          fill
          loading="eager"
        />
        {/* red-pink cover */}
        <div className="absolute inset-0 opacity-80 hero-image" />
        {/* Element div */}
        <div className="relative z-10 mx-auto text-center text-white">
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl">Assignment Planner</h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-100/90 max-w-2xl mx-auto">
            Manage, Visualize and Genarate Assignment Calendar for Macquarie University Students
          </p>
        <ScrollButton 
          targetId="roadmap"
          className="mt-6 inline-flex hover:cursor-pointer items-center justify-center px-6 py-3  font-semibold text-primary-foreground  shadow-md hover:shadow-lg transition-all"
          variant="secondary"
        >
          Getting started
        </ScrollButton>

        </div>

      </section>

      {/* Feature Section */}
      <section id="roadmap" className="py-16 bg-background h-lvh items-center flex">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Roadmap</p>
            <h2 className="text-3xl font-bold mt-2">From planning to integration</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Follow the steps below to manage assignments, build a calendar, work offline, and extend with APIs.
            </p> 
          </div>
          <div className="relative mt-12">
            {/* Connecting line behind roadmap cards (desktop only):
                - hidden md:block: only render from md breakpoint to avoid clutter on mobile
                - absolute + z-0: positioned relative to this container and sits beneath the cards
                - top-1/2: vertically centers the line relative to card stack
                - left/right 6%: insets so circles/edges don't hit the viewport edge
                - pointer-events-none: prevent blocking hover/click on cards */}
            <div
              className="hidden md:block absolute top-1/2 left-[6%] right-[6%] h-1 bg-primary/20 rounded-full pointer-events-none z-0"
              aria-hidden
            />
            {/* Cards sit above the line (z-10) and use a responsive grid: single column on mobile, 4 cols on md+ */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="relative">
                    <div className="hidden md:flex absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                      {idx + 1}
                    </div>
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Icon className="size-5 min-w-3xl" aria-hidden />
                          </span>
                          <CardTitle className="text-lg leading-tight">{feature.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4 pt-0 h-full">
                        <CardDescription className="flex-1 text-sm">{feature.description}</CardDescription>
                        <Button variant="secondary" className="w-full">
                          {feature.cta}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 bg-secondary text-secondary-foreground h-lvh flex items-center">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          <div className="max-w-3xl space-y-2 text-center mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">How this app works</p>
            <h2 className="text-3xl font-bold">Built by students, powered by your unit guides</h2>
            <p className="text-secondary-foreground/90">
              This tool is a student-made planner. It is not an official Macquarie University product, and it never connects to your
              internal accounts or private data. Everything stays on your device.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Independent, student-led</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Created by students to help peers organise assessments. No affiliation or endorsement by the University.
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle>Your data stays local</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                The planner does not access internal systems or personal records. Plans are stored on your device (and can be saved
                offline later).
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle>Public Unit Guides only</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>
                  We fetch information from the public Unit Guide site&mdash;the official place where each unit publishes its
                  outline, assessments, weightings, and schedule.
                </p>
                <Button asChild variant="link" className="p-0 h-auto font-semibold">
                  <Link href="https://unitguides.mq.edu.au/" target="_blank" rel="noreferrer">
                    Visit the Unit Guide site
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}
