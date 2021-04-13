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
        {sweeps
          .sort(({ id: id1 }, { id: id2 }) => id1 - id2)
          .reverse()
          .map(({ id, metadata, params }, i) => {
            const copy = JSON.parse(JSON.stringify(metadata));
            if (copy != null && copy.charts != undefined) delete copy.charts;
            return (
              <Link key={i} to={`/${id}`}>
                <li>
                  {id}
                  <pre>{JSON.stringify(copy, null, 2)}</pre>
                </li>
              </Link>
            );
          })}
      </ul>
    </aside>
  );
};
