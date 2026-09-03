import { createFileRoute } from "@tanstack/react-router";
import { SubCategoryPage } from "../pages/SubCategory/SubCategoryPage";

export const Route = createFileRoute("/subCategory")({
  component: SubCategoryPage,
});
