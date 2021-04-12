import React, { FC } from "react";
import { Link } from "react-router-dom";

export type Sweep = {
  id: number;
  metadata: Record<string, unknown>;
  params: { key: string; values: unknown[] }[];
};

export const DisplaySweeps: FC<{ sweeps: Sweep[] }> = ({ sweeps }) => {
  return (
    <aside className={"menu"}>
      <ul className={"menu-list"}>
        {sweeps.map(({ id, metadata, params }, i) => {
          return (
            <Link key={i} to={`/${id}`}>
              <li>{JSON.stringify(metadata)}</li>
            </Link>
          );
        })}
      </ul>
    </aside>
  );
};
