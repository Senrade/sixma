import { expect, test } from "@playwright/test";

const accessKey = "sixma-demo-event:v1:access:S005";
const badgeKey = "sixma-demo-event:v1:badge:signal-breaker";
const fearAppealCode = "WX7-89S-IDK";
const inactiveCodes = [
  "K4M-7QX-2RP",
  "N8V-3HC-6TY",
  "G5R-W9K-4AZ",
  "P2D-8LF-X7M",
  "T6Y-C3N-9QH",
] as const;

test("keeps S005 locked until the Fear Appeal card is redeemed", async ({ page }) => {
  await page.goto("/en/mission/S005");

  await expect(
    page.getByRole("heading", { name: "This special case is locked" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Redeem a card" })).toHaveAttribute(
    "href",
    "/en/redeem",
  );

  await page.evaluate((key) => {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        caseId: "S005",
        cardId: "cognitive-pause",
        redeemedAt: new Date().toISOString(),
      }),
    );
  }, accessKey);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "This special case is locked" }),
  ).toBeVisible();
});

test("shows the Fear Appeal guide and rejects every inactive card code", async ({ page }) => {
  await page.goto("/en/redeem");
  const input = page.getByLabel("Event card code");

  await expect(
    page.getByRole("heading", { name: "Test the Fear Appeal card" }),
  ).toBeVisible();
  await expect(page.getByText(fearAppealCode, { exact: true })).toBeVisible();
  await expect(page.getByAltText("Fear Appeal SIXMA event card")).toHaveAttribute(
    "src",
    "/assets/cards/card-1.svg",
  );

  await input.fill("bad-code-9");
  await page.getByRole("button", { name: "Check code" }).click();
  await expect(page.getByText(/not active for this demo/)).toBeVisible();

  for (const code of inactiveCodes) {
    await input.fill(code);
    await page.getByRole("button", { name: "Check code" }).click();
    await expect(page.getByText(/not active for this demo/)).toBeVisible();
    await expect
      .poll(() => page.evaluate((key) => window.localStorage.getItem(key), accessKey))
      .toBeNull();
  }

  await input.fill(fearAppealCode.toLowerCase().replaceAll("-", ""));
  await expect(input).toHaveValue(fearAppealCode);
  await page.getByRole("button", { name: "Check code" }).click();
  await expect(page.getByText("S005 is now unlocked on this device.")).toBeVisible();

  const access = await page.evaluate((key) => {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as { cardId: string; caseId: string }) : null;
  }, accessKey);
  expect(access).toMatchObject({ cardId: "fear-appeal", caseId: "S005" });
});

test("does not duplicate Fear Appeal access or its badge", async ({ page }) => {
  await page.goto("/en/redeem");
  const input = page.getByLabel("Event card code");

  await input.fill(fearAppealCode);
  await page.getByRole("button", { name: "Check code" }).click();
  const firstAccess = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    accessKey,
  );

  await input.fill(fearAppealCode);
  await page.getByRole("button", { name: "Check code" }).click();
  await expect(page.getByText(/already unlocked on this device/)).toBeVisible();
  await expect
    .poll(() => page.evaluate((key) => window.localStorage.getItem(key), accessKey))
    .toBe(firstAccess);

  await page.evaluate(() => {
    window.localStorage.setItem("unesco-mil-game:v2:S005:current-step", "3");
  });
  await page.goto("/en/mission/S005");

  await completeSortingModule(page);
  await expect(page).toHaveURL(/\/en\/cases\/S005\/debrief$/);
  await expect(page.getByRole("heading", { name: "Fear Appeal" })).toBeVisible();
  await expect(page.getByAltText("Fear Appeal SIXMA event card")).toHaveAttribute(
    "src",
    "/assets/cards/card-1.svg",
  );
  const firstBadge = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    badgeKey,
  );
  expect(firstBadge).not.toBeNull();

  await page.evaluate(() => {
    window.localStorage.setItem("unesco-mil-game:v2:S005:current-step", "3");
  });
  await page.goto("/en/mission/S005");
  await completeSortingModule(page);

  await expect
    .poll(() => page.evaluate((key) => window.localStorage.getItem(key), badgeKey))
    .toBe(firstBadge);
});

async function completeSortingModule(page: import("@playwright/test").Page) {
  for (const [slot, itemId] of [
    "R005_SORT_01",
    "R005_SORT_02",
    "R005_SORT_03",
    "R005_SORT_04",
  ].entries()) {
    const button = page.getByRole("button").filter({ hasText: itemId }).first();
    await button.waitFor({ state: "visible" });
    await button.click();
    await page.locator(`[data-slot-index="${slot}"]`).click();
  }
  await page.getByRole("button", { name: "Complete investigation" }).click();
}
