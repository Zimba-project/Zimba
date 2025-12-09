import React from 'react';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { textStyle } from './styles';

type ITextProps = React.ComponentProps<'span'> & VariantProps<typeof textStyle>;

const Text = React.forwardRef<React.ComponentRef<'span'>, ITextProps>(
  function Text(
    {
      className,
      isTruncated,
      bold,
      underline,
      strikeThrough,
      size = 'md',
      sub,
      italic,
      highlight,
      style,
      ...props
    }: { className?: string } & ITextProps,
    ref
  ) {
    
    let normalizedStyle: React.CSSProperties | undefined = style as any;
    if (Array.isArray(style)) {
      normalizedStyle = Object.assign({}, ...style.filter(Boolean));
    }

    return (
      <span
        className={textStyle({
          isTruncated: isTruncated as boolean,
          bold: bold as boolean,
          underline: underline as boolean,
          strikeThrough: strikeThrough as boolean,
          size,
          sub: sub as boolean,
          italic: italic as boolean,
          highlight: highlight as boolean,
          class: className,
        })}
        style={normalizedStyle}
        {...props}
        ref={ref}
      />
    );
  }
);

Text.displayName = 'Text';

export { Text };
