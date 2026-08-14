import { LegalTitle, H2, P, Ul, Li } from "@/components/legal/legal-content";

export default function TerminosPage() {
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
