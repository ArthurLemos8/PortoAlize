import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div style={{ padding: "10px" }}>
      <h3>Bem-vindo à Home!</h3>
    </div>
  );
}
