import type { Metadata } from "next";
import { Users, Wallet, Rocket, Mail } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Programa de Afiliados",
  description: "Gana 50% del primer pago de cada cliente que refieras a Kelsira.",
};

const steps = [
  {
    icon: Rocket,
    title: "1. Postula",
    body: "Escríbenos con tu nombre y dónde vas a compartir Kelsira (redes, comunidad, agencia, etc.). Revisamos cada postulación a mano mientras el programa está recién empezando.",
  },
  {
    icon: Users,
    title: "2. Comparte",
    body: "Te damos un enlace o código único para que tus referidos lo mencionen al registrarse. Cualquier e-commerce que se suscriba a un plan pago (Growth o Enterprise) gracias a ti cuenta como tu referido.",
  },
  {
    icon: Wallet,
    title: "3. Gana",
    body: "Recibes 50% del primer pago que haga ese cliente. Es un pago único por referido, no recurrente — así el programa es sostenible para nosotros y muy atractivo para ti desde el día uno.",
  },
];

export default function AfiliadosPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-grid">
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="inline-flex items-center rounded-full border border-cobalt/30 bg-cobalt/10 px-3 py-1 text-xs font-medium text-cobalt">
            Programa de Afiliados
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Gana 50% por cada cliente que refieras
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Kelsira paga el 50% del primer pago de cualquier negocio que se suscriba a un plan
            Growth o Enterprise por tu recomendación. Sin mínimos, sin letra chica.
          </p>
          <a
            href="mailto:hola@kelsira.app?subject=Quiero%20ser%20afiliado%20de%20Kelsira&body=Hola%2C%20quiero%20postular%20al%20programa%20de%20afiliados.%0A%0ANombre%3A%0AD%C3%B3nde%20voy%20a%20compartir%20Kelsira%3A"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cobalt px-6 py-3.5 text-base font-medium text-white shadow-[0_0_0_1px_rgba(79,124,255,0.4),0_8px_24px_-8px_rgba(79,124,255,0.5)] transition-all hover:bg-cobalt-dim"
          >
            <Mail size={17} />
            Postular por correo
          </a>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <Card key={step.title} className="p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cobalt/15 text-cobalt">
                  <step.icon size={18} />
                </span>
                <h3 className="mt-4 font-medium">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{step.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <Card className="p-8">
            <h2 className="text-lg font-medium">Preguntas frecuentes</h2>
            <div className="mt-6 flex flex-col gap-6">
              <div>
                <p className="font-medium">¿Sobre qué se calcula el 50%?</p>
                <p className="mt-1 text-sm text-muted">
                  Sobre el primer pago que realiza el negocio referido al suscribirse a un plan
                  Growth ($79/mes) o Enterprise ($199/mes). Es un pago único, no se repite los
                  meses siguientes. El plan Starter es gratuito, así que no genera comisión.
                </p>
              </div>
              <div>
                <p className="font-medium">¿Cómo y cuándo me pagan?</p>
                <p className="mt-1 text-sm text-muted">
                  Te contactamos directamente para coordinar el pago una vez que tu referido
                  complete su primer pago exitoso. Estamos empezando el programa, así que hoy el
                  seguimiento es manual; a medida que crezca, pasaremos a un sistema de enlaces
                  de referido con seguimiento automático.
                </p>
              </div>
              <div>
                <p className="font-medium">¿Hay límite de referidos?</p>
                <p className="mt-1 text-sm text-muted">
                  No. Puedes referir tantos negocios como quieras y ganas 50% del primer pago de
                  cada uno.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
