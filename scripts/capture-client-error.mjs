import { chromium } from "playwright";

const url = process.argv[2] ?? "https://motchis-house-of-beauty.vercel.app/";

const errors = [];
const pageErrors = [];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`[console] ${msg.text()}`);
});
page.on("pageerror", (err) => {
  pageErrors.push(`[pageerror] ${err.message}\n${err.stack ?? ""}`);
});

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

const text = await page.textContent("body");
const hasGlobal = text?.includes("Something went wrong") ?? false;

console.log(
  JSON.stringify(
    {
      url,
      hasGlobalError: hasGlobal,
      title: await page.title(),
      consoleErrors: errors.slice(0, 20),
      pageErrors: pageErrors.slice(0, 10),
      bodySnippet: text?.slice(0, 400)?.replace(/\s+/g, " "),
    },
    null,
    2
  )
);

await browser.close();
