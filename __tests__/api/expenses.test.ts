import { addExpense } from '../../src/api/expenses';
import { supabase } from '../../src/lib/supabase';

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Expenses API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws error if no participants', async () => {
    await expect(addExpense('g1', 'u1', 100, 'Test', 'EQUAL', [])).rejects.toThrow('En az bir katılımcı seçmelisiniz.');
  });

  it('validates percentage sum', async () => {
    const participants = [
      { user_id: 'u1', value: 50 },
      { user_id: 'u2', value: 40 } // Sum = 90
    ];
    await expect(addExpense('g1', 'u1', 100, 'Test', 'PERCENTAGE', participants)).rejects.toThrow('Yüzdelerin toplamı 100 olmalıdır.');
  });

  it('validates exact amounts sum', async () => {
    const participants = [
      { user_id: 'u1', value: 60 },
      { user_id: 'u2', value: 30 } // Sum = 90, total = 100
    ];
    await expect(addExpense('g1', 'u1', 100, 'Test', 'EXACT', participants)).rejects.toThrow('Girilen tutarların toplamı toplam masrafa eşit olmalıdır.');
  });

  it('adds equal split expense', async () => {
    const mockExpense = { id: 'exp1' };
    
    const mockInsertExpense = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: mockExpense, error: null })
      })
    });
    const mockInsertParticipants = jest.fn().mockResolvedValue({ error: null });

    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'expenses') return { insert: mockInsertExpense };
      if (table === 'expense_participants') return { insert: mockInsertParticipants };
      return {};
    });

    const participants = [
      { user_id: 'u1' },
      { user_id: 'u2' }
    ];

    const result = await addExpense('g1', 'u1', 100, 'Dinner', 'EQUAL', participants);
    
    expect(result).toEqual(mockExpense);
    expect(mockInsertExpense).toHaveBeenCalledWith([{
      group_id: 'g1',
      paid_by: 'u1',
      amount: 100,
      description: 'Dinner',
      split_type: 'EQUAL'
    }]);

    expect(mockInsertParticipants).toHaveBeenCalledWith([
      { expense_id: 'exp1', user_id: 'u1', exact_amount: 50 },
      { expense_id: 'exp1', user_id: 'u2', exact_amount: 50 }
    ]);
  });
});
