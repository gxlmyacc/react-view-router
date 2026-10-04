import React from 'react';
import { Pressable, Text } from 'react-native';

export default function NativeRouterLink({ router, to, children }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(to)}>
      <Text>{children}</Text>
    </Pressable>
  );
}
