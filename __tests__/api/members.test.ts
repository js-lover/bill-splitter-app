import { addMemberByEmail } from '../../src/api/members';
import { supabase } from '../../src/lib/supabase';

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Members API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds a member by email', async () => {
    const mockUser = { id: 'user-456' };
    
    const mockSelectUser = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: mockUser, error: null })
      })
    });
    
    const mockInsertMember = jest.fn().mockResolvedValue({ error: null });

    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'users') return { select: mockSelectUser };
      if (table === 'group_members') return { insert: mockInsertMember };
      return {};
    });

    const result = await addMemberByEmail('group-1', 'test@test.com');
    
    expect(result).toBe(true);
    expect(mockInsertMember).toHaveBeenCalledWith([{ group_id: 'group-1', user_id: 'user-456' }]);
  });

  it('throws error if user not found', async () => {
    const mockSelectUser = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
      })
    });

    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'users') return { select: mockSelectUser };
      return {};
    });

    await expect(addMemberByEmail('group-1', 'notfound@test.com')).rejects.toThrow('Kullanıcı bulunamadı');
  });
});
