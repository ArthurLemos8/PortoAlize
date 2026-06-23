import { createFileRoute } from '@tanstack/react-router';
import { CidadesPage } from '../pages/Content/CityPage';

export const Route = createFileRoute('/city')({
  component: CidadesPage,
})


