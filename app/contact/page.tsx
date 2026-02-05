"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);


  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) {
      setError("Please enter your feedback before submitting.");
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback, email: email || undefined }),
      });

      if (!res.ok) {
        throw new Error("Failed to send feedback");
      }

      setStatus("success");
      setFeedback("");
      setEmail("");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError("Something went wrong. Please try again.");
    } finally {
      setStatus((prev) => (prev === "submitting" ? "idle" : prev));
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-10 md:py-16">
      <div className="relative w-full max-w-xl">
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-linear-to-br from-primary/10 via-background to-primary/5 blur-2xl dark:from-primary/20 dark:via-background dark:to-primary/10" />

        <Card className="backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Contact &amp; Feedback</CardTitle>
            <CardDescription>
              Found a bug or a suggestion? Share your thoughts
              below &mdash; they really help improve the planner for everyone.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="space-y-2">
                <label className="flex flex-col gap-1 text-sm font-medium">
                  <span>Contact email (optional)</span>
                  <Input
                    type="email"
                    placeholder="you@student.mq.edu.au"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <p className="text-xs text-muted-foreground">
                  We&apos;ll only use this if we need to follow up on your feedback.
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex flex-col gap-1 text-sm font-medium">
                  <span>Your feedback</span>
                  <textarea
                    className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input min-h-[160px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive md:text-sm"
                    placeholder="Tell us what you think about the planner"
                    value={feedback}
                    maxLength={800}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </label>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {status === "success" && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Thanks for your feedback! It&apos;s been sent.
                </p>
              )}

              <div className="mt-2 flex items-center justify-between gap-3">
                <Button type="submit" disabled={status === "submitting"}>
                  {status === "submitting" ? "Sending..." : "Send feedback"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
