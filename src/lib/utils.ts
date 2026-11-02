import { OrderItem } from '@/types/database';

/**
 * Formats a number to Indonesian Rupiah currency format.
 * Example: 2450000 -> "Rp 2.450.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generates a human-readable unique Order ID for Gentina Jaya Textile.
 * Example: "GJT-20261102-K89A"
 */
export function generateOrderId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GJT-${year}${month}${day}-${randomChars}`;
}

/**
 * Standardizes Indonesian phone number to international 62 format without symbols.
 * Example: "0812-3456-7890" -> "6281234567890"
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Formats ISO timestamp to Indonesian readable date.
 */
export function formatDate(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d) + ' WIB';
  } catch {
    return isoString;
  }
}

/**
 * Constructs the official WhatsApp Order Message Template
 */
export function buildWhatsAppOrderMessage(params: {
  orderId: string;
  customerName: string;
  storeName?: string;
  phoneNumber: string;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
}): string {
  const { orderId, customerName, storeName, phoneNumber, items, totalAmount, notes } = params;

  let text = `*PESANAN BARU - GENTINA JAYA TEXTILE*\n`;
  text += `_Solusi tepat untuk kebutuhan kain dan konveksimu_\n`;
  text += `====================================\n\n`;
  text += `📋 *No. Transaksi:* ${orderId}\n`;
  text += `👤 *Nama Pemesan:* ${customerName}\n`;
  if (storeName && storeName.trim()) {
    text += `🏢 *Toko / Konveksi:* ${storeName}\n`;
  }
  text += `📱 *No. WhatsApp:* ${phoneNumber}\n\n`;

  text += `*Rincian Pesanan:*\n`;
  items.forEach((item, index) => {
    text += `${index + 1}. *${item.name}*\n`;
    text += `   • ${item.quantity} ${item.unit} x ${formatRupiah(item.price)} = *${formatRupiah(item.subtotal)}*\n`;
  });

  text += `\n------------------------------------\n`;
  text += `💰 *TOTAL PEMBAYARAN:* *${formatRupiah(totalAmount)}*\n`;
  text += `📌 *Status:* Menunggu Konfirmasi & Pembayaran\n`;

  if (notes && notes.trim()) {
    text += `\n📝 *Catatan Tambahan:*\n"${notes.trim()}"\n`;
  }

  text += `\n====================================\n`;
  text += `Halo Admin Gentina Jaya Textile, saya ingin mengonfirmasi pesanan ini dan meminta info rekening serta estimasi ongkos kirim. Terima kasih! 🙏`;

  return text;
}

/**
 * Generates WhatsApp URL
 */
export function createWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = formatPhoneNumber(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
