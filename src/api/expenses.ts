import { supabase } from '../lib/supabase';

export type SplitType = 'EQUAL' | 'PERCENTAGE' | 'EXACT';

export type ParticipantSplit = {
  user_id: string;
  value?: number; // percentage or exact amount (not needed for EQUAL)
};

export const addExpense = async (
  groupId: string,
  paidBy: string,
  amount: number,
  description: string,
  splitType: SplitType,
  participants: ParticipantSplit[]
) => {
  if (participants.length === 0) throw new Error('En az bir katılımcı seçmelisiniz.');

  // Calculate exact amounts for each participant based on splitType
  const exactAmounts = new Map<string, number>();

  if (splitType === 'EQUAL') {
    const splitAmount = parseFloat((amount / participants.length).toFixed(2));
    participants.forEach(p => exactAmounts.set(p.user_id, splitAmount));
  } else if (splitType === 'PERCENTAGE') {
    let totalPercentage = 0;
    participants.forEach(p => {
      const val = p.value || 0;
      totalPercentage += val;
      exactAmounts.set(p.user_id, parseFloat(((amount * val) / 100).toFixed(2)));
    });
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error('Yüzdelerin toplamı 100 olmalıdır.');
    }
  } else if (splitType === 'EXACT') {
    let totalExact = 0;
    participants.forEach(p => {
      const val = p.value || 0;
      totalExact += val;
      exactAmounts.set(p.user_id, parseFloat(val.toFixed(2)));
    });
    if (Math.abs(totalExact - amount) > 0.01) {
      throw new Error('Girilen tutarların toplamı toplam masrafa eşit olmalıdır.');
    }
  }

  // 1. Insert into expenses
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert([{
      group_id: groupId,
      paid_by: paidBy,
      amount,
      description,
      split_type: splitType
    }])
    .select()
    .single();

  if (expenseError) throw expenseError;

  // 2. Insert into expense_participants
  const participantsData = participants.map(p => ({
    expense_id: expense.id,
    user_id: p.user_id,
    exact_amount: exactAmounts.get(p.user_id)
  }));

  const { error: partError } = await supabase
    .from('expense_participants')
    .insert(participantsData);

  if (partError) throw partError;

  // Note: DEBTS calculation will run after this or via a trigger.
  // For the MVP, we just save the expense and participants.

  return expense;
};
