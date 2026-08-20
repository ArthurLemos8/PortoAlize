import { createFileRoute } from "@tanstack/react-router";
import logo from "../assets/images/logo.png";
import "./index.css";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="home">
      <h1>Bem-vindo ao PortoAlize!</h1>
      <h3>Cadastre estabelecimentos, novos lugares e mostre tudo o que sua região tem a ofercer</h3>
      <img src={logo} alt="Logo" className="logo" />
    </div>
    
  );
}
