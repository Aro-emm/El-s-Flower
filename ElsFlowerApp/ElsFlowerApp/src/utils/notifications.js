// src/utils/notifications.js
import { Linking, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';

// ─── CONFIG ───
const OWNER_PHONE = '261323751017'; // numéro WhatsApp de la gérante (format international, sans +)

// ─── PUSH NOTIFICATION IN-APP ───
export function setupNotifications() {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('Notification reçue:', notification);
    },
    requestPermissions: Platform.OS === 'ios',
  });

  PushNotification.createChannel(
    {
      channelId: 'elsflower-orders',
      channelName: 'Nouvelles Commandes',
      channelDescription: 'Notifications pour les commandes ELS Flower',
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`Canal créé: ${created}`)
  );
}

export function sendLocalNotification(order) {
  PushNotification.localNotification({
    channelId: 'elsflower-orders',
    title: '🌸 Nouvelle commande !',
    message: `${order.client.name} — ${order.total.toLocaleString()} Ar`,
    bigText: `Client: ${order.client.name}\nTél: ${order.client.phone}\nTotal: ${order.total.toLocaleString()} Ar\nArticles: ${order.items.map(i => `${i.name} x${i.qty}`).join(', ')}`,
    color: '#1E2A5E',
    vibrate: true,
    vibration: 300,
    playSound: true,
    soundName: 'default',
    importance: 'high',
    priority: 'high',
  });
}

// ─── WHATSAPP MESSAGE ───
export function sendWhatsAppNotification(order) {
  const items = order.items
    .map(i => `  • ${i.name} x${i.qty} = ${(i.price * i.qty).toLocaleString()} Ar`)
    .join('\n');

  const message =
    `🌸 *NOUVELLE COMMANDE — EL'S FLOWER*\n\n` +
    `📋 *N°* ${order.id}\n` +
    `🕐 ${new Date(order.date).toLocaleString('fr-FR')}\n\n` +
    `👤 *Client:* ${order.client.name}\n` +
    `📞 *Tél:* ${order.client.phone}\n` +
    `📍 *Adresse:* ${order.client.address}\n` +
    (order.client.note ? `💬 *Note:* ${order.client.note}\n` : '') +
    `\n🛒 *Commande:*\n${items}\n\n` +
    `💰 *Total: ${order.total.toLocaleString()} Ar*`;

  const encoded = encodeURIComponent(message);
  const url = `whatsapp://send?phone=${OWNER_PHONE}&text=${encoded}`;

  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log('WhatsApp non disponible');
      }
    })
    .catch(err => console.error('Erreur WhatsApp:', err));
}

// ─── ENVOI COMBINÉ ───
export function notifyNewOrder(order) {
  sendLocalNotification(order);
  // WhatsApp s'envoie automatiquement si l'app est ouverte
  // (ou on peut l'appeler depuis l'écran commandes)
}
