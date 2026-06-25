import { createFileRoute } from '@tanstack/react-router';
import { EstablishmentPage } from '../pages/Establishment';

export const Route = createFileRoute('/establishmen')({
  component: EstablishmentPage,
})

