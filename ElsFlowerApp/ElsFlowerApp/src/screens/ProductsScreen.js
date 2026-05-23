// src/screens/ProductsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, TextInput, Modal, Alert, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', imgUri: null });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('produits')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }, err => { console.error(err); setLoading(false); });
    return () => unsubscribe();
  }, []);

  const openAdd = () => { setEditProduct(null); setForm({ name: '', price: '', imgUri: null }); setModalVisible(true); };
  const openEdit = (p) => { setEditProduct(p); setForm({ name: p.name, price: String(p.price), imgUri: p.img || null }); setModalVisible(true); };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (res) => {
      if (res.assets?.[0]) setForm(f => ({ ...f, imgUri: res.assets[0].uri }));
    });
  };

  const uploadImage = async (uri, id) => {
    if (!uri || uri.startsWith('https://')) return uri;
    const ref = storage().ref(`produits/${id}.jpg`);
    await ref.putFile(uri);
    return await ref.getDownloadURL();
  };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Erreur', 'Entrez le nom de la fleur'); return; }
    if (!form.price || isNaN(form.price)) { Alert.alert('Erreur', 'Entrez un prix valide'); return; }
    setSaving(true);
    try {
      if (editProduct) {
        const imgUrl = await uploadImage(form.imgUri, editProduct.id);
        await firestore().collection('produits').doc(editProduct.id).update({
          name: form.name.trim(), price: parseInt(form.price),
          img: imgUrl || editProduct.img || null,
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
      } else {
        const docRef = await firestore().collection('produits').add({
          name: form.name.trim(), price: parseInt(form.price),
          img: null, createdAt: firestore.FieldValue.serverTimestamp()
        });
        if (form.imgUri) {
          const imgUrl = await uploadImage(form.imgUri, docRef.id);
          await docRef.update({ img: imgUrl });
        }
      }
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder. Vérifiez votre connexion.');
    }
    setSaving(false);
  };

  const handleDelete = (p) => {
    Alert.alert('Supprimer', `Supprimer "${p.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => firestore().collection('produits').doc(p.id).delete() }
    ]);
  };

  const renderProduct = ({ item }) => (
    <View style={s.card}>
      <View style={s.cardImg}>
        {item.img ? <Image source={{ uri: item.img }} style={s.img} /> : <Text style={{ fontSize: 28 }}>🌸</Text>}
      </View>
      <View style={s.cardInfo}>
        <Text style={s.cardName}>{item.name}</Text>
        <Text style={s.cardPrice}>{item.price?.toLocaleString('fr-MG')} Ar</Text>
      </View>
      <View style={s.cardActions}>
        <TouchableOpacity style={s.editBtn} onPress={() => openEdit(item)}><Text>✏️</Text></TouchableOpacity>
        <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item)}><Text>🗑️</Text></TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return (
    <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color="#1E2A5E" />
      <Text style={{ marginTop: 12, color: '#8898C0' }}>Chargement…</Text>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Catalogue ({products.length})</Text>
        <TouchableOpacity style={s.addBtn} onPress={openAdd}>
          <Text style={s.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>
      {products.length === 0
        ? <View style={s.empty}><Text style={{ fontSize: 56 }}>🌱</Text><Text style={s.emptyText}>Aucune fleur.{'\n'}Appuyez sur "+ Ajouter" !</Text></View>
        : <FlatList data={products} keyExtractor={i => i.id} renderItem={renderProduct} contentContainerStyle={{ padding: 16 }} />
      }

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editProduct ? 'Modifier' : 'Nouvelle fleur'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{ fontSize: 18, color: '#8898C0' }}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={s.imgPicker} onPress={pickImage}>
                {form.imgUri
                  ? <Image source={{ uri: form.imgUri }} style={{ width: '100%', height: 200 }} />
                  : <View style={{ alignItems: 'center', padding: 32 }}><Text style={{ fontSize: 36 }}>📷</Text><Text style={{ marginTop: 8, color: '#8898C0' }}>Choisir une photo</Text></View>
                }
              </TouchableOpacity>
              {form.imgUri && <TouchableOpacity style={{ alignItems: 'center', marginBottom: 12 }} onPress={pickImage}><Text style={{ color: '#1E2A5E', textDecorationLine: 'underline' }}>Changer la photo</Text></TouchableOpacity>}
              <Text style={s.label}>Nom de la fleur *</Text>
              <TextInput style={s.input} placeholder="Ex: Rose rouge…" placeholderTextColor="#A0B0C8" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
              <Text style={s.label}>Prix (Ariary) *</Text>
              <TextInput style={s.input} placeholder="Ex: 5000" placeholderTextColor="#A0B0C8" keyboardType="numeric" value={form.price} onChangeText={v => setForm(f => ({ ...f, price: v }))} />
              <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>{editProduct ? 'Enregistrer' : 'Ajouter au catalogue'}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F6FB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0ECF7' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1E2A5E' },
  addBtn: { backgroundColor: '#1E2A5E', borderRadius: 50, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 15, color: '#8898C0', textAlign: 'center', lineHeight: 24, marginTop: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  cardImg: { width: 64, height: 64, borderRadius: 12, overflow: 'hidden', backgroundColor: '#DFF0FC', justifyContent: 'center', alignItems: 'center' },
  img: { width: '100%', height: '100%' },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardName: { fontSize: 16, fontWeight: '500', color: '#1E2A5E', marginBottom: 4 },
  cardPrice: { fontSize: 14, color: '#D4849A', fontWeight: '500' },
  cardActions: { flexDirection: 'row', gap: 8 },
  editBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF5FB', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF0F0', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '600', color: '#1E2A5E' },
  imgPicker: { borderRadius: 16, overflow: 'hidden', marginBottom: 12, backgroundColor: '#EEF5FB', minHeight: 160, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 12, fontWeight: '500', color: '#8898C0', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1.5, borderColor: '#D8E4F0', borderRadius: 12, padding: 14, fontSize: 15, color: '#1E2A5E', backgroundColor: '#F7FAFD' },
  saveBtn: { backgroundColor: '#1E2A5E', borderRadius: 50, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 16 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' }
});
