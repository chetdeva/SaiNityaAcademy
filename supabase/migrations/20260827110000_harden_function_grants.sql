create or replace function public.prevent_student_session_tamper()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() = old.student_id and auth.uid() <> old.teacher_id then
    if new.teacher_id is distinct from old.teacher_id
      or new.student_id is distinct from old.student_id
      or new.start_at is distinct from old.start_at
      or new.end_at is distinct from old.end_at
      or new.zoom_join_url is distinct from old.zoom_join_url then
      raise exception 'Students may only cancel a session';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    raise exception 'Role cannot be changed';
  end if;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.list_occupied_slots() from public, anon;
grant execute on function public.list_occupied_slots() to authenticated;
