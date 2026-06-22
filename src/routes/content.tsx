import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "../pages/Content";

export const Route = createFileRoute("/content")({
  component: ContentPage,
});
