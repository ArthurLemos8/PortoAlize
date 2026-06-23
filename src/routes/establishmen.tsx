import { createFileRoute } from '@tanstack/react-router';
import { EstabelecimentosPage } from '../pages/Content/EstablishmentPage';

export const Route = createFileRoute('/establishmen')({
  component: EstabelecimentosPage,
})

