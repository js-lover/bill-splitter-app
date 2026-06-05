import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CreateGroup from '../../../app/(main)/create-group';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

// Mock API
jest.mock('../../../src/api/groups', () => ({
  createGroup: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
}));

describe('CreateGroup Screen', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<CreateGroup />);
    
    expect(getByPlaceholderText('Örn: Ev Arkadaşları')).toBeTruthy();
    expect(getByPlaceholderText('Grup hakkında kısa bilgi')).toBeTruthy();
    expect(getByText('Oluştur')).toBeTruthy();
  });

  it('updates input fields', () => {
    const { getByPlaceholderText } = render(<CreateGroup />);
    
    const nameInput = getByPlaceholderText('Örn: Ev Arkadaşları');
    const descInput = getByPlaceholderText('Grup hakkında kısa bilgi');
    
    fireEvent.changeText(nameInput, 'Tatil Ekibi');
    fireEvent.changeText(descInput, 'Antalya tatil masrafları');
    
    expect(nameInput.props.value).toBe('Tatil Ekibi');
    expect(descInput.props.value).toBe('Antalya tatil masrafları');
  });
});
