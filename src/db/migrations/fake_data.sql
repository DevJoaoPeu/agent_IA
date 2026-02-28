-- script para gerar dados falsos para teste, os ids podem variar

-- specialties
insert into specialties (name)
values 
  ('cardiologia'),
  ('psiquiatria'),
  ('dermatologia');

-- doctors
insert into doctors (name)
values
  ('dr. joão silva'),
  ('dra. maria souza'),
  ('dr. carlos lima');

-- relacionamento doctors x specialties
insert into doctors_x_specialties (fk_specialty, fk_doctor)
values
  (4, 4), -- dr joão -> cardiologia
  (5, 5), -- dra maria -> psiquiatria
  (6, 6), -- dr carlos -> dermatologia
  (4, 6); -- dr carlos também atende cardiologia

-- schedule
insert into schedule (fk_doctor, fk_specialty, date, hour)
values
  (4, 4, '2026-03-10', '09:00'),
  (4, 4, '2026-03-10', '10:00'),
  (5, 5, '2026-03-11', '14:00'),
  (6, 6, '2026-03-12', '16:00'),
  (6, 6, '2026-03-13', '11:00');

-- selects
select * from doctors;
select * from specialties;
select * from doctors_x_specialties;
select * from schedule;