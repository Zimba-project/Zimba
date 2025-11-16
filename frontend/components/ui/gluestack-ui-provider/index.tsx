// components/ui/gluestack-ui-provider/index.tsx
import React, { useEffect } from 'react';
import { config } from './config';
import { View, ViewProps } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';
import { useColorScheme } from 'nativewind';
//import { StyledProvider } from '@gluestack-style/react'; 

export type ModeType = 'light' | 'dark' | 'system';
const { StyledProvider } = require('@gluestack-style/react');

export function GluestackUIProvider({
  mode = 'light',
  ...props
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

 return (
    // StyledProvider on ehdottoman pakollinen.
    <StyledProvider config={config}> 
      <View
        style={[
          config[colorScheme!],
          { flex: 1, height: '100%', width: '100%' },
          props.style,
        ]}
      >
        <OverlayProvider>
          <ToastProvider>{props.children}</ToastProvider>
        </OverlayProvider>
      </View>
    </StyledProvider> // Sulje tähän
  );
}