import React from "react";

const TableHeader = () => {
  return (
    <thead>
      <tr className="border-b border-gray-800">
        <th className="text-left">Nom</th>
        <th className="text-left">Prénom</th>
        <th className="text-left">Poste</th>
        <th className="text-left">Date soumission</th>
        <th className="text-left">Statut</th>
        <th className="text-right">Actions</th>
      </tr>
    </thead>
  );
};

export default TableHeader;
