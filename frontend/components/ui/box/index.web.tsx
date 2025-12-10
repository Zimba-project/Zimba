import React from 'react';
import { boxStyle } from './styles';

import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

type IBoxProps = React.ComponentPropsWithoutRef<'div'> &
  VariantProps<typeof boxStyle> & { className?: string };

const Box = React.forwardRef<HTMLDivElement, IBoxProps>(function Box(
  { className, style, ...props },
  ref
) {
  // Normalize React Native style arrays on web.
  let normalizedStyle: React.CSSProperties | undefined = style as any;
  if (Array.isArray(style)) {
    normalizedStyle = Object.assign({}, ...style.filter(Boolean));
  }

  return (
    <div
      ref={ref}
      className={boxStyle({ class: className })}
      style={normalizedStyle}
      {...props}
    />
  );
});

Box.displayName = 'Box';
export { Box };
