BEGIN;
CREATE TABLE sweep (
  id serial primary key,
  grid_index int,
  metadata JSONB
);

CREATE TABLE run (
  id serial primary key,
  sweep_id int references sweep(id),
  metadata JSONB
);

CREATE TABLE parameter_choice (
  sweep_id integer not null references sweep(id),
  key text not null,
  choice jsonb[] not null,
  unique (sweep_id, key)
);

CREATE TABLE run_log (
  id serial primary key,
  run_id int not null references run(id),
  log JSONB not null
);

CREATE TABLE chart (
  id serial primary key,
  run_id int references run(id),
  sweep_id int references sweep(id),
  spec JSONB not null
);

CREATE TABLE image (
  id serial primary key,
  run_id int references run(id),
  sweep_id int references sweep(id),
  rgb float[][][] not null
);
COMMIT;
