-- Run once in your Supabase SQL Editor. Does not modify other application tables.
begin;
create table if not exists public.little_home_spaces (
 id uuid primary key default gen_random_uuid(), token_hash text unique not null, created_at timestamptz not null default now()
);
create sequence if not exists public.little_home_revision;
create table if not exists public.little_home_items (
 space_id uuid not null references public.little_home_spaces(id) on delete cascade,
 collection text not null check(collection in ('messages','tasks','meals','history')),
 id uuid not null, value jsonb not null default '{}', deleted boolean not null default false,
 revision bigint not null default nextval('public.little_home_revision'), primary key(space_id,collection,id)
);
create table if not exists public.little_home_operations (
 space_id uuid not null references public.little_home_spaces(id) on delete cascade,
 operation_id uuid not null, primary key(space_id,operation_id)
);
alter table public.little_home_spaces enable row level security;
alter table public.little_home_items enable row level security;
alter table public.little_home_operations enable row level security;
revoke all on public.little_home_spaces,public.little_home_items,public.little_home_operations from anon,authenticated;
revoke all on sequence public.little_home_revision from anon,authenticated;
create or replace function public.little_home_create(p_token text) returns void
language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Invalid token'; end if;
 insert into public.little_home_spaces(token_hash) values(encode(sha256(convert_to(p_token,'UTF8')),'hex')) on conflict do nothing;
end $$;
create or replace function public.little_home_snapshot(p_token text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare sid uuid; result jsonb;
begin
 select id into sid from public.little_home_spaces where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex');
 if sid is null then raise exception 'Invalid invitation'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('collection',collection,'id',id,'value',value,'deleted',deleted,'revision',revision)),'[]'::jsonb) into result from public.little_home_items where space_id=sid;
 return result;
end $$;
create or replace function public.little_home_apply(p_token text,p_collection text,p_id uuid,p_patch jsonb,p_deleted boolean,p_operation uuid) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare sid uuid; item public.little_home_items; allowed text[]; prop text;
begin
 select id into sid from public.little_home_spaces where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex');
 if sid is null then raise exception 'Invalid invitation'; end if;
 if p_collection is null or p_collection not in ('messages','tasks','meals','history') or p_id is null or p_operation is null or p_deleted is null or p_patch is null or jsonb_typeof(p_patch)<>'object' or octet_length(p_patch::text)>12000 then raise exception 'Invalid data'; end if;
 allowed := case p_collection when 'messages' then array['text','author','authorId','createdAt','readBy'] when 'tasks' then array['title','category','done','doneBy','createdAt'] when 'meals' then array['name','type','favorite','createdAt'] else array['name','mealId','type','date','createdAt'] end;
 for prop in select jsonb_object_keys(p_patch) loop
  if not prop=any(allowed) then raise exception 'Invalid field'; end if;
  if prop in ('done','favorite') then
   if jsonb_typeof(p_patch->prop)<>'boolean' then raise exception 'Invalid boolean'; end if;
  elsif prop='readBy' then
   if jsonb_typeof(p_patch->prop)<>'object' then raise exception 'Invalid read receipts'; end if;
  elsif jsonb_typeof(p_patch->prop)<>'string' or length(p_patch->>prop)>500 then raise exception 'Invalid text'; end if;
 end loop;
 -- Serialize edits per household. Retries are idempotent, deletion is permanent for an item ID.
 perform 1 from public.little_home_spaces where id=sid for update;
 if not exists(select 1 from public.little_home_operations where space_id=sid and operation_id=p_operation) then
  select * into item from public.little_home_items where space_id=sid and collection=p_collection and id=p_id;
  if p_collection='messages' and p_patch ? 'readBy' then p_patch=jsonb_set(p_patch,'{readBy}',coalesce(item.value->'readBy','{}'::jsonb)||(p_patch->'readBy')); end if;
  insert into public.little_home_items(space_id,collection,id,value,deleted) values(sid,p_collection,p_id,coalesce(item.value,'{}'::jsonb)||p_patch,coalesce(item.deleted,false) or p_deleted)
  on conflict(space_id,collection,id) do update set value=excluded.value,deleted=excluded.deleted,revision=nextval('public.little_home_revision');
  insert into public.little_home_operations values(sid,p_operation);
 end if;
 select * into item from public.little_home_items where space_id=sid and collection=p_collection and id=p_id;
 return jsonb_build_object('collection',item.collection,'id',item.id,'value',item.value,'deleted',item.deleted,'revision',item.revision);
end $$;
revoke all on function public.little_home_create(text),public.little_home_snapshot(text),public.little_home_apply(text,text,uuid,jsonb,boolean,uuid) from public;
grant execute on function public.little_home_create(text),public.little_home_snapshot(text),public.little_home_apply(text,text,uuid,jsonb,boolean,uuid) to anon,authenticated;
commit;
