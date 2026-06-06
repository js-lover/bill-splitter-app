import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create-group" />
      <Stack.Screen name="add-expense" />
      <Stack.Screen name="group/[id]" />
    </Stack>
  );
}
