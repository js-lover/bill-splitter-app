import { calculateGroupDebts, settleDebt } from '../../src/api/debts';
import { supabase } from '../../src/lib/supabase';

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockUsersData = [
  { id: 'u1', full_name: 'Ali', email: 'ali@test.com' },
  { id: 'u2', full_name: 'Ayşe', email: 'ayse@test.com' },
  { id: 'u3', full_name: 'Mehmet', email: 'mehmet@test.com' },
];

function makeUsersMock() {
  return {
    select: jest.fn().mockReturnValue({
      in: jest.fn().mockResolvedValue({ data: mockUsersData, error: null })
    })
  };
}

describe('Debts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates simplified debts correctly', async () => {
    // A paid 300 for A, B, C (each owes 100).
    // So B owes A 100, C owes A 100.
    const mockExpenses = [
      {
        id: 'e1', amount: 300, paid_by: 'u1',
        expense_participants: [
          { user_id: 'u1', exact_amount: 100 },
          { user_id: 'u2', exact_amount: 100 },
          { user_id: 'u3', exact_amount: 100 },
        ]
      }
    ];

    const mockSelectExp = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: mockExpenses, error: null })
    });

    const mockSelectDebts = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      })
    });

    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'expenses') return { select: mockSelectExp };
      if (table === 'debts') return { select: mockSelectDebts };
      if (table === 'users') return makeUsersMock();
      return {};
    });

    const debts = await calculateGroupDebts('g1');

    expect(debts).toHaveLength(2);
    expect(debts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ debtor_id: 'u2', creditor_id: 'u1', amount: 100 }),
        expect.objectContaining({ debtor_id: 'u3', creditor_id: 'u1', amount: 100 })
      ])
    );
  });

  it('adjusts for settled debts correctly', async () => {
    // Same scenario, but B already paid A 50.
    const mockExpenses = [
      {
        id: 'e1', amount: 300, paid_by: 'u1',
        expense_participants: [
          { user_id: 'u1', exact_amount: 100 },
          { user_id: 'u2', exact_amount: 100 },
          { user_id: 'u3', exact_amount: 100 },
        ]
      }
    ];

    const mockSettledDebts = [
      { debtor_id: 'u2', creditor_id: 'u1', amount: 50 }
    ];

    const mockSelectExp = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: mockExpenses, error: null })
    });

    const mockSelectDebts = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockSettledDebts, error: null })
      })
    });

    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'expenses') return { select: mockSelectExp };
      if (table === 'debts') return { select: mockSelectDebts };
      if (table === 'users') return makeUsersMock();
      return {};
    });

    const debts = await calculateGroupDebts('g1');

    // B should only owe A 50 now.
    expect(debts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ debtor_id: 'u2', creditor_id: 'u1', amount: 50 }),
        expect.objectContaining({ debtor_id: 'u3', creditor_id: 'u1', amount: 100 })
      ])
    );
  });
});
