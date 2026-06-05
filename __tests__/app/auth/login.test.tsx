import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Login from '../../../app/(auth)/login';

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: ({ children }: any) => children,
}));

// Mock supabase client
jest.mock('../../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

describe('Login Screen', () => {
  it('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    
    expect(getByPlaceholderText('E-posta Adresi')).toBeTruthy();
    expect(getByPlaceholderText('Şifre')).toBeTruthy();
    expect(getByText('Giriş Yap')).toBeTruthy();
  });

  it('handles input changes', () => {
    const { getByPlaceholderText } = render(<Login />);
    
    const emailInput = getByPlaceholderText('E-posta Adresi');
    fireEvent.changeText(emailInput, 'test@test.com');
    
    expect(emailInput.props.value).toBe('test@test.com');
  });
});
