BEGIN;
CREATE TABLE sweep (
  ID serial primary key,
  GridIndex int,
  Metadata jsonb
);

CREATE TABLE run (
  ID serial primary key,
  SweepID int references sweep(id),
  Metadata jsonb
);

CREATE TABLE sweep_parameters (
  SweepID integer not null references sweep(ID),
  Key text not null,
  Parameters jsonb[] not null,
  unique (SweepID, Key)
);

CREATE TABLE run_log (
  ID serial primary key,
  RunId int not null references run(id),
  Log jsonb not null
);
COMMIT;
