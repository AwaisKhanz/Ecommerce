import * as React from 'react';

import { cn } from '@/lib/utils';

function Section({ className, ...props }: React.ComponentProps<'section'>): React.JSX.Element {
  return <section data-slot="section" className={cn('py-12 lg:py-20', className)} {...props} />;
}

export { Section };
