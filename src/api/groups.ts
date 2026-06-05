import { supabase } from '../lib/supabase';

export type Group = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by: string;
};

export const createGroup = async (name: string, description: string = '') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: group, error } = await supabase
    .from('groups')
    .insert([{ name, description, created_by: user.id }])
    .select()
    .single();

  if (error) throw error;

  // Add the creator as a member
  const { error: memberError } = await supabase
    .from('group_members')
    .insert([{ group_id: group.id, user_id: user.id }]);

  if (memberError) throw memberError;

  return group as Group;
};

export const getUserGroups = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      group_members!inner(*)
    `)
    .eq('group_members.user_id', user.id);

  if (error) throw error;
  return data as Group[];
};
