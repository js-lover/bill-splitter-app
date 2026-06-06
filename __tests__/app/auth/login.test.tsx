import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Login from '../../../app/(auth)/login';

jest.mock('expo-router', () => ({
  Link: ({ children }: any) => children,
}));

jest.mock('../../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

describe('Login Screen', () => {
  it('renders login form correctly', () => {
    const { getByPlaceholderText, getAllByText } = render(<Login />);

    expect(getByPlaceholderText('ornek@mail.com')).toBeTruthy();
    expect(getByPlaceholderText('••••••••')).toBeTruthy();
    expect(getAllByText('Giriş Yap').length).toBeGreaterThan(0);
  });

  it('handles input changes', () => {
    const { getByPlaceholderText } = render(<Login />);

    const emailInput = getByPlaceholderText('ornek@mail.com');
    fireEvent.changeText(emailInput, 'test@test.com');

    expect(emailInput.props.value).toBe('test@test.com');
  });
});
