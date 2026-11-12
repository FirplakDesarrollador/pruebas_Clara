import { NextRequest, NextResponse } from "next/server";

// Endpoint de la API de Leads de Firplak (ambiente de pruebas) incrustada en el código
const FIRPLAK_LEAD_ENDPOINT =
  "https://upbshzmzaiunbglsahgo.supabase.co/functions/v1/wordpress-lead-intake";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombres, apellidos, celularWhatsapp, email, categoria, urlOrigen } =
      body || {};

    // Validación básica en servidor
    if (!nombres || typeof nombres !== "string" || !nombres.trim()) {
      return NextResponse.json(
        { success: false, error: "El nombre es obligatorio." },
        { status: 400 }
      );
    }

    const emailStr = typeof email === "string" ? email.trim() : "";
    const telefonoStr =
      typeof celularWhatsapp === "string" ? celularWhatsapp.trim() : "";

    if (!emailStr && !telefonoStr) {
      return NextResponse.json(
        {
          success: false,
          error: "Debes ingresar al menos un teléfono o un correo electrónico.",
        },
        { status: 400 }
      );
    }

    const secretKey = process.env.FIRPLAK_LEAD_SECRET;

    if (!secretKey) {
      console.error(
        "[Firplak Leads] Error de configuración: La variable de entorno FIRPLAK_LEAD_SECRET no está definida en el servidor."
      );
      return NextResponse.json(
        {
          success: false,
          error: "No pudimos enviar tu solicitud, intenta de nuevo",
        },
        { status: 500 }
      );
    }

    // Construcción del payload según la estructura requerida por Firplak
    const nombreCompleto = [nombres.trim(), (apellidos || "").trim()]
      .filter(Boolean)
      .join(" ");

    const firplakPayload = {
      contacto: {
        nombre: nombres.trim(),
        apellido: (apellidos || "").trim(),
        email: emailStr,
        telefono: telefonoStr,
      },
      oportunidad: {
        asignado_a: "canalpropio@firplak.com",
        nombre: nombreCompleto || "Contacto Web",
        categoria_oportunidad: categoria ? [categoria] : [],
        origen_oportunidad: "formulario-web",
        url_origen: urlOrigen || "",
        fuente_conversion: "formulario-web",
        comentarios: categoria
          ? `Categoría de interés: ${categoria}`
          : "Solicitud de asesoría desde formulario web",
      },
    };

    // Timeout de 15 segundos con AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await fetch(FIRPLAK_LEAD_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-firplak-secret": secretKey,
        },
        body: JSON.stringify(firplakPayload),
        signal: controller.signal,
      });
    } catch (fetchErr: unknown) {
      clearTimeout(timeoutId);
      const isTimeout =
        fetchErr instanceof Error && fetchErr.name === "AbortError";
      console.error(
        `[Firplak Leads] ${
          isTimeout ? "Timeout al conectar con" : "Error de red al invocar"
        } la API de Firplak:`,
        fetchErr
      );
      return NextResponse.json(
        {
          success: false,
          error: "No pudimos enviar tu solicitud, intenta de nuevo",
        },
        { status: 504 }
      );
    }

    clearTimeout(timeoutId);

    const responseData = await response.json().catch(() => null);

    // Caso 401: No autorizado (error de clave)
    if (response.status === 401) {
      console.error(
        "[Firplak Leads] Error 401 No autorizado: La clave FIRPLAK_LEAD_SECRET fue rechazada por la API de Firplak.",
        responseData
      );
      return NextResponse.json(
        {
          success: false,
          error: "No pudimos enviar tu solicitud, intenta de nuevo",
        },
        { status: 401 }
      );
    }

    // Caso 200: Éxito (incluyendo duplicado_prevenido: true)
    if (response.ok) {
      const isDuplicate = responseData?.duplicado_prevenido === true;
      if (isDuplicate) {
        console.log(
          "[Firplak Leads] Lead procesado con duplicado_prevenido: true",
          responseData
        );
      }
      return NextResponse.json({
        success: true,
        duplicado_prevenido: isDuplicate,
        data: responseData,
      });
    }

    // Otros errores HTTP
    console.error(
      `[Firplak Leads] Error ${response.status} devuelto por la API de Firplak:`,
      responseData
    );
    return NextResponse.json(
      {
        success: false,
        error: "No pudimos enviar tu solicitud, intenta de nuevo",
      },
      { status: response.status }
    );
  } catch (err) {
    console.error("[Firplak Leads] Excepción no controlada en el servidor:", err);
    return NextResponse.json(
      {
        success: false,
        error: "No pudimos enviar tu solicitud, intenta de nuevo",
      },
      { status: 500 }
    );
  }
}
