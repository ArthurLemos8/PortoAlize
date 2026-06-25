import { createFileRoute } from '@tanstack/react-router';
import { CityPage } from '../pages/City/CityPage';

export const Route = createFileRoute('/city')({
  component: CityPage,
})


