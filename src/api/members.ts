import { supabase } from '../lib/supabase';

export const addMemberByEmail = async (groupId: string, email: string) => {
  // 1. Find user by email in the public.users table
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (userError || !users) {
    throw new Error('Kullanıcı bulunamadı');
  }

  // 2. Add to group_members
  const { error: memberError } = await supabase
    .from('group_members')
    .insert([{ group_id: groupId, user_id: users.id }]);

  if (memberError) {
    if (memberError.code === '23505') {
      throw new Error('Kullanıcı zaten bu grupta');
    }
    throw memberError;
  }

  return true;
};

export const getGroupMembers = async (groupId: string) => {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      user_id,
      users (
        id,
        full_name,
        email
      )
    `)
    .eq('group_id', groupId);

  if (error) throw error;
  
  // Flatten the result
  return data.map(item => item.users);
};
