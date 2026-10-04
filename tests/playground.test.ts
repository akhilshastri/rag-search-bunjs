import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { chromium, type Browser, type Page } from "playwright";

const DOCS = process.env.DOCS_URL ?? "http://localhost:3000";
let browser: Browser;
let page: Page;

const preview = () => page.frameLocator('[data-testid="preview"]');

/** Replace the code of the currently open Monaco model. */
const setCode = (code: string) =>
  page.evaluate((c) => {
    const m = (window as any).monaco;
    m.editor.getEditors()[0].getModel().setValue(c);
  }, code);

beforeAll(async () => {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
    args: ["--no-sandbox"],
  });
  page = await browser.newPage();
  await page.goto(DOCS);
  await page.waitForSelector('[data-testid="status"]:text-is("ok")', { timeout: 30_000 });
});

afterAll(async () => {
  await browser?.close();
});

describe("playground", () => {
  test("renders the default example from the shared lib", async () => {
    await expect(preview().getByText("Shared lib demo").textContent()).resolves.toContain("Shared lib demo");
    await preview().getByRole("button", { name: "Click me" }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="console"]')?.textContent?.includes("clicked"));
  });

  test("loads a component from the federated remote", async () => {
    await page.getByRole("button", { name: /Counter \(remote\)/ }).click();
    await preview().getByText("Items:").waitFor();
    expect(await preview().locator("b").textContent()).toBe("5");
    await preview().getByRole("button", { name: "+" }).click();
    expect(await preview().locator("b").textContent()).toBe("7");
  });

  test("edits update the preview without reloading the iframe", async () => {
    await page.evaluate(() => ((window as any).__marker = 1));
    await setCode(`import { Card } from "@demo/ui";
export default function Demo() { return <Card title="Edited live">hello</Card>; }`);
    await preview().getByText("Edited live").waitFor();
    expect(await page.evaluate(() => (window as any).__marker)).toBe(1); // docs page not reloaded
  });

  test("errors show in the console panel and the page recovers", async () => {
    await setCode(`export default function Demo() { return <div>oops; }`);
    await page.waitForSelector('[data-testid="status"]:text-is("error")');
    expect(await page.textContent('[data-testid="console"]')).not.toBe("console");

    await setCode(`export default function Demo() { throw new Error("boom"); }`);
    await page.waitForFunction(() => document.querySelector('[data-testid="console"]')?.textContent?.includes("boom"));

    await setCode(`export default function Demo() { return <b>recovered</b>; }`);
    await preview().getByText("recovered").waitFor();
    await page.waitForSelector('[data-testid="status"]:text-is("ok")');
  });

  test("Monaco knows the component types", async () => {
    const markers = async (code: string) => {
      await setCode(code);
      await page.waitForTimeout(2500); // let the TS worker analyse
      return page.evaluate(() => {
        const m = (window as any).monaco;
        const model = m.editor.getEditors()[0].getModel();
        return m.editor.getModelMarkers({ resource: model.uri }).map((x: any) => x.message as string);
      });
    };
    const good = await markers(`import { Button } from "@demo/ui";
export default function Demo() { return <Button variant="danger">ok</Button>; }`);
    expect(good).toEqual([]);
    const bad = await markers(`import { Button } from "@demo/ui";
export default function Demo() { return <Button variant="bogus">x</Button>; }`);
    expect(bad.join(" ")).toContain("bogus");
  });
});
