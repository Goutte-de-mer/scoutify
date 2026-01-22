import React from "react";

const CardNumber = ({
  number,
  title,
  type,
}: {
  number: number;
  title: string;
  type: "processed" | "pending" | "total";
}) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-zinc-900 p-6">
      <p className="mb-1 text-sm text-gray-400">{title}</p>
      <p
        className={`text-3xl font-bold ${
          type === "processed"
            ? "text-green-500"
            : type === "pending"
              ? "text-primary"
              : "text-white"
        }`}
      >
        {number}
      </p>
    </div>
  );
};

export default CardNumber;
