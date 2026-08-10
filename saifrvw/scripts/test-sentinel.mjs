const response = await fetch(
  "http://127.0.0.1:3000/api/analyze",
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      language: "javascript",
      code: `
        const password = "super-secret-password";
        eval(userInput);
        exec("ping " + req.query.host);
      `
    })
  }
);

if (!response.ok) {
  throw new Error(`Analyzer returned HTTP ${response.status}`);
}

const data = await response.json();

if (!data.ok) {
  throw new Error("Analyzer did not return ok=true");
}

if (!Array.isArray(data.analysis?.findings)) {
  throw new Error("Findings array missing");
}

if (data.analysis.findings.length < 2) {
  throw new Error("Regression test expected multiple findings");
}

console.log("✓ Sentinel analyzer smoke test passed");
