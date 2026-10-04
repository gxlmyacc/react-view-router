import React from 'react';
import { View } from 'react-native';
import NativeRouterLink from './NativeRouterLink';

export default function RouteNavigation({ router }) {
  return (
    <View accessibilityLabel="Route examples">
      <NativeRouterLink router={router} to="/">Home</NativeRouterLink>
      <NativeRouterLink router={router} to="/details">Details</NativeRouterLink>
      <NativeRouterLink router={router} to="/portable">
        Optional hydrate fallback
      </NativeRouterLink>
    </View>
  );
}
