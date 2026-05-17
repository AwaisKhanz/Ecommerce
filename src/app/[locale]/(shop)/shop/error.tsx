'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ErrorState } from '@/components/ui/error-state';

type ShopErrorProps = {
  reset: () => void;
};

function ShopError({ reset }: ShopErrorProps): React.JSX.Element {
  const t = useTranslations('shopListing');

  return (
    <Container size="2xl" className="py-8 lg:py-10">
      <ErrorState
        title={t('errorTitle')}
        description={t('errorDescription')}
        action={
          <Button type="button" variant="secondary" onClick={reset}>
            {t('tryAgain')}
          </Button>
        }
      />
    </Container>
  );
}

export default ShopError;
