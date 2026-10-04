import React from 'react';
import { Text, View } from 'react-native';
import { useRoute } from 'react-view-router';

export default function HomeScreen() {
  const route = useRoute();
  return (
    <View accessibilityLabel="Home screen">
      <Text>{`Home: ${route.path}`}</Text>
    </View>
  );
}
