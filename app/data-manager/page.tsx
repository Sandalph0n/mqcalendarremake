'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlanner, PlannerProps } from "@/contexts/PlannerContext";
import Settings from "@/config/AppSetting";
import { Download, RefreshCcw, Save, Upload, Trash2 } from "lucide-react";

type SavedItem = {
  id: string;
  name: string;
  data: PlannerProps;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_PLANNER: PlannerProps = { subjects: [] };
const SAVES_KEY = "planner-storage-v1";

const readSavedContexts = (): SavedItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVES_KEY);
    if (raw) return JSON.parse(raw) as SavedItem[];
  } catch (err) {
    console.error("Failed to load saved contexts", err);
  }
  return [];
};

// Use a fixed locale and timezone so that server and client
// render the same text during hydration.
const DATE_FORMATTER = new Intl.DateTimeFormat("en-AU", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Australia/Sydney",
});

function formatDate(iso: string) {
  return DATE_FORMATTER.format(new Date(iso));
}

export default function DataManagerPage() {
  const { planner, setPlanner } = usePlanner();
  const [saves, setSaves] = useState<SavedItem[]>(readSavedContexts);
  const [currentName, setCurrentName] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Persist saves whenever they change (skip first run to avoid overwriting existing storage)
  useEffect(() => {
    try {
      localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
    } catch (err) {
      console.error("Failed to persist saved contexts", err);
    }
  }, [saves]);

  const workingLabel = useMemo(() => currentName || "unsaved-context", [currentName]);

  const handleClear = () => {
    localStorage.removeItem(Settings.STORAGE_KEY);
    setPlanner(DEFAULT_PLANNER);
    setStatus("Planner reset to default.");
  };

  const upsertSave = (name: string, data: PlannerProps) => {
    const now = new Date().toISOString();
    setSaves((prev) => {
      const idx = prev.findIndex((s) => s.name === name);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], data, updatedAt: now };
        return next;
      }
      return [...prev, { id: nanoid(), name, data, createdAt: now, updatedAt: now }];
    });
    setCurrentName(name);
    setStatus(`Saved "${name}".`);
  };

  const handleSaveCurrent = () => {
    const name = currentName.trim();
    if (!name) {
      setStatus("Please enter a name before saving.");
      return;
    }
    upsertSave(name, planner);
  };

  const downloadJson = (name: string, data: PlannerProps) => {
    const fileName = `${name || "planner"}-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportCurrent = () => {
    let name = currentName.trim();
    if (!name) {
      const promptName = window.prompt("Enter a name for this context before exporting:");
      if (!promptName) return;
      name = promptName.trim();
      upsertSave(name, planner);
    } else {
      upsertSave(name, planner);
    }
    downloadJson(name, planner);
    setStatus(`Exported "${name}" as JSON.`);
  };

  const handleExportSaved = (item: SavedItem) => {
    downloadJson(item.name, item.data);
    setStatus(`Exported "${item.name}" as JSON.`);
  };

  const handleLoadSaved = (item: SavedItem) => {
    setPlanner(item.data);
    setCurrentName(item.name);
    setStatus(`Loaded "${item.name}" into planner.`);
  };

  const handleDeleteSaved = (id: string) => {
    setSaves((prev) => prev.filter((s) => s.id !== id));
    setStatus("Deleted saved context.");
  };

  const handleImportFile = async (file?: File) => {
    const f = file ?? fileInputRef.current?.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const data = JSON.parse(text) as PlannerProps;
      const nameFromFile = f.name.replace(/\\.json$/i, "") || `import-${Date.now()}`;
      upsertSave(nameFromFile, data);
      setPlanner(data);
      setStatus(`Imported and loaded "${nameFromFile}".`);
    } catch (err) {
      console.error(err);
      setStatus("Import failed: invalid JSON.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background px-4 py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <Card className="shadow-lg border-border/80 bg-card/95">
          <CardHeader>
            <CardTitle>Data Manager</CardTitle>
            <CardDescription>
              Clear, save, load, import, and export planner contexts. All actions stay on your device.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="context-name">Current context name</Label>
                <Input
                  id="context-name"
                  placeholder="e.g. Session1-2026"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSaveCurrent}>
                  <Save className="size-4 mr-2" /> Save current
                </Button>
                <Button variant="outline" onClick={handleExportCurrent}>
                  <Download className="size-4 mr-2" /> Export JSON
                </Button>
                <Button variant="destructive" onClick={handleClear}>
                  <RefreshCcw className="size-4 mr-2" /> Clear planner
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Import JSON</Label>
                <div
                  className={`flex flex-col gap-3 rounded-md border-2 border-dashed p-3 transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border/70 bg-muted/30"}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file?.type === "application/json") {
                      handleImportFile(file);
                    } else {
                      setStatus("Only JSON files are supported.");
                    }
                  }}
                >
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="application/json"
                      ref={fileInputRef}
                      onChange={(e) => handleImportFile(e.target.files?.[0])}
                    />
                    <Button variant="secondary" onClick={() => handleImportFile()}>
                      <Upload className="size-4 mr-1.5" /> Import
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Drag & drop a JSON file here, or choose a file to import.
                  </p>
                </div>
              </div>
              {status && (
                <p className="text-sm text-muted-foreground">{status}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Saved contexts</p>
                  <p className="text-xs text-muted-foreground">Stored in localStorage key “{SAVES_KEY}”.</p>
                </div>
              </div>
              <div className="max-h-45 overflow-y-auto pr-1">
                <div className="grid gap-3 md:grid-cols-2">
                  {saves.length === 0 && (
                    <div className="rounded-md border border-dashed border-border/70 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                      No saved contexts yet.
                    </div>
                  )}
                  {saves.map((item) => (
                    <Card key={item.id} className="bg-card/90 border-border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{item.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Updated {formatDate(item.updatedAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex gap-2">
                        <Button size="sm" onClick={() => handleLoadSaved(item)}>
                          Load
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleExportSaved(item)}>
                          Export
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSaved(item.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Current Context (read-only)</CardTitle>
            <CardDescription>View the live planner JSON currently in use.</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              readOnly
              className="w-full h-[360px] rounded-md border bg-muted/40 p-3 font-[var(--font-mono)] text-xs text-foreground/90 resize-none"
              value={JSON.stringify(planner, null, 2)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
