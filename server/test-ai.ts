async function test() {
  try {
    const res = await fetch("http://localhost:3001/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: {
          propertyType: "House",
          coverage: "Both",
          entryPoints: "3-4",
          pets: "Yes",
          storage: "Cloud",
          monitoring: "Yes"
        }
      })
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (e) {
    console.error("Fetch failed", e);
  }
}
test();
