import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CreateGroup from '../../../app/(main)/create-group';

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));

jest.mock('../../../src/api/groups', () => ({
  createGroup: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

describe('CreateGroup Screen', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<CreateGroup />);

    expect(getByPlaceholderText('Örn: Antalya Tatili')).toBeTruthy();
    expect(getByPlaceholderText('Grup hakkında kısa bir not...')).toBeTruthy();
    expect(getByText('Grubu Oluştur')).toBeTruthy();
  });

  it('updates input fields', () => {
    const { getByPlaceholderText } = render(<CreateGroup />);

    const nameInput = getByPlaceholderText('Örn: Antalya Tatili');
    const descInput = getByPlaceholderText('Grup hakkında kısa bir not...');

    fireEvent.changeText(nameInput, 'Tatil Ekibi');
    fireEvent.changeText(descInput, 'Antalya tatil masrafları');

    expect(nameInput.props.value).toBe('Tatil Ekibi');
    expect(descInput.props.value).toBe('Antalya tatil masrafları');
  });
});
