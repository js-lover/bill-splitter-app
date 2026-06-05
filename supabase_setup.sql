-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS TABLE (Public profile synced with auth.users)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to sync auth.users to public.users automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. GROUPS TABLE
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  cover_image_url text,
  category text,
  created_by uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. GROUP MEMBERS TABLE
create table public.group_members (
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (group_id, user_id)
);

-- 4. EXPENSES TABLE
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  paid_by uuid references public.users(id) on delete cascade not null,
  amount decimal not null,
  currency text default 'TRY' not null,
  description text not null,
  split_type text not null check (split_type in ('EQUAL', 'PERCENTAGE', 'EXACT')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. EXPENSE PARTICIPANTS TABLE
create table public.expense_participants (
  expense_id uuid references public.expenses(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  exact_amount decimal,
  primary key (expense_id, user_id)
);

-- 6. DEBTS TABLE
create table public.debts (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  debtor_id uuid references public.users(id) on delete cascade not null,
  creditor_id uuid references public.users(id) on delete cascade not null,
  amount decimal not null,
  currency text default 'TRY' not null,
  is_settled boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Ayarları (Şimdilik test için public read/write)
alter table public.users enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_participants enable row level security;
alter table public.debts enable row level security;

create policy "Users are viewable by everyone" on public.users for select using (true);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

create policy "Groups are viewable by everyone" on public.groups for select using (true);
create policy "Anyone can create a group" on public.groups for insert with check (auth.uid() = created_by);

create policy "Group members viewable by everyone" on public.group_members for select using (true);
create policy "Anyone can insert group members" on public.group_members for insert with check (true);

create policy "Expenses viewable by everyone" on public.expenses for select using (true);
create policy "Anyone can insert expenses" on public.expenses for insert with check (true);

create policy "Expense participants viewable by everyone" on public.expense_participants for select using (true);
create policy "Anyone can insert expense participants" on public.expense_participants for insert with check (true);

create policy "Debts viewable by everyone" on public.debts for select using (true);
create policy "Anyone can insert debts" on public.debts for insert with check (true);
create policy "Debtor or creditor can update debt" on public.debts for update using (auth.uid() = debtor_id or auth.uid() = creditor_id);
