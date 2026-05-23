// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import { setupNotifications } from './src/utils/notifications';

const Tab = createBottomTabNavigator();

function TabIcon({ icon, focused }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{icon}</Text>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setupNotifications();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const auth = await AsyncStorage.getItem('elsflower_auth');
    setIsLoggedIn(auth === 'true');
    setLoading(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('elsflower_auth');
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#BDD7EE' }}>
        <Text style={{ fontSize: 48 }}>🌸</Text>
        <ActivityIndicator color="#1E2A5E" style={{ marginTop: 16 }} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#E0ECF7',
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#1E2A5E',
          tabBarInactiveTintColor: '#A0B0C8',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
          headerStyle: { backgroundColor: '#fff', borderBottomColor: '#E0ECF7', borderBottomWidth: 1 },
          headerTitleStyle: { color: '#1E2A5E', fontSize: 17, fontWeight: '600' },
          headerRight: () => (
            <Text onPress={handleLogout} style={{ marginRight: 16, color: '#8898C0', fontSize: 13 }}>
              Déconnexion
            </Text>
          ),
        }}
      >
        <Tab.Screen
          name="Tableau de bord"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
            headerTitle: "EL'S FLOWER — Tableau de bord",
          }}
        />
        <Tab.Screen
          name="Catalogue"
          component={ProductsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="🌸" focused={focused} />,
            headerTitle: 'Gestion du Catalogue',
          }}
        />
        <Tab.Screen
          name="Commandes"
          component={OrdersScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
            headerTitle: 'Commandes',
            tabBarBadge: undefined, // sera mis à jour dynamiquement
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
