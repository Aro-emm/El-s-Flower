// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState({ products: 0, orders: 0, pending: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const pData = await AsyncStorage.getItem('elsflower_products');
    const oData = await AsyncStorage.getItem('elsflower_orders');
    const products = pData ? JSON.parse(pData) : [];
    const orders = oData ? JSON.parse(oData) : [];

    const pending = orders.filter(o => o.status === 'reçue').length;
    const revenue = orders
      .filter(o => o.status === 'livrée')
      .reduce((s, o) => s + o.total, 0);

    setStats({ products: products.length, orders: orders.length, pending, revenue });
    setRecentOrders(
      orders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    );
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const statusColor = { reçue: '#FFA940', en_preparation: '#1890FF', livrée: '#52C41A', annulée: '#FF4D4F' };
  const statusLabel = { reçue: 'Reçue', en_preparation: 'En cours', livrée: 'Livrée', annulée: 'Annulée' };

  return (
    <ScrollView
      style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1E2A5E']} />}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Bonjour 🌸</Text>
          <Text style={s.shopName}>EL'S FLOWER</Text>
        </View>
        <Text style={s.date}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
      </View>

      {/* Alert if pending orders */}
      {stats.pending > 0 && (
        <TouchableOpacity style={s.alert} onPress={() => navigation.navigate('Commandes')}>
          <Text style={s.alertIcon}>🔔</Text>
          <Text style={s.alertText}>
            {stats.pending} commande{stats.pending > 1 ? 's' : ''} en attente de traitement
          </Text>
          <Text style={s.alertArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Stats grid */}
      <View style={s.statsGrid}>
        <View style={[s.statCard, { backgroundColor: '#EDF6FF' }]}>
          <Text style={s.statValue}>{stats.products}</Text>
          <Text style={[s.statLabel, { color: '#1890FF' }]}>Fleurs au catalogue</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: '#FFF7ED' }]}>
          <Text style={s.statValue}>{stats.pending}</Text>
          <Text style={[s.statLabel, { color: '#FFA940' }]}>En attente</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: '#F0FFF4' }]}>
          <Text style={s.statValue}>{stats.orders}</Text>
          <Text style={[s.statLabel, { color: '#52C41A' }]}>Total commandes</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: '#FDF0F5' }]}>
          <Text style={[s.statValue, { fontSize: 16 }]}>{stats.revenue.toLocaleString()}</Text>
          <Text style={[s.statLabel, { color: '#D4849A' }]}>Ar encaissés</Text>
        </View>
      </View>

      {/* Quick actions */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Actions rapides</Text>
        <View style={s.actionsRow}>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('Catalogue')}>
            <Text style={s.actionIcon}>🌸</Text>
            <Text style={s.actionLabel}>Ajouter une fleur</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('Commandes')}>
            <Text style={s.actionIcon}>📋</Text>
            <Text style={s.actionLabel}>Voir commandes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent orders */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Commandes récentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Commandes')}>
            <Text style={s.seeAll}>Voir tout →</Text>
          </TouchableOpacity>
        </View>

        {recentOrders.length === 0
          ? <Text style={s.noOrders}>Aucune commande pour le moment.</Text>
          : recentOrders.map(order => (
              <View key={order.id} style={s.orderRow}>
                <View style={s.orderAvatar}>
                  <Text style={s.orderAvatarText}>{order.client.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.orderClient}>{order.client.name}</Text>
                  <Text style={s.orderMeta}>{order.items.length} article{order.items.length > 1 ? 's' : ''} · {order.total.toLocaleString()} Ar</Text>
                </View>
                <View style={[s.orderStatus, { backgroundColor: (statusColor[order.status] || '#ccc') + '20' }]}>
                  <Text style={[s.orderStatusText, { color: statusColor[order.status] || '#888' }]}>
                    {statusLabel[order.status] || order.status}
                  </Text>
                </View>
              </View>
            ))
        }
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F6FB' },
  header: {
    backgroundColor: '#1E2A5E', padding: 24, paddingTop: 48,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'
  },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  shopName: { color: '#fff', fontSize: 24, fontWeight: '300', letterSpacing: 2 },
  date: { color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'right' },
  alert: {
    margin: 16, backgroundColor: '#FFF7ED', borderRadius: 14,
    padding: 14, flexDirection: 'row', alignItems: 'center',
    borderLeftWidth: 4, borderLeftColor: '#FFA940'
  },
  alertIcon: { fontSize: 20, marginRight: 10 },
  alertText: { flex: 1, fontSize: 14, color: '#B45309', fontWeight: '500' },
  alertArrow: { color: '#FFA940', fontWeight: '700', fontSize: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  statCard: { flex: 1, minWidth: '45%', borderRadius: 16, padding: 16 },
  statValue: { fontSize: 28, fontWeight: '700', color: '#1E2A5E', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '500' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1E2A5E', marginBottom: 12 },
  seeAll: { fontSize: 13, color: '#8898C0' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 18,
    alignItems: 'center',
    shadowColor: '#1E2A5E', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3
  },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionLabel: { fontSize: 13, color: '#1E2A5E', fontWeight: '500', textAlign: 'center' },
  noOrders: { fontSize: 14, color: '#A0B0C8', textAlign: 'center', padding: 20 },
  orderRow: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
    shadowColor: '#1E2A5E', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  orderAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#BDD7EE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  orderAvatarText: { fontSize: 18, fontWeight: '600', color: '#1E2A5E' },
  orderClient: { fontSize: 14, fontWeight: '600', color: '#1E2A5E' },
  orderMeta: { fontSize: 12, color: '#A0B0C8', marginTop: 2 },
  orderStatus: { borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
  orderStatusText: { fontSize: 11, fontWeight: '600' },
});
