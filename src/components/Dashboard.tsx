import React from "react";
import { useFinance } from "../context/FinanceContext";
import { Wallet } from "lucide-react";

export const Dashboard = () => {
  const { balance } = useFinance();

  return (
    <div className="bg-white/40 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-10 w-full max-w-md mx-auto my-8 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <Wallet size={120} />
      </div>
      <h1 className="text-xl font-medium text-gray-500 mb-2 relative z-10">
        Total Balance
      </h1>
      <h2
        className={`text-6xl font-semibold tracking-tight relative z-10 ${balance >= 0 ? "text-gray-900" : "text-red-600"}`}
      >
        ${balance.toLocaleString()}
      </h2>
    </div>
  );
};
