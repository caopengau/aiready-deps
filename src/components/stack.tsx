import * as React from 'react';
import { cn } from '../utils/cn';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      direction = 'vertical',
      spacing = 'md',
      align = 'stretch',
      justify = 'start',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          {
            'flex-col': direction === 'vertical',
            'flex-row': direction === 'horizontal',
          },
          {
            'gap-1': spacing === 'xs',
            'gap-2': spacing === 'sm',
            'gap-4': spacing === 'md',
            'gap-6': spacing === 'lg',
            'gap-8': spacing === 'xl',
          },
          {
            'items-start': align === 'start',
            'items-center': align === 'center',
            'items-end': align === 'end',
            'items-stretch': align === 'stretch',
          },
          {
            'justify-start': justify === 'start',
            'justify-center': justify === 'center',
            'justify-end': justify === 'end',
            'justify-between': justify === 'between',
            'justify-around': justify === 'around',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Stack.displayName = 'Stack';

export { Stack };