// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OWNER_PASSWORD = 'elsflower2025'; // ← change ce mot de passe

export default function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleLogin = async () => {
    if (!password) { Alert.alert('Erreur', 'Entrez le mot de passe'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (password === OWNER_PASSWORD) {
      await AsyncStorage.setItem('elsflower_auth', 'true');
      onLogin();
    } else {
      Alert.alert('Mot de passe incorrect', 'Veuillez réessayer.');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.card}>
        <Text style={s.flower}>🌸</Text>
        <Text style={s.title}>EL'S FLOWER</Text>
        <Text style={s.sub}>Application de la gérante</Text>

        <View style={s.inputWrap}>
          <TextInput
            style={s.input}
            placeholder="Mot de passe"
            placeholderTextColor="#8898C0"
            secureTextEntry={!show}
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity style={s.eyeBtn} onPress={() => setShow(!show)}>
            <Text style={s.eyeIcon}>{show ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Se connecter</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#BDD7EE', justifyContent: 'center', alignItems: 'center' },
  card: {
    width: '85%', backgroundColor: '#fff',
    borderRadius: 24, padding: 32,
    alignItems: 'center',
    shadowColor: '#1E2A5E', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10
  },
  flower: { fontSize: 48, marginBottom: 12 },
  title: { fontFamily: 'serif', fontSize: 28, fontWeight: '300', color: '#1E2A5E', letterSpacing: 2 },
  sub: { fontSize: 13, color: '#8898C0', marginTop: 4, marginBottom: 32, letterSpacing: 0.5 },
  inputWrap: { width: '100%', position: 'relative', marginBottom: 16 },
  input: {
    width: '100%', height: 52, borderWidth: 1.5,
    borderColor: '#D8E4F0', borderRadius: 12,
    paddingHorizontal: 16, paddingRight: 48,
    fontSize: 15, color: '#1E2A5E', backgroundColor: '#F7FAFD'
  },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  eyeIcon: { fontSize: 20 },
  btn: {
    width: '100%', height: 52, backgroundColor: '#1E2A5E',
    borderRadius: 50, justifyContent: 'center', alignItems: 'center',
    marginTop: 8
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '500', letterSpacing: 1.5, textTransform: 'uppercase' }
});
