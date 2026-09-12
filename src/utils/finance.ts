export function addDeposit(
  currentBalance: number,
  depositAmount: number,
): number {
  if (depositAmount <= 0) throw new Error("Deposit must be positive");
  return currentBalance + depositAmount;
}

export function calculateInterest(balance: number, rate: number): number {
  return balance * (rate / 100);
}

export function calculateGoalProgress(
  currentAmount: number,
  targetAmount: number,
): number {
  if (targetAmount <= 0) return 0;
  return Math.min((currentAmount / targetAmount) * 100, 100);
}
