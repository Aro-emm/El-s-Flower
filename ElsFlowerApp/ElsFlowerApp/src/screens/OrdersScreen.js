// src/screens/OrdersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, RefreshControl, Linking, ActivityIndicator
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const STATUS_CONFIG = {
  reçue:          { label: '🔔 Reçue',          color: '#FFA940', bg: '#FFF7ED', next: 'en_preparation' },
  en_preparation: { label: '👩‍🍳 En préparation', color: '#1890FF', bg: '#EDF6FF', next: 'livrée' },
  livrée:         { label: '✅ Livrée',          color: '#52C41A', bg: '#F0FFF4', next: null },
  annulée:        { label: '❌ Annulée',         color: '#FF4D4F', bg: '#FFF1F0', next: null },
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // ─── Écoute Firestore en temps réel ───
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('commandes')
      .orderBy('date', 'desc')
      .onSnapshot(snapshot => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }, err => { console.error(err); setLoading(false); });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    await firestore().collection('commandes').doc(orderId).update({ status: newStatus });
  };

  const cancelOrder = (order) => {
    Alert.alert('Annuler', `Annuler la commande de ${order.client.name} ?`, [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui', style: 'destructive', onPress: () => updateStatus(order.id, 'annulée') }
    ]);
  };

  const callClient = (phone) => Linking.openURL(`tel:${phone}`);

  const whatsappClient = (order) => {
    const msg = encodeURIComponent(
      `Bonjour ${order.client.name} 🌸\nVotre commande EL'S FLOWER est confirmée !\n` +
      `Total: ${order.total?.toLocaleString()} Ar\nNous vous contacterons bientôt. Merci !`
    );
    const phone = order.client.phone.replace(/\s/g, '').replace(/^0/, '');
    Linking.openURL(`whatsapp://send?phone=261${phone}&text=${msg}`);
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const counts = {
    all: orders.length,
    reçue: orders.filter(o => o.status === 'reçue').length,
    en_preparation: orders.filter(o => o.status === 'en_preparation').length,
    livrée: orders.filter(o => o.status === 'livrée').length,
  };

  const renderOrder = ({ item }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG['reçue'];
    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View>
            <Text style={s.orderId}>#{item.id.slice(-8).toUpperCase()}</Text>
            <Text style={s.orderDate}>{item.date ? new Date(item.date).toLocaleString('fr-FR') : '—'}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={s.clientRow}>
          <View style={s.clientAvatar}>
            <Text style={s.avatarText}>{item.client?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.clientName}>{item.client?.name}</Text>
            <Text style={s.clientPhone}>{item.client?.phone}</Text>
            <Text style={s.clientAddress} numberOfLines={1}>📍 {item.client?.address}</Text>
          </View>
          <View style={s.contactBtns}>
            <TouchableOpacity style={s.callBtn} onPress={() => callClient(item.client?.phone)}>
              <Text>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.waBtn} onPress={() => whatsappClient(item)}>
              <Text>💬</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.itemsList}>
          {item.items?.map((p, i) => (
            <View key={i} style={s.itemRow}>
              <Text style={s.itemName}>{p.name} × {p.qty}</Text>
              <Text style={s.itemPrice}>{(p.price * p.qty).toLocaleString()} Ar</Text>
            </View>
          ))}
        </View>

        {item.client?.note ? (
          <View style={s.noteBox}>
            <Text style={s.noteText}>💬 {item.client.note}</Text>
          </View>
        ) : null}

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalAmount}>{item.total?.toLocaleString()} Ar</Text>
        </View>

        {item.status !== 'livrée' && item.status !== 'annulée' && (
          <View style={s.actions}>
            {cfg.next && (
              <TouchableOpacity style={s.nextBtn} onPress={() => updateStatus(item.id, cfg.next)}>
                <Text style={s.nextBtnText}>
                  {cfg.next === 'en_preparation' ? '👩‍🍳 Préparer' : '✅ Marquer livrée'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.cancelBtn} onPress={() => cancelOrder(item)}>
              <Text style={s.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) return (
    <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color="#1E2A5E" />
      <Text style={{ marginTop: 12, color: '#8898C0' }}>Chargement des commandes…</Text>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.filters}>
        {[['all','Toutes'], ['reçue','Reçues'], ['en_preparation','En cours'], ['livrée','Livrées']].map(([key, label]) => (
          <TouchableOpacity key={key} style={[s.filterBtn, filter === key && s.filterActive]} onPress={() => setFilter(key)}>
            <Text style={[s.filterText, filter === key && s.filterTextActive]}>
              {label}{counts[key] > 0 ? ` (${counts[key]})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {filtered.length === 0
        ? <View style={s.empty}><Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text><Text style={s.emptyText}>Aucune commande.</Text></View>
        : <FlatList data={filtered} keyExtractor={i => i.id} renderItem={renderOrder} contentContainerStyle={{ padding: 16 }} />
      }
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F6FB' },
  filters: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0ECF7', gap: 8 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, backgroundColor: '#F0F6FB' },
  filterActive: { backgroundColor: '#1E2A5E' },
  filterText: { fontSize: 12, color: '#8898C0', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 15, color: '#8898C0', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderId: { fontSize: 13, fontWeight: '600', color: '#1E2A5E' },
  orderDate: { fontSize: 11, color: '#A0B0C8', marginTop: 2 },
  statusBadge: { borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  clientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  clientAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#BDD7EE', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { fontSize: 18, fontWeight: '600', color: '#1E2A5E' },
  clientName: { fontSize: 15, fontWeight: '600', color: '#1E2A5E' },
  clientPhone: { fontSize: 13, color: '#8898C0' },
  clientAddress: { fontSize: 12, color: '#A0B0C8', marginTop: 2 },
  contactBtns: { flexDirection: 'row', gap: 8 },
  callBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EDF6FF', justifyContent: 'center', alignItems: 'center' },
  waBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F0FFF4', justifyContent: 'center', alignItems: 'center' },
  itemsList: { backgroundColor: '#F7FAFD', borderRadius: 10, padding: 10, marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName: { fontSize: 13, color: '#1E2A5E' },
  itemPrice: { fontSize: 13, color: '#8898C0' },
  noteBox: { backgroundColor: '#FFF7ED', borderRadius: 8, padding: 10, marginBottom: 10 },
  noteText: { fontSize: 13, color: '#B45309', fontStyle: 'italic' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E0ECF7', marginBottom: 12 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#1E2A5E' },
  totalAmount: { fontSize: 16, fontWeight: '700', color: '#D4849A' },
  actions: { flexDirection: 'row', gap: 8 },
  nextBtn: { flex: 1, backgroundColor: '#1E2A5E', borderRadius: 50, padding: 12, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  cancelBtn: { backgroundColor: '#FFF1F0', borderRadius: 50, paddingHorizontal: 16, padding: 12, alignItems: 'center' },
  cancelBtnText: { color: '#FF4D4F', fontSize: 13, fontWeight: '500' },
});
