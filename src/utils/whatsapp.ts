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
    address: "Del Parque Morazan, 1c. al Este. Matagalpa.",
    slogan: "Llegamos a cada rincon con tu mensaje!",
};

function formatPayment(servicio: any) {
    const cobroLine = String(servicio.notas || "")
        .split(/\r?\n/)
        .find((line) => line.startsWith("Cobro: "));
    return cobroLine?.replace("Cobro: ", "") || "No especificado";
}

function formatNotes(servicio: any) {
    const notas = String(servicio.notas || "")
        .split(/\r?\n/)
        .filter((line) => !line.startsWith("Cobro: "))
        .join(" ")
        .trim();
    return notas || "Sin observaciones";
}

export function generateWhatsAppMessage(
    cliente: any,
    servicio: any,
    business: BusinessData = DEFAULT_BUSINESS_DATA
) {
    const fecha = new Date(servicio.fecha).toLocaleDateString("es-NI", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const tipoServicio = servicio.tipo === "activacion" ? "ACTIVACION" : "PERIFONEO";
    const metodoCobro = formatPayment(servicio);

    const message = `
*${business.name}*
${business.slogan ? `_${business.slogan}_` : ""}
--------------------
*CONTROL DE SERVICIO*
--------------------

  *Cliente:* ${cliente.nombre}
  *Servicio:* ${tipoServicio}
  *Fecha:* ${fecha}
  *Cobro:* ${metodoCobro}
  *Notas:* ${formatNotes(servicio)}

--------------------
  *Contacto:* ${business.phone}
  *Direccion:* ${business.address}

*Gracias por su confianza!*
--------------------
`.trim();

    return encodeURIComponent(message);
}

export function openWhatsApp(cliente: any, servicio: any) {
    const message = generateWhatsAppMessage(cliente, servicio);
    const phone = cliente.telefono ? cliente.telefono.replace(/\s+/g, "") : "";

    const cleanPhone = phone.replace(/[^\d+]/g, "");

    let finalPhone = cleanPhone;
    if (finalPhone && !finalPhone.startsWith("+")) {
        if (finalPhone.length === 8) {
            finalPhone = `505${finalPhone}`;
        }
    }

    const url = `https://wa.me/${finalPhone}?text=${message}`;
    window.open(url, "_blank");
}
