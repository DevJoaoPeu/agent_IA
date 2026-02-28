-- specialties
create table if not exists specialties (
  id bigserial primary key,
  name varchar(255) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_active boolean not null default true
);

-- doctors
create table if not exists doctors (
  id bigserial primary key,
  name varchar(255) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_active boolean not null default true
);

-- junction table doctors <-> specialties (many-to-many)
create table if not exists doctors_x_specialties (
  fk_specialty bigint not null,
  fk_doctor bigint not null,
  primary key (fk_specialty, fk_doctor),
  constraint fk_dxs_specialty foreign key (fk_specialty) references specialties(id) on delete cascade,
  constraint fk_dxs_doctor foreign key (fk_doctor) references doctors(id) on delete cascade
);

-- schedule
create table if not exists schedule (
  id bigserial primary key,
  fk_doctor bigint not null,
  fk_specialty bigint not null,
  date date not null,
  hour time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_active boolean not null default true,
  constraint fk_schedule_doctor foreign key (fk_doctor) references doctors(id) on delete restrict,
  constraint fk_schedule_specialty foreign key (fk_specialty) references specialties(id) on delete restrict
);

-- índices (recomendado)
create index if not exists idx_schedule_doctor_date on schedule (fk_doctor, date);
create index if not exists idx_schedule_specialty_date on schedule (fk_specialty, date);

-- opcional: evita duplicar o mesmo horário do mesmo médico na mesma data
create unique index if not exists uq_schedule_doctor_date_hour on schedule (fk_doctor, date, hour);
