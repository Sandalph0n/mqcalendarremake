async function fetchSubject() {
  const res = await fetch(
    "https://assignmentplanner.vercel.app/api/find-subject",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year: 2025,
        session: 2,
        unitCode: "COMP1000",
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Request failed");
  }
  const data = await res.json();
  console.log("Subject:", data.subject);
}

fetchSubject().catch(console.error);
