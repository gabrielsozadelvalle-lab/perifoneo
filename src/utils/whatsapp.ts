
export interface BusinessData {
    name: string;
    phone: string;
    address: string;
    logoUrl?: string;
    slogan?: string;
}

export const DEFAULT_BUSINESS_DATA: BusinessData = {
    name: "PERIFONEO MATAGALPA",
    phone: "+505 8888 8888",
    address: "Del Parque Morazán, 1c. al Este. Matagalpa.",
    slogan: "¡Llegamos a cada rincón con tu mensaje!",
};

export function generateWhatsAppMessage(
    cliente: any,
    servicio: any,
    business: BusinessData = DEFAULT_BUSINESS_DATA
) {
    const fecha = new Date(servicio.fecha).toLocaleDateString("es-NI", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const tipoServicio = servicio.tipo === "activacion" ? "ACTIVACIÓN" : "PERIFONEO";
    const emoji = servicio.tipo === "activacion" ? "📻" : "🔊";

    const message = `
*${business.name}*
${business.slogan ? `_${business.slogan}_` : ""}
━━━━━━━━━━━━━━━━━━━━
*CONTROL DE SERVICIO*
━━━━━━━━━━━━━━━━━━━━

  👤 *Cliente:* ${cliente.nombre}
  ${emoji} *Servicio:* ${tipoServicio}
  📅 *Fecha:* ${fecha}
  📝 *Notas:* ${servicio.notas || "Sin observaciones"}

━━━━━━━━━━━━━━━━━━━━
  📞 *Contacto:* ${business.phone}
  📍 *Dirección:* ${business.address}

*¡Gracias por su confianza!*
━━━━━━━━━━━━━━━━━━━━
`.trim();

    return encodeURIComponent(message);
}

export function openWhatsApp(cliente: any, servicio: any) {
    const message = generateWhatsAppMessage(cliente, servicio);
    const phone = cliente.telefono ? cliente.telefono.replace(/\s+/g, '') : "";

    // Clean phone number (remove non-digits, but keep + if present)
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    // Format phone for international use if it doesn't have it (assuming Nicaragua +505)
    let finalPhone = cleanPhone;
    if (finalPhone && !finalPhone.startsWith('+')) {
        if (finalPhone.length === 8) {
            finalPhone = `505${finalPhone}`;
        }
    }

    const url = `https://wa.me/${finalPhone}?text=${message}`;
    window.open(url, "_blank");
}
