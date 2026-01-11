import Contributors from "@/components/Contributors";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarRange,
  CloudDownload,
  GitBranch,
  Heart,
  LayoutList,
  Shield,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import studentsCollaborating from "../../public/contributors/student.jpg";
import { FeatureHighlight } from "@/components/FeatureHighlight";

export default function AboutPage() {
  const OurValues = [
    {
      title: "Student First",
      description:
        "Built by students, for students. We understand the challenges of managing multiple assignments and deadlines.",
      icon: User,
    },
    {
      title: "Privacy Focused",
      description:
        "Your data stays on your device. No accounts, no tracking, no external servers storing your plans.",
      icon: Shield,
    },
    {
      title: "Open and Transparent",
      description:
        "We use only public Unit Guides and make our approach clear. No hidden data collection or affiliations.",
      icon: Sparkles,
    },
    {
      title: "Community Driven",
      description:
        "Created to help the Macquarie University community better organize their academic journey.",
      icon: Heart,
    },
  ];

  const features = [
    {
      icon: LayoutList,
      title: "Plan and manage your assignments",
      description:
        "Collect unit guides, capture every task, and keep everything organised in one place.",
    },
    {
      icon: CalendarRange,
      title: "Visualize your plan",
      description:
        "Generate a heatmap calendar so you know exactly when the workload spikes.",
    },
    {
      icon: CloudDownload,
      title: "Offload your plan",
      description:
        "Save to your device and reload offline after the first visit—no retyping required.",
    },
    {
      icon: GitBranch,
      title: "Integrate in your app",
      description:
        "Use the public API to pull calendar data into your own tools or dashboards.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background px-4 py-10">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        {/* Our Values Section */}
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-foreground">Our Values</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The principles that guide everything we build and how we serve the
              student community.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {OurValues.map((OurValue) => {
              const Icon = OurValue.icon;
              return (
                <Card
                  key={OurValue.title}
                  className="border-border/80 bg-card/95 shadow-lg"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <CardTitle className="text-xl leading-tight">
                        {OurValue.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-foreground/80">
                      {OurValue.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features Highlight Section */}
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#A6192E] to-[#6A0D83] rounded-2xl transform -rotate-3"></div>
              <Image
                src={studentsCollaborating}
                alt="Students collaborating"
                className="relative rounded-2xl shadow-2xl w-full h-96 object-cover"
                width={500}
                height={500}
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                Built for Student Success
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our platform combines powerful features with an intuitive design
                to make academic planning effortless and effective.
              </p>
              <div className="space-y-6">
                {features.map((feature) => (
                  <FeatureHighlight key={feature.title} {...feature} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contributors Section */}
        <Contributors />
      </div>
    </div>
  );
}
