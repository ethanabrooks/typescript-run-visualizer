import React, { FC } from "react";
import { Link } from "react-router-dom";

export type Sweep = {
  id: number;
  metadata: Record<string, unknown>;
  params: Map<string, unknown[]>;
};

export const DisplaySweeps: FC<{ sweeps: Sweep[] }> = ({ sweeps }) => {
  return (
    <nav>
      <ul>
        {sweeps.map(({ id, metadata, params }, i) => {
          return (
            <li key={i}>
              <Link to={`/${id}`}>{JSON.stringify(metadata)}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
