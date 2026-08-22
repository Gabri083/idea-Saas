import type { Metadata } from "next";
import { LegalTitle, H2, P, Ul, Li } from "@/components/legal/legal-content";
import { getLocale } from "@/lib/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === "en"
    ? { title: "Privacy Policy", description: "Kelsira's Privacy Policy." }
    : { title: "Política de Privacidad", description: "Política de Privacidad de Kelsira." };
}

export default async function PrivacidadPage() {
  const locale = await getLocale();
  return locale === "en" ? <PrivacidadEn /> : <PrivacidadEs />;
}

function PrivacidadEs() {
  return (
    <>
      <LegalTitle updated="14 de agosto de 2026">Política de Privacidad</LegalTitle>

      <P>
        Esta política explica qué datos personales recopila Kelsira, para qué los usamos, y con
        quién los compartimos. Aplica tanto a dueños de negocio que usan el dashboard como a
        los clientes finales que dejan una reseña.
      </P>

      <H2>1. Qué datos recopilamos</H2>
      <P>De dueños de negocio (cuentas):</P>
      <Ul>
        <Li>Nombre, correo electrónico y contraseña (gestionada de forma segura por Supabase Auth).</Li>
        <Li>Nombre, rubro y descripción del negocio.</Li>
        <Li>Datos de facturación — procesados directamente por Lemon Squeezy; nosotros no almacenamos números de tarjeta.</Li>
      </Ul>
      <P>De clientes que dejan una reseña:</P>
      <Ul>
        <Li>Nombre y correo electrónico ingresados en el formulario público de reseña.</Li>
        <Li>El texto de la reseña.</Li>
      </Ul>

      <H2>2. Para qué usamos estos datos</H2>
      <Ul>
        <Li>Operar tu cuenta y el dashboard.</Li>
        <Li>Enviar el texto de la reseña a nuestro proveedor de IA (OpenAI) para calcular el Puntaje Objetivo IA.</Li>
        <Li>Mostrar las reseñas publicadas en el widget embebible de tu tienda.</Li>
        <Li>Procesar pagos de suscripción a través de Lemon Squeezy.</Li>
        <Li>Comunicarnos contigo sobre tu cuenta (ej. resultado de una apelación).</Li>
      </Ul>
      <P>
        El correo del cliente que deja una reseña se usa únicamente para verificar la compra
        y nunca se publica ni se muestra en el widget público.
      </P>

      <H2>3. Con quién compartimos datos</H2>
      <P>Usamos los siguientes proveedores (encargados de tratamiento) para operar el servicio:</P>
      <Ul>
        <Li><strong>Supabase</strong> — base de datos y autenticación.</Li>
        <Li><strong>OpenAI</strong> — análisis del texto de las reseñas para calcular el puntaje.</Li>
        <Li><strong>Lemon Squeezy</strong> — procesamiento de pagos y facturación.</Li>
        <Li><strong>Vercel</strong> — alojamiento de la aplicación.</Li>
      </Ul>
      <P>No vendemos datos personales a terceros con fines publicitarios.</P>

      <H2>4. Seguridad</H2>
      <P>
        Aplicamos controles de acceso (cada negocio solo puede ver sus propios datos) y
        cifrado en tránsito. Ningún sistema es 100% infalible, pero tomamos medidas
        razonables para proteger la información que nos confías.
      </P>

      <H2>5. Tus derechos</H2>
      <P>
        Puedes solicitar acceso, corrección o eliminación de tus datos personales
        escribiéndonos a <a href="mailto:hola@kelsira.app" className="text-cobalt hover:underline">hola@kelsira.app</a>.
        Los dueños de negocio pueden editar la mayoría de sus datos directamente desde
        Configuración.
      </P>

      <H2>6. Cookies</H2>
      <P>
        Usamos cookies estrictamente necesarias para mantener tu sesión iniciada. No usamos
        cookies de rastreo publicitario.
      </P>

      <H2>7. Cambios a esta política</H2>
      <P>
        Si hacemos cambios sustanciales, te avisaremos por correo o dentro del dashboard.
      </P>
    </>
  );
}

function PrivacidadEn() {
  return (
    <>
      <LegalTitle updated="August 14, 2026" updatedLabel="Last updated:">Privacy Policy</LegalTitle>

      <P>
        This policy explains what personal data Kelsira collects, what we use it for, and who
        we share it with. It applies both to business owners using the dashboard and to the
        end customers who leave a review.
      </P>

      <H2>1. What data we collect</H2>
      <P>From business owners (accounts):</P>
      <Ul>
        <Li>Name, email address, and password (securely managed by Supabase Auth).</Li>
        <Li>Business name, category, and description.</Li>
        <Li>Billing data — processed directly by Lemon Squeezy; we never store card numbers.</Li>
      </Ul>
      <P>From customers who leave a review:</P>
      <Ul>
        <Li>Name and email entered in the public review form.</Li>
        <Li>The review text.</Li>
      </Ul>

      <H2>2. What we use this data for</H2>
      <Ul>
        <Li>Operating your account and the dashboard.</Li>
        <Li>Sending the review text to our AI provider (OpenAI) to calculate the AI Objective Score.</Li>
        <Li>Displaying published reviews in your store&apos;s embeddable widget.</Li>
        <Li>Processing subscription payments through Lemon Squeezy.</Li>
        <Li>Communicating with you about your account (e.g. the outcome of an appeal).</Li>
      </Ul>
      <P>
        The email address a reviewing customer provides is used solely to verify the
        purchase and is never published or shown in the public widget.
      </P>

      <H2>3. Who we share data with</H2>
      <P>We use the following providers (data processors) to operate the service:</P>
      <Ul>
        <Li><strong>Supabase</strong> — database and authentication.</Li>
        <Li><strong>OpenAI</strong> — analyzing review text to calculate the score.</Li>
        <Li><strong>Lemon Squeezy</strong> — payment processing and billing.</Li>
        <Li><strong>Vercel</strong> — application hosting.</Li>
      </Ul>
      <P>We do not sell personal data to third parties for advertising purposes.</P>

      <H2>4. Security</H2>
      <P>
        We apply access controls (each business can only see its own data) and encryption in
        transit. No system is 100% foolproof, but we take reasonable measures to protect the
        information you entrust to us.
      </P>

      <H2>5. Your rights</H2>
      <P>
        You can request access to, correction of, or deletion of your personal data by
        writing to <a href="mailto:hola@kelsira.app" className="text-cobalt hover:underline">hola@kelsira.app</a>.
        Business owners can edit most of their data directly from Settings.
      </P>

      <H2>6. Cookies</H2>
      <P>
        We use strictly necessary cookies to keep you signed in. We do not use advertising
        tracking cookies.
      </P>

      <H2>7. Changes to this policy</H2>
      <P>
        If we make substantial changes, we will notify you by email or within the dashboard.
      </P>
    </>
  );
}
