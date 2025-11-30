import React, { useEffect } from 'react';
import { config } from './config';
import { View, ViewProps } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';
import { useColorScheme } from 'nativewind';
import { GluestackUIProvider as StyledProvider } from '@gluestack-ui/themed';
export type ModeType = 'light' | 'dark' | 'system';

export function GluestackUIProvider({
  mode = 'light',
  ...props
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Use mode prop directly to apply config variables
  const activeMode = mode === 'system' ? 'light' : mode;

  return (
    <View
      style={[
        config[activeMode],
        { flex: 1, height: '100%', width: '100%' },
        props.style,
      ]}
    >
      <StyledProvider colorMode={mode}>
        <OverlayProvider>
          <ToastProvider>{props.children}</ToastProvider>
        </OverlayProvider>
      </StyledProvider>
    </View>
  );
}
