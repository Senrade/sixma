import { expect, test } from "@playwright/test";

const accessKey = "sixma-demo-event:v1:access:S005";
const badgeKey = "sixma-demo-event:v1:badge:signal-breaker";

const cardCodes = [
  ["WX7-89S-IDK", "fear-appeal", "Fear Appeal"],
  ["K4M-7QX-2RP", "cognitive-pause", "Cognitive Pause"],
  ["N8V-3HC-6TY", "domain-spoof", "Domain Spoof"],
  ["G5R-W9K-4AZ", "lateral-check", "Lateral Check"],
  ["P2D-8LF-X7M", "fake-news", "Fake News"],
  ["T6Y-C3N-9QH", "domain-audit", "Domain Audit"],
] as const;

test("keeps S005 locked until an event card is redeemed", async ({ page }) => {
  await page.goto("/en/mission/S005");

  await expect(page.getByRole("heading", { name: "This special case is locked" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Redeem a card" })).toHaveAttribute("href", "/en/redeem");
});

test("rejects invalid input and maps all six demo codes to S005", async ({ page }) => {
  await page.goto("/en/redeem");
  const input = page.getByLabel("Event card code");

  await input.fill("bad-code-9");
  await page.getByRole("button", { name: "Check code" }).click();
  await expect(page.getByText("That code is not part of this event card set.")).toBeVisible();

  for (const [code, cardId, cardName] of cardCodes) {
    await input.fill(code.replaceAll("-", "").toLowerCase());
    await expect(input).toHaveValue(code);
    await page.getByRole("button", { name: "Check code" }).click();
    await expect(page.getByText("S005 is now unlocked on this device.")).toBeVisible();
    await expect(page.getByAltText(`${cardName} SIXMA event card`)).toHaveAttribute(
      "src",
      new RegExp(`/assets/cards/card-[1-6]\\.svg$`),
    );

    const access = await page.evaluate((key) => {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) as { cardId: string; caseId: string } : null;
    }, accessKey);
    expect(access).toMatchObject({ cardId, caseId: "S005" });

    await page.evaluate((key) => window.localStorage.removeItem(key), accessKey);
    await page.reload();
  }
});

test("does not duplicate access or the event badge", async ({ page }) => {
  await page.goto("/en/redeem");
  const input = page.getByLabel("Event card code");

  await input.fill(cardCodes[0][0]);
  await page.getByRole("button", { name: "Check code" }).click();
  const firstAccess = await page.evaluate((key) => window.localStorage.getItem(key), accessKey);

  await input.fill(cardCodes[1][0]);
  await page.getByRole("button", { name: "Check code" }).click();
  await expect(page.getByText(/already unlocked on this device/)).toBeVisible();
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), accessKey)).toBe(firstAccess);

  await page.evaluate(() => {
    window.localStorage.setItem("unesco-mil-game:v2:S005:current-step", "3");
  });
  await page.goto("/en/mission/S005");

  for (const [slot, itemId] of [
    "R005_SORT_01",
    "R005_SORT_02",
    "R005_SORT_03",
    "R005_SORT_04",
  ].entries()) {
    await page.getByRole("button").filter({ hasText: itemId }).first().click();
    await page.locator(`[data-slot-index="${slot}"]`).click();
  }
  await page.getByRole("button", { name: "Complete investigation" }).click();

  await expect(page).toHaveURL(/\/en\/cases\/S005\/debrief$/);
  await expect(page.getByRole("heading", { name: "Signal Breaker" })).toBeVisible();
  const firstBadge = await page.evaluate((key) => window.localStorage.getItem(key), badgeKey);
  expect(firstBadge).not.toBeNull();

  await page.evaluate(() => {
    window.localStorage.setItem("unesco-mil-game:v2:S005:current-step", "3");
  });
  await page.goto("/en/mission/S005");
  for (const [slot, itemId] of [
    "R005_SORT_01",
    "R005_SORT_02",
    "R005_SORT_03",
    "R005_SORT_04",
  ].entries()) {
    await page.getByRole("button").filter({ hasText: itemId }).first().click();
    await page.locator(`[data-slot-index="${slot}"]`).click();
  }
  await page.getByRole("button", { name: "Complete investigation" }).click();

  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), badgeKey)).toBe(firstBadge);
});
