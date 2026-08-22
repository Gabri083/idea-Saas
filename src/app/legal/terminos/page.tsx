import type { Metadata } from "next";
import { LegalTitle, H2, P, Ul, Li } from "@/components/legal/legal-content";
import { getLocale } from "@/lib/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === "en"
    ? { title: "Terms of Service", description: "Kelsira's Terms of Service." }
    : { title: "Términos del Servicio", description: "Términos del Servicio de Kelsira." };
}

export default async function TerminosPage() {
  const locale = await getLocale();
  return locale === "en" ? <TerminosEn /> : <TerminosEs />;
}

function TerminosEs() {
  return (
    <>
      <LegalTitle updated="14 de agosto de 2026">Términos del Servicio</LegalTitle>

      <P>
        Estos Términos del Servicio (&ldquo;Términos&rdquo;) regulan el uso de Kelsira (la &ldquo;Plataforma&rdquo;),
        un producto que permite a negocios de e-commerce recibir reseñas de clientes y
        calcular una calificación objetiva mediante inteligencia artificial. Al crear una
        cuenta o usar la Plataforma, aceptas estos Términos.
      </P>

      <H2>1. La cuenta y tu negocio</H2>
      <P>
        Para usar el dashboard debes crear una cuenta con un correo válido. Eres responsable
        de mantener la confidencialidad de tu contraseña y de toda actividad realizada bajo
        tu cuenta. La información que entregas sobre tu negocio (nombre, rubro, descripción)
        se usa para operar el servicio, incluyendo dar contexto al motor de IA.
      </P>

      <H2>2. Planes y pagos</H2>
      <P>
        Los planes pagos (Starter, Growth, Enterprise) se cobran de forma recurrente a través
        de nuestro procesador de pagos (Lemon Squeezy, actuando como comerciante registrado).
        Puedes cancelar tu suscripción en cualquier momento desde el portal de facturación;
        la cancelación aplica al final del período ya pagado. No ofrecemos reembolsos por
        períodos parcialmente usados, salvo que la ley aplicable indique lo contrario.
      </P>

      <H2>3. Reseñas de tus clientes</H2>
      <P>
        El texto que un cliente final escribe en el formulario público de reseña se publica
        de forma íntegra y no es editado, resumido ni censurado por nosotros ni por ti como
        dueño del negocio. Lo único que genera nuestra IA es una calificación estructurada
        (Puntaje Objetivo IA) derivada de ese texto, según se describe en nuestra{" "}
        <a href="/legal/transparencia-ia" className="text-cobalt hover:underline">
          Política de Transparencia de la IA
        </a>
        .
      </P>

      <H2>4. Apelaciones</H2>
      <P>
        Si consideras que una reseña es falsa, difamatoria, o fue calificada injustamente,
        puedes solicitar su revisión adjuntando evidencia a través del Gestor de Apelaciones.
        Las apelaciones son evaluadas por nuestro equipo, que puede archivar la reseña o
        corregir su puntaje sin alterar el texto original del cliente.
      </P>

      <H2>5. Uso aceptable</H2>
      <P>No puedes usar la Plataforma para:</P>
      <Ul>
        <Li>Publicar o solicitar reseñas falsas, incentivadas de forma no revelada, o generadas artificialmente.</Li>
        <Li>Intentar manipular el motor de IA o los mecanismos de ponderación/penalización.</Li>
        <Li>Acceder a datos de otros negocios sin autorización.</Li>
        <Li>Usar la Plataforma con fines ilegales o para infringir derechos de terceros.</Li>
      </Ul>

      <H2>6. Limitación de responsabilidad</H2>
      <P>
        La Plataforma se entrega &ldquo;tal cual&rdquo;. El Puntaje Objetivo IA es una estimación
        automatizada basada en el texto de la reseña y no constituye asesoría profesional ni
        garantía de exactitud absoluta. No somos responsables por decisiones comerciales
        tomadas exclusivamente en base a estas calificaciones, ni por daños indirectos
        derivados del uso de la Plataforma, en la medida permitida por la ley aplicable.
      </P>

      <H2>7. Terminación</H2>
      <P>
        Puedes cerrar tu cuenta en cualquier momento. Podemos suspender o cerrar cuentas que
        incumplan gravemente estos Términos, previa notificación cuando sea razonablemente
        posible.
      </P>

      <H2>8. Cambios a estos Términos</H2>
      <P>
        Podemos actualizar estos Términos ocasionalmente. Si los cambios son sustanciales, te
        avisaremos por correo o dentro del dashboard antes de que entren en vigencia.
      </P>

      <H2>9. Contacto</H2>
      <P>
        Preguntas sobre estos Términos: <a href="mailto:hola@kelsira.app" className="text-cobalt hover:underline">hola@kelsira.app</a>.
      </P>
    </>
  );
}

function TerminosEn() {
  return (
    <>
      <LegalTitle updated="August 14, 2026" updatedLabel="Last updated:">Terms of Service</LegalTitle>

      <P>
        These Terms of Service (&ldquo;Terms&rdquo;) govern the use of Kelsira (the &ldquo;Platform&rdquo;),
        a product that lets e-commerce businesses collect customer reviews and calculate an
        objective rating using artificial intelligence. By creating an account or using the
        Platform, you agree to these Terms.
      </P>

      <H2>1. Your account and your business</H2>
      <P>
        You need a valid email to create a dashboard account. You are responsible for keeping
        your password confidential and for all activity under your account. The information
        you provide about your business (name, category, description) is used to operate the
        service, including giving context to the AI engine.
      </P>

      <H2>2. Plans and payments</H2>
      <P>
        Paid plans (Starter, Growth, Enterprise) are billed on a recurring basis through our
        payment processor (Lemon Squeezy, acting as the merchant of record). You can cancel
        your subscription at any time from the billing portal; cancellation takes effect at
        the end of the period already paid for. We do not offer refunds for partially used
        periods, except where applicable law requires otherwise.
      </P>

      <H2>3. Reviews from your customers</H2>
      <P>
        The text a customer writes in the public review form is published in full and is
        never edited, summarized, or censored by us or by you as the business owner. The
        only thing our AI generates is a structured rating (AI Objective Score) derived from
        that text, as described in our{" "}
        <a href="/legal/transparencia-ia" className="text-cobalt hover:underline">
          AI Transparency Policy
        </a>
        .
      </P>

      <H2>4. Appeals</H2>
      <P>
        If you believe a review is fake, defamatory, or was rated unfairly, you can request a
        review of it by attaching evidence through the Appeals Manager. Appeals are evaluated
        by our team, who may archive the review or correct its score without altering the
        customer&apos;s original text.
      </P>

      <H2>5. Acceptable use</H2>
      <P>You may not use the Platform to:</P>
      <Ul>
        <Li>Post or solicit fake reviews, reviews incentivized without disclosure, or artificially generated reviews.</Li>
        <Li>Attempt to manipulate the AI engine or its weighting/penalty mechanisms.</Li>
        <Li>Access other businesses&apos; data without authorization.</Li>
        <Li>Use the Platform for unlawful purposes or to infringe on third-party rights.</Li>
      </Ul>

      <H2>6. Limitation of liability</H2>
      <P>
        The Platform is provided &ldquo;as is.&rdquo; The AI Objective Score is an automated
        estimate based on the review text and does not constitute professional advice or a
        guarantee of absolute accuracy. We are not liable for business decisions made solely
        on the basis of these ratings, nor for indirect damages arising from use of the
        Platform, to the extent permitted by applicable law.
      </P>

      <H2>7. Termination</H2>
      <P>
        You can close your account at any time. We may suspend or close accounts that
        seriously breach these Terms, with notice when reasonably possible.
      </P>

      <H2>8. Changes to these Terms</H2>
      <P>
        We may update these Terms from time to time. If changes are substantial, we will
        notify you by email or within the dashboard before they take effect.
      </P>

      <H2>9. Contact</H2>
      <P>
        Questions about these Terms: <a href="mailto:hola@kelsira.app" className="text-cobalt hover:underline">hola@kelsira.app</a>.
      </P>
    </>
  );
}
