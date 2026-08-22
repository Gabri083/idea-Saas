import type { Metadata } from "next";
import { LegalTitle, H2, P, Ul, Li } from "@/components/legal/legal-content";
import { getLocale } from "@/lib/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === "en"
    ? {
        title: "AI Transparency",
        description: "How Kelsira calculates the AI Objective Score from each review's text.",
      }
    : {
        title: "Transparencia de la IA",
        description: "Cómo Kelsira calcula el Puntaje Objetivo IA a partir del texto de cada reseña.",
      };
}

export default async function TransparenciaIaPage() {
  const locale = await getLocale();
  return locale === "en" ? <TransparenciaEn /> : <TransparenciaEs />;
}

function TransparenciaEs() {
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

function TransparenciaEn() {
  return (
    <>
      <LegalTitle updated="August 14, 2026" updatedLabel="Last updated:">AI Transparency Policy</LegalTitle>

      <P>
        This page explains, in detail, how the AI engine that calculates the AI Objective
        Score works — because we believe an automated rating is only trustworthy if how it
        works can be audited.
      </P>

      <H2>1. What the AI never does</H2>
      <P>
        The AI does not edit, summarize, censor, or hide a review&apos;s original text. What a
        customer writes is published in full. The only output the AI produces is a structured
        score calculated from that text.
      </P>

      <H2>2. How the score is calculated</H2>
      <P>
        When a review is submitted, the text is analyzed with a language model (OpenAI&apos;s
        GPT-4o mini) instructed to independently evaluate three dimensions, each from 1.0 to
        5.0:
      </P>
      <Ul>
        <Li><strong>Product:</strong> quality of the core product or service.</Li>
        <Li><strong>Service:</strong> treatment, responsiveness, and resolution of customer service.</Li>
        <Li><strong>Shipping:</strong> whether delivery timelines and conditions were met.</Li>
      </Ul>
      <P>
        The model also receives the business&apos;s category (e.g. restaurant, fashion,
        electronics) and a short description, so it can interpret each dimension with
        criteria suited to that type of business.
      </P>
      <P>
        The final score uses a fixed weighting: <strong>40% Product + 30% Service + 30%
        Shipping</strong>. The goal is that a single-dimension problem (e.g. a late shipment)
        doesn&apos;t erase a positive experience in the others.
      </P>

      <H2>3. Penalty for unresolved recurring issues</H2>
      <P>
        If the same problem repeats across several of a business&apos;s reviews (e.g. delays
        with the same shipping carrier) and the business doesn&apos;t resolve it within 30
        days, new reviews mentioning that problem receive an additional penalty to their
        score. This exists so the rating stays honest with customers when a known problem
        goes uncorrected.
      </P>

      <H2>4. Appeals and error correction</H2>
      <P>
        No AI model is perfect. If a business believes a review is fake or that its score
        doesn&apos;t reflect the facts, it can appeal by attaching evidence. A human reviewer
        evaluates each appeal and can either: archive the review (if it&apos;s fake or
        defamatory) or correct the score (if the review is real but was rated unfairly) — in
        both cases, the customer&apos;s original text is never modified.
      </P>

      <H2>5. Known limitations</H2>
      <Ul>
        <Li>The model can misinterpret sarcasm, local slang, or ambiguous text.</Li>
        <Li>Very short or vague reviews give the model less information to infer accurately.</Li>
        <Li>The score is an automated estimate, not a legal judgment or an independent fact-check.</Li>
      </Ul>

      <H2>6. Auditability</H2>
      <P>
        Every published review shows its full per-dimension breakdown, visible both in the
        business&apos;s dashboard and in the public widget — anyone can see how the final
        score was reached.
      </P>
    </>
  );
}
