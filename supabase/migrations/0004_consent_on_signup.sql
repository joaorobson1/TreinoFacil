-- ---------------------------------------------------------------------------
-- 0004 — Persiste o consentimento (LGPD) no cadastro
-- ---------------------------------------------------------------------------
-- A linha em public.users é criada pelo trigger de auth.users, então o aceite
-- dos termos e o consentimento de dados de saúde chegam pelos metadados do
-- signUp e são copiados aqui. Sem isso não há prova de consentimento — que a
-- LGPD (art. 11, I) exige ser específico e destacado para dados sensíveis.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, name, email, whatsapp, terms_accepted_at, health_consent_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'whatsapp',
    (new.raw_user_meta_data->>'terms_accepted_at')::timestamptz,
    (new.raw_user_meta_data->>'health_consent_at')::timestamptz
  );
  insert into public.profiles (user_id) values (new.id);
  insert into public.user_stats (user_id) values (new.id);
  return new;
end;
$$;
