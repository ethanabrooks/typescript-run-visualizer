import React from "react";

// import TodoInput from "./TodoInput";
import Sweep from "./TodoPublicList";

export default function SweepWrapper() {
  return (
    <div className="todoWrapper">
      <div className="sectionHeader">Public feed (realtime)</div>

      {/*<TodoInput isPublic />*/}
      <Sweep sweepId={1} />
    </div>
  );
}
