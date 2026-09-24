export function cleanPhone(phone: string): string {
  // Limpia espacios, guiones y signos más
  let cleaned = phone.replace(/[^0-9]/g, '');
  // Si no tiene prefijo país de Chile y son 9 dígitos, agregar 56
  if (cleaned.length === 9) {
    cleaned = '56' + cleaned;
  }
  return cleaned;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateCustomerOrderWhatsAppLink(
  storePhone: string,
  orderNumber: number,
  customerName: string,
  totalAmount: number,
  deliveryType: string,
  deliveryAddress?: string,
  items?: { product_name: string; quantity: number; subtotal: number }[]
): string {
  const phone = cleanPhone(storePhone);
  const deliveryText =
    deliveryType === 'delivery'
      ? `🛵 *Envío a Domicilio*:\n📍 ${deliveryAddress || 'Dirección registrada'}`
      : `🏪 *Retiro en Local*`;

  let itemsDetail = '';
  if (items && items.length > 0) {
    itemsDetail =
      '\n\n*Detalle de Productos:*\n' +
      items.map((i) => `• ${i.quantity}x ${i.product_name} (${formatPrice(i.subtotal)})`).join('\n');
  }

  const message = `🛒 *¡Hola Tienda! Acabo de realizar el Pedido #${orderNumber}*\n\n` +
    `👤 *Cliente:* ${customerName}\n` +
    `💰 *Total:* ${formatPrice(totalAmount)}\n` +
    `${deliveryText}` +
    `${itemsDetail}\n\n` +
    `_Por favor confirmen recepción de mi pedido._`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function generateAdminContactCustomerWhatsAppLink(
  customerPhone: string,
  orderNumber: number,
  customerName: string,
  totalAmount: number,
  deliveryType: string,
  deliveryAddress?: string
): string {
  const phone = cleanPhone(customerPhone);
  const deliveryText =
    deliveryType === 'delivery'
      ? `para envío a: *${deliveryAddress || 'tu dirección'}*`
      : `para *retiro en local*`;

  const message = `👋 *¡Hola ${customerName}!* Te contactamos de *Kaibutsu Market* referente a tu *Pedido #${orderNumber}* (${deliveryText}) por un total de *${formatPrice(totalAmount)}*.\n\n` +
    `Te escribimos para coordinar los detalles y confirmarte la disponibilidad. ¿Podrías confirmar si todo está correcto?`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
