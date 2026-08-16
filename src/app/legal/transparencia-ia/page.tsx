import type { Metadata } from "next";
import { LegalTitle, H2, P, Ul, Li } from "@/components/legal/legal-content";

export const metadata: Metadata = {
  title: "Transparencia de la IA",
  description: "Cómo Kelsira calcula el Puntaje Objetivo IA a partir del texto de cada reseña.",
};

export default function TransparenciaIaPage() {
  return (
    <>
      <LegalTitle updated="14 de agosto de 2026">Política de Transparencia de la IA</LegalTitle>

      <P>
        Esta página explica, en detalle, cómo funciona el motor de inteligencia artificial
        que calcula el Puntaje Objetivo IA — porque creemos que una calificación automatizada
        solo es confiable si su funcionamiento es auditable.
      </P>

      <H2>1. Lo que la IA nunca hace</H2>
      <P>
        La IA no edita, resume, censura ni oculta el texto original de una reseña. Lo que un
        cliente escribe se publica íntegro. La única salida de la IA es una puntuación
        estructurada calculada a partir de ese texto.
      </P>

      <H2>2. Cómo se calcula el puntaje</H2>
      <P>
        Cuando se envía una reseña, el texto se analiza con un modelo de lenguaje (GPT-4o
        mini de OpenAI) instruido para evaluar tres dimensiones de forma independiente, cada
        una de 1.0 a 5.0:
      </P>
      <Ul>
        <Li><strong>Producto:</strong> calidad del producto o servicio principal.</Li>
        <Li><strong>Atención:</strong> trato, rapidez y resolución del servicio al cliente.</Li>
        <Li><strong>Envío:</strong> cumplimiento de tiempos y condiciones de entrega.</Li>
      </Ul>
      <P>
        El modelo recibe también el rubro del negocio (ej. restaurante, moda, electrónica) y
        una breve descripción, para interpretar cada dimensión con el criterio adecuado a ese
        tipo de negocio.
      </P>
      <P>
        El puntaje final se calcula con una ponderación fija: <strong>40% Producto + 30%
        Atención + 30% Envío</strong>. El objetivo es que un problema puntual en una sola
        dimensión (ej. un envío tardío) no borre una experiencia positiva en las demás.
      </P>

      <H2>3. Penalización por inacción operativa</H2>
      <P>
        Si un mismo problema se repite en varias reseñas de un negocio (ej. retrasos con la
        misma agencia de envíos) y el negocio no lo resuelve en 30 días, las reseñas nuevas
        que mencionen ese problema reciben una penalización adicional al puntaje. Esto existe
        para que la calificación siga siendo honesta con los clientes cuando un problema
        conocido no se corrige.
      </P>

      <H2>4. Apelaciones y corrección de errores</H2>
      <P>
        Ningún modelo de IA es perfecto. Si un negocio considera que una reseña es falsa o que
        el puntaje no refleja los hechos, puede apelarla adjuntando evidencia. Un revisor
        humano evalúa cada apelación y puede: archivar la reseña (si es falsa/difamatoria) o
        corregir el puntaje (si la reseña es real pero se evaluó injustamente) — en ambos
        casos, el texto original del cliente nunca se modifica.
      </P>

      <H2>5. Limitaciones conocidas</H2>
      <Ul>
        <Li>El modelo puede malinterpretar sarcasmo, jerga local o texto ambiguo.</Li>
        <Li>Reseñas muy cortas o vagas dan al modelo menos información para inferir con precisión.</Li>
        <Li>El puntaje es una estimación automatizada, no un juicio legal ni una verificación de hechos independiente.</Li>
      </Ul>

      <H2>6. Auditabilidad</H2>
      <P>
        Cada reseña publicada muestra su desglose completo por dimensión, visible tanto en el
        dashboard del negocio como en el widget público — cualquiera puede ver cómo se llegó
        al puntaje final.
      </P>
    </>
  );
}
