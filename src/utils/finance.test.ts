import { expect, test, describe } from "vitest";
import {
  addDeposit,
  calculateInterest,
  calculateGoalProgress,
} from "./finance";

describe("Finance Logic", () => {
  test("addDeposit adds money correctly", () => {
    expect(addDeposit(100, 50)).toBe(150);
  });

  test("calculateInterest computes correct 5% interest", () => {
    expect(calculateInterest(100, 5)).toBe(5);
  });

  test("calculateGoalProgress caps at 100%", () => {
    expect(calculateGoalProgress(150, 100)).toBe(100);
    expect(calculateGoalProgress(50, 100)).toBe(50);
  });
});
