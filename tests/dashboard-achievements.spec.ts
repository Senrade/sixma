import { expect, test } from "@playwright/test";

const badgeKey = "sixma-demo-event:v1:badge:signal-breaker";

test("dashboard shows progress and achievements without case previews", async ({ page }) => {
  await page.goto("/en/dashboard");
  await page.evaluate(() => {
    window.localStorage.setItem("veritas-case:D001:completed-at", new Date().toISOString());
    window.localStorage.setItem("unesco-mil-game:v2:R001:current-step", "2");
  });
  await page.reload();

  await expect(page.getByRole("heading", { name: "Investigation progress" })).toBeVisible();
  await expect(page.getByText("1 of 5 investigations complete")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Learning achievements" })).toBeVisible();
  await expect(page.getByText("Complete the evidence loop")).toBeVisible();
  await expect(page.getByText("A cry for help from Hurricane Helene")).toHaveCount(0);
  await expect(page.locator("article")).toHaveCount(0);
});

test("achievements separate learning milestones from the card badge collection", async ({ page }) => {
  await page.goto("/en/achievements");

  const learningTab = page.getByRole("tab", { name: "Learning achievements" });
  const badgeTab = page.getByRole("tab", { name: "Badge collection" });
  await expect(learningTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Transfer the method" })).toBeVisible();

  await badgeTab.click();
  await expect(badgeTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Fear Appeal" })).toBeVisible();
  await expect(page.getByAltText("Fear Appeal SIXMA event card")).toHaveAttribute(
    "src",
    "/assets/cards/card-1.svg",
  );
  await expect(page.getByText("0/1 badges collected")).toBeVisible();

  await page.evaluate((key) => {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        badgeId: "signal-breaker",
        caseId: "S005",
        earnedAt: new Date().toISOString(),
      }),
    );
  }, badgeKey);
  await page.reload();
  await page.getByRole("tab", { name: "Badge collection" }).click();
  await expect(page.getByText("1/1 badges collected")).toBeVisible();
  await expect(page.getByText("Earned", { exact: true })).toBeVisible();
});
