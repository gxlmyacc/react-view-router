import React from 'react';
import { Text, View } from 'react-native';
import { useRoute } from 'react-view-router';

export default function DetailsScreen() {
  const route = useRoute();
  return (
    <View accessibilityLabel="Details screen">
      <Text>{`Details: ${route.path}`}</Text>
    </View>
  );
}
