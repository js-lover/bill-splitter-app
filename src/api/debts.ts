import { supabase } from '../lib/supabase';

export type SimplifiedDebt = {
  debtor_id: string;
  creditor_id: string;
  amount: number;
};

export const calculateGroupDebts = async (groupId: string): Promise<SimplifiedDebt[]> => {
  // 1. Fetch all expenses
  const { data: expenses, error: exError } = await supabase
    .from('expenses')
    .select(`
      id, amount, paid_by,
      expense_participants ( user_id, exact_amount )
    `)
    .eq('group_id', groupId);

  if (exError) throw exError;

  // 2. Fetch settled debts to adjust balances (if A paid B back)
  const { data: settledDebts, error: dError } = await supabase
    .from('debts')
    .select('debtor_id, creditor_id, amount')
    .eq('group_id', groupId)
    .eq('is_settled', true);

  if (dError) throw dError;

  // 3. Calculate net balances
  const balances = new Map<string, number>();

  const addBalance = (userId: string, amount: number) => {
    balances.set(userId, (balances.get(userId) || 0) + amount);
  };

  // Add expenses
  expenses.forEach(ex => {
    addBalance(ex.paid_by, ex.amount);
    ex.expense_participants.forEach((p: any) => {
      addBalance(p.user_id, -p.exact_amount);
    });
  });

  // Add settled debts (debtor paid creditor, so debtor gets +amount, creditor gets -amount)
  settledDebts.forEach(d => {
    addBalance(d.debtor_id, d.amount);
    addBalance(d.creditor_id, -d.amount);
  });

  // 4. Separate into debtors and creditors
  let debtors: { id: string; amount: number }[] = [];
  let creditors: { id: string; amount: number }[] = [];

  balances.forEach((balance, id) => {
    if (balance > 0.01) creditors.push({ id, amount: balance });
    else if (balance < -0.01) debtors.push({ id, amount: Math.abs(balance) });
  });

  // Sort them to optimize greedy matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  // 5. Simplify
  const simplified: SimplifiedDebt[] = [];
  let i = 0; // debtors index
  let j = 0; // creditors index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    const settleAmount = Math.min(debtor.amount, creditor.amount);
    
    if (settleAmount > 0.01) {
      simplified.push({
        debtor_id: debtor.id,
        creditor_id: creditor.id,
        amount: parseFloat(settleAmount.toFixed(2))
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  // 6. Fetch user names
  const userIds = Array.from(balances.keys());
  const { data: usersData } = await supabase
    .from('users')
    .select('id, full_name, email')
    .in('id', userIds);

  const userMap = new Map();
  usersData?.forEach(u => userMap.set(u.id, u));

  return simplified.map(d => ({
    ...d,
    debtor_name: userMap.get(d.debtor_id)?.full_name || userMap.get(d.debtor_id)?.email || 'Bilinmeyen',
    creditor_name: userMap.get(d.creditor_id)?.full_name || userMap.get(d.creditor_id)?.email || 'Bilinmeyen'
  }));
};

export const settleDebt = async (groupId: string, debtorId: string, creditorId: string, amount: number) => {
  const { error } = await supabase
    .from('debts')
    .insert([{
      group_id: groupId,
      debtor_id: debtorId,
      creditor_id: creditorId,
      amount: amount,
      is_settled: true
    }]);

  if (error) throw error;
  return true;
};
