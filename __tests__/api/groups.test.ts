import { createGroup, getUserGroups } from '../../src/api/groups';
import { supabase } from '../../src/lib/supabase';

// Mock supabase client
jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('Groups API', () => {
  const mockUser = { id: 'user-123' };
  const mockGroup = { id: 'group-1', name: 'Test Group', created_by: 'user-123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a group and adds the creator as a member', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
    
    const mockInsertGroup = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: mockGroup, error: null })
      })
    });
    
    const mockInsertMember = jest.fn().mockResolvedValue({ error: null });

    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'groups') return { insert: mockInsertGroup };
      if (table === 'group_members') return { insert: mockInsertMember };
      return {};
    });

    const result = await createGroup('Test Group');
    
    expect(result).toEqual(mockGroup);
    expect(mockInsertGroup).toHaveBeenCalledWith([{ name: 'Test Group', description: '', created_by: 'user-123' }]);
    expect(mockInsertMember).toHaveBeenCalledWith([{ group_id: 'group-1', user_id: 'user-123' }]);
  });

  it('throws an error if user is not authenticated', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });
    
    await expect(createGroup('Test Group')).rejects.toThrow('User not authenticated');
  });

  it('fetches user groups', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
    
    const mockEq = jest.fn().mockResolvedValue({ data: [mockGroup], error: null });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const result = await getUserGroups();
    
    expect(result).toEqual([mockGroup]);
    expect(supabase.from).toHaveBeenCalledWith('groups');
    expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('group_members!inner(*)'));
    expect(mockEq).toHaveBeenCalledWith('group_members.user_id', 'user-123');
  });
});
