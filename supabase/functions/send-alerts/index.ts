// Deno Edge Function: send-alerts
// Ubicación: supabase/functions/send-alerts/index.ts
// Programado para ejecutarse diariamente (08:00 AM) para enviar alertas push de expiración.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push";

// Configuración de cabeceras CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apiKey, content-type",
};

// VAPID keys para notificaciones Web Push.
// En producción, estas llaves deben almacenarse como variables de entorno en Supabase:
// VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY y VAPID_SUBJECT (ej. mailto:alertas@agendacar.com)
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "BEl62Clvd31mE68d_7Fj3d38W9F8302_example_vapid_public_key_to_replace_in_production";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "your-vapid-private-key-placeholder";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:alertas@agendacar.com";

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

serve(async (req) => {
  // Manejo de peticiones preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Inicializar cliente Supabase con privilegios Service Role para poder consultar todos los datos
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Obtener la fecha de hoy normalizada a las 12:00:00 UTC
    const today = new Date();
    today.setUTCHours(12, 0, 0, 0);

    // 2. Cargar todos los documentos no borrados lógicamente que tengan end_date configurado
    const { data: docs, error: docsError } = await supabase
      .from("documents")
      .select("*, vehicles(brand, model)")
      .is("deleted_at", null)
      .not("end_date", "is", null);

    if (docsError) throw docsError;

    const thresholds = [30, 15, 7, 3, 1, 0];
    const alertsToProcess = [];

    // 3. Analizar expiraciones
    for (const doc of docs) {
      const expiryDate = new Date(doc.end_date + "T12:00:00Z");
      
      // Calcular diferencia en días exactos
      const diffTime = expiryDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Determinar si entra en algún umbral de alertas
      let matchedThreshold = null;
      if (daysLeft === 30) matchedThreshold = 30;
      else if (daysLeft === 15) matchedThreshold = 15;
      else if (daysLeft <= 7 && daysLeft >= 0) matchedThreshold = daysLeft; // Alertas diarias en el periodo crítico
      else if (daysLeft < 0) matchedThreshold = -1; // Vencido

      if (matchedThreshold !== null) {
        // Obtener suscripciones activas del usuario
        const { data: subs, error: subsError } = await supabase
          .from("push_subscriptions")
          .select("*")
          .eq("user_id", doc.user_id)
          .eq("is_active", true);

        if (subsError) throw subsError;

        if (subs && subs.length > 0) {
          for (const sub of subs) {
            // Verificar si ya se envió esta alerta a este dispositivo para evitar duplicados
            const { data: history, error: historyError } = await supabase
              .from("notification_history")
              .select("id")
              .eq("document_id", doc.id)
              .eq("threshold", matchedThreshold)
              .eq("device_id", sub.device_id);

            if (historyError) throw historyError;

            if (!history || history.length === 0) {
              let typeText = doc.type === "license" ? "Tu Licencia de Conducir" : doc.title;
              if (doc.vehicles) {
                typeText += ` del vehículo ${doc.vehicles.brand} ${doc.vehicles.model}`;
              }

              let messageBody = "";
              if (matchedThreshold === -1) {
                messageBody = `${typeText} ha VENCIDO.`;
              } else if (matchedThreshold <= 1) {
                messageBody = `${typeText} vence MAÑANA.`;
              } else {
                messageBody = `${typeText} vence en ${daysLeft} días.`;
              }

              const notificationPayload = JSON.stringify({
                title: "🚨 Recordatorio de Agenda Car",
                body: messageBody,
                tag: `alert-${doc.id}-${matchedThreshold}`,
                url: "/"
              });

              try {
                const pushConfig = {
                  endpoint: sub.endpoint,
                  keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                  }
                };

                await webpush.sendNotification(pushConfig, notificationPayload);
                successCount++;

                const nowISO = new Date().toISOString();
                // Actualizar suscripción con el éxito y última vista
                await supabase
                  .from("push_subscriptions")
                  .update({ 
                    last_success_at: nowISO,
                    last_seen_at: nowISO
                  })
                  .eq("id", sub.id);

                // Registrar en el historial por dispositivo
                await supabase.from("notification_history").insert({
                  user_id: doc.user_id,
                  document_id: doc.id,
                  threshold: matchedThreshold,
                  device_id: sub.device_id,
                  sent_at: nowISO
                });

              } catch (pushErr) {
                console.error(`[Alert Engine] Error enviando a suscripción ${sub.id}:`, pushErr);
                if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                  console.log(`[Alert Engine] Eliminando suscripción obsoleta ${sub.id}`);
                  await supabase.from("push_subscriptions").delete().eq("id", sub.id);
                }
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Procesado con éxito. Enviadas ${successCount} notificaciones.` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err) {
    console.error("[Alert Engine Error]", err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
