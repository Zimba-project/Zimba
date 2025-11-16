// components/ui/gluestack-ui-provider/index.tsx
import React, { useEffect } from 'react';
import { config } from './config';
import { View, ViewProps } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';
import { useColorScheme } from 'nativewind';
// TÄMÄ ON TÄRKEÄ! Oikean providerin tuonti (asenna, jos ei ole)
import { StyledProvider } from '@gluestack-style/react'; 

export type ModeType = 'light' | 'dark' | 'system';

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
    // KIETOA TÄHÄN StyledProvideriin, joka saa configin
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
    </StyledProvider> // SULJE TÄHÄN
  );
}