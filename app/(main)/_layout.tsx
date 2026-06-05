import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Ortak Hesap' }} />
      <Stack.Screen name="create-group" options={{ title: 'Yeni Grup Oluştur' }} />
      <Stack.Screen name="add-expense" options={{ headerShown: false }} />
      <Stack.Screen name="group/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
