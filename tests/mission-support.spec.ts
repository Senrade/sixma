import { expect, test } from "@playwright/test";

test("keeps the demo guided and collapses repeated instructions later", async ({ page }) => {
  await page.goto("/en/mission/D001");

  await expect(page.getByText("Drag from one edge of a suspicious area")).toBeVisible();
  await expect(page.getByRole("button", { name: "Hide steps" })).toBeVisible();

  await page.goto("/en/mission/R001");

  await expect(page.getByRole("button", { name: "Show steps" })).toBeVisible();
  await expect(page.getByText("Drag from one edge of a suspicious area")).toBeHidden();
});

test("offers progressive image hints after repeated misses", async ({ page }) => {
  await page.goto("/en/mission/D001");

  const evidence = page.getByLabel(
    "Forensic evidence image. Drag across or click a suspicious area.",
  );
  await evidence.click({ position: { x: 8, y: 8 } });
  await expect(page.getByText(/That mark does not overlap/)).toBeVisible();

  const bounds = await evidence.boundingBox();
  if (!bounds) throw new Error("Evidence image did not render");
  await evidence.click({ position: { x: 8, y: bounds.height - 8 } });

  const hintButton = page.getByRole("button", { name: "Need a hint?" });
  await expect(hintButton).toBeVisible();
  await hintButton.click();
  await expect(page.getByText(/Compare text, repeated shapes, lighting/)).toBeVisible();

  await page.getByRole("button", { name: "Show a stronger hint" }).click();
  await expect(page.getByText(/Narrow your search to the upper-center area/)).toBeVisible();
});

test("offers causal ordering help after an incorrect sequence", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("unesco-mil-game:v2:R001:current-step", "3");
  });
  await page.goto("/en/mission/R001");

  for (const [slot, itemId] of ["R001_SORT_01", "R001_SORT_02", "R001_SORT_03"].entries()) {
    await page.getByRole("button").filter({ hasText: itemId }).first().click();
    await page.locator(`[data-slot-index="${slot}"]`).click();
  }

  const hintButton = page.getByRole("button", { name: "Need a hint?" });
  await expect(hintButton).toBeVisible();
  await hintButton.click();
  await expect(page.getByText(/Separate what creates attention/)).toBeVisible();
});
