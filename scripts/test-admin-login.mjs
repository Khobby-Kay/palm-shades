import { chromium } from "playwright";

const url = process.argv[2] ?? "https://motchis-house-of-beauty.vercel.app/admin/login";
const email = process.argv[3] ?? "motchisbeauty@gmail.com";
const password = process.argv[4] ?? "MOTCHIS2024!";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.fill('input[type="email"]', email);
await page.fill('input[type="password"]', password);
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);

const body = (await page.textContent("body")) ?? "";
const pathname = new URL(page.url()).pathname;

console.log(
  JSON.stringify(
    {
      finalUrl: page.url(),
      pathname,
      loginFailed: body.includes("Login Failed"),
      unauthorized: body.includes("admin access"),
      onAdminDashboard: pathname === "/admin",
      pageErrors: errors.slice(0, 5),
      snippet: body.replace(/\s+/g, " ").slice(0, 200),
    },
    null,
    2
  )
);

await browser.close();
