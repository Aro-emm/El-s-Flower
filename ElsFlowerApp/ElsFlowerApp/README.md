# 🌸 EL'S FLOWER — Application Android (Gérante)

## Ce que fait cette app

Application mobile **exclusive à la gérante** pour :
- 📦 Gérer le catalogue de fleurs (ajouter, modifier, supprimer)
- 📋 Recevoir et traiter les commandes en temps réel
- 🔔 Notifications push + WhatsApp automatique pour chaque commande
- 📊 Tableau de bord avec statistiques

---

## 📱 GUIDE D'INSTALLATION COMPLET

### Étape 1 — Installer les outils nécessaires (sur PC/Mac)

1. **Installer Node.js** (version 18+)
   → https://nodejs.org

2. **Installer Java JDK 17**
   → https://adoptium.net/temurin/releases/?version=17

3. **Installer Android Studio**
   → https://developer.android.com/studio
   - Dans Android Studio : SDK Manager → installer Android SDK Platform 33
   - Configurer la variable d'environnement `ANDROID_HOME`

4. **Installer React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

---

### Étape 2 — Configurer le projet

1. **Ouvrir un terminal dans le dossier du projet**

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Firebase** (optionnel pour version locale, requis pour sync en ligne)
   - Créer un projet sur https://console.firebase.google.com
   - Ajouter une application Android avec le package `com.elsflower`
   - Télécharger `google-services.json` et le placer dans `android/app/`
   - Modifier `src/utils/firebase.js` avec tes vraies clés

---

### Étape 3 — Compiler l'APK

#### Mode Debug (pour tester)
```bash
cd android
./gradlew assembleDebug
```
→ APK produit dans : `android/app/build/outputs/apk/debug/app-debug.apk`

#### Mode Release (version finale)
```bash
# 1. Générer une clé de signature (une seule fois)
keytool -genkey -v -keystore elsflower.keystore -alias elsflower -keyalg RSA -keysize 2048 -validity 10000

# 2. Placer elsflower.keystore dans android/app/

# 3. Compiler
cd android
./gradlew assembleRelease
```
→ APK produit dans : `android/app/build/outputs/apk/release/app-release.apk`

---

### Étape 4 — Installer l'APK sur le téléphone

1. Transférer le fichier `.apk` sur le téléphone (WhatsApp, câble USB, Google Drive…)
2. Sur le téléphone Android : **Paramètres → Sécurité → Autoriser les sources inconnues**
3. Ouvrir le fichier `.apk` et appuyer sur **Installer**

---

## 🔐 Connexion à l'app

**Mot de passe par défaut :** `elsflower2025`

Pour changer le mot de passe : modifier la ligne dans `src/screens/LoginScreen.js` :
```js
const OWNER_PASSWORD = 'ton_nouveau_mot_de_passe';
```

---

## 📲 Fonctionnement des notifications

### Notification in-app (push)
- Apparaît automatiquement dès qu'une commande est passée sur le site web
- Fonctionne même si l'app est en arrière-plan

### WhatsApp automatique
- Dans `src/utils/notifications.js`, le numéro de la gérante est configuré :
  ```js
  const OWNER_PHONE = '261323751017';
  ```
- Le message WhatsApp s'envoie automatiquement avec tous les détails de la commande

---

## 🔗 Connexion avec le site web

### Version locale (sans Firebase)
Le site web et l'app utilisent `localStorage` pour stocker les données.
⚠️ Dans cette configuration, le site et l'app doivent être sur le **même appareil**.

### Version connectée (avec Firebase) — RECOMMANDÉE
1. Configurer Firebase comme expliqué à l'Étape 2
2. Les données sont synchronisées en temps réel entre le site et l'app
3. La gérante reçoit les commandes instantanément, où qu'elle soit

---

## 📁 Structure du projet

```
ElsFlowerApp/
├── App.js                          ← Point d'entrée, navigation
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js          ← Écran de connexion sécurisé
│   │   ├── DashboardScreen.js      ← Tableau de bord + statistiques
│   │   ├── ProductsScreen.js       ← Gestion du catalogue
│   │   └── OrdersScreen.js         ← Gestion des commandes
│   └── utils/
│       ├── firebase.js             ← Configuration Firebase
│       └── notifications.js        ← Push + WhatsApp
└── android/                        ← Projet Android natif
```

---

## ❓ Problèmes courants

**"SDK not found"**
→ Vérifier que `ANDROID_HOME` pointe vers ton dossier Android SDK

**"Gradle build failed"**
→ Essayer `cd android && ./gradlew clean` puis relancer

**WhatsApp ne s'ouvre pas**
→ WhatsApp doit être installé sur le téléphone de la gérante

**L'app ne reçoit pas les commandes du site**
→ Configurer Firebase pour la synchronisation en temps réel (voir Étape 2)
