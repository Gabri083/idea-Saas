import type { Metadata } from "next";
import { LegalTitle, H2, P, Ul, Li } from "@/components/legal/legal-content";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de Privacidad de Kelsira.",
};

export default function PrivacidadPage() {
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
