import { guard, guardJson } from "../src";

async function flakySearchApi(query: string): Promise<string> {
  if (Math.random() < 0.4) {
    throw new Error("Search provider timed out");
  }

  return JSON.stringify({
    query,
    results: [
      {
        title: "Private AI assistant",
        url: "https://2026-04-21-that-s-a-full-green-run.vercel.app",
      },
    ],
  });
}

async function main() {
  const search = await guard(
    () => flakySearchApi("local-first AI assistant"),
    {
      maxRetries: 3,
      timeout: 2_000,
      retryDelay: 250,
    }
  );

  if (!search.success) {
    console.error("Tool failed:", search.error?.message);
    process.exitCode = 1;
    return;
  }

  const parsed = await guardJson(() => Promise.resolve(search.data), {
    strict: false,
  });

  console.log({
    success: parsed.success,
    attempts: search.attempts,
    repaired: parsed.repairs.length > 0,
    data: parsed.data,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
