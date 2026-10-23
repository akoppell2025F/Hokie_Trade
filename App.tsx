import React, { useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, TextInput,
  TouchableOpacity, ScrollView,
} from 'react-native';

// new vt email check
import { isVtEmail } from './validateEmail';

type Listing = {
  id: number;
  emoji: string;
  title: string;
  course: string;
  price: number;
  seller: string;
  desc: string;
};

const listings: Listing[] = [
  { id: 0, emoji: '📘', title: 'CS 3704 Software Engineering Textbook', course: 'CS 3704', price: 45, seller: 'Jordan Carter', desc: 'Used one semester, no highlighting, matches current edition.' },
  { id: 1, emoji: '🛋️', title: 'Mini Fridge — dorm size', course: '', price: 60, seller: 'Maria Lopez', desc: '3.2 cu ft, barely used, pickup near West AJ.' },
  { id: 2, emoji: '📐', title: 'MATH 2114 Notes + Old Exams', course: 'MATH 2114', price: 15, seller: 'Sam Patel', desc: 'Full semester of notes plus two practice exams, PDF delivery.' },
];

type Screen = 'login' | 'verify' | 'browse' | 'detail' | 'thread' | 'rating';
type Message = { from: 'me' | 'them'; text: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [code, setCode] = useState('');
  const [query, setQuery] = useState('');
  const [activeListing, setActiveListing] = useState<Listing | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { from: 'them', text: 'Hey! Yes the item is still available.' },
    { from: 'me', text: 'Great, does Friday afternoon work to meet up?' },
  ]);
  const [draft, setDraft] = useState('');
  const [rating, setRating] = useState(0);

  const filtered = listings.filter(l =>
    !query ||
    l.course.toLowerCase().includes(query.toLowerCase()) ||
    l.title.toLowerCase().includes(query.toLowerCase())
  );

  const openListing = (l: Listing) => {
    setActiveListing(l);
    setScreen('detail');
  };

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages(prev => [...prev, { from: 'me', text: draft }]);
    setDraft('');
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'them', text: 'Sounds good, see you then!' }]);
    }, 600);
  };
     // New VT Email Check
    const handleSendCode = () => {
    const trimmed = email.trim();
    if (!isVtEmail(email)) {
      setEmailError('Enter a valid VT email ending in @vt.edu to get a code.');
      return;
    }
    setEmail(trimmed);
    setEmailError('');
    setScreen('verify');
  };

  // ---------- LOGIN ----------
  if (screen === 'login') {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <View style={styles.hero}>
          <Text style={styles.wordmark}>Hokie<Text style={{ color: '#F2A65A' }}>Trade</Text></Text>
          <Text style={styles.tagline}>Buy, sell, and trade with verified VT students.</Text>

          <Text style={styles.fieldLabel}>VT Email</Text>
          <TextInput
            style={[styles.field, emailError ? styles.fieldError : null]}
            placeholder="yourname@vt.edu"
            placeholderTextColor="#D9B9A6"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(t) => { setEmail(t); if (emailError) setEmailError(''); }}
          />
          <Text style={styles.hint}>Must end in @vt.edu — that's how we verify you're a Hokie.</Text>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <TouchableOpacity style={styles.btn} onPress={handleSendCode}>
            <Text style={styles.btnText}>Send code</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- VERIFY CODE ----------
  if (screen === 'verify') {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <View style={styles.hero}>
          <Text style={styles.wordmark}>Check your inbox</Text>
          <Text style={styles.tagline}>We sent a 6-digit code to {email}.</Text>
          <Text style={styles.fieldLabel}>Verification code</Text>
          <TextInput
            style={styles.field}
            placeholder="123456"
            placeholderTextColor="#D9B9A6"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
            maxLength={6}
          />
          <TouchableOpacity style={styles.btn} onPress={() => setScreen('browse')}>
            <Text style={styles.btnText}>Verify</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('login')}>
            <Text style={styles.linkText}>← Use a different email</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- BROWSE ----------
  if (screen === 'browse') {
    return (
      <SafeAreaView style={styles.browseContainer}>
        <View style={styles.topbar}>
          <Text style={styles.wordmarkSmall}>Hokie<Text style={{ color: '#F2A65A' }}>Trade</Text></Text>
        </View>
        <View style={{ padding: 20, flex: 1 }}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search course number, e.g. CS 3704"
            value={query}
            onChangeText={setQuery}
          />
          <ScrollView style={{ marginTop: 16 }}>
            {filtered.map(l => (
              <TouchableOpacity key={l.id} style={styles.card} onPress={() => openListing(l)}>
                <Text style={{ fontSize: 28 }}>{l.emoji}</Text>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.cardTitle}>{l.title}</Text>
                  <Text style={styles.cardMeta}>{l.seller}</Text>
                  <Text style={styles.cardPrice}>${l.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- DETAIL ----------
  if (screen === 'detail' && activeListing) {
    return (
      <SafeAreaView style={styles.browseContainer}>
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => setScreen('browse')}>
            <Text style={styles.backArrow}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 16 }}>{activeListing.emoji}</Text>
          <Text style={styles.detailTitle}>{activeListing.title}</Text>
          <Text style={styles.detailPrice}>${activeListing.price}</Text>
          <Text style={styles.detailDesc}>{activeListing.desc}</Text>
          <View style={styles.sellerRow}>
            <View style={styles.avatar}>
              <Text style={{ color: '#FBF6F1', fontWeight: '800' }}>
                {activeListing.seller.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontWeight: '700' }}>{activeListing.seller}</Text>
              <Text style={{ color: '#6A5750', fontSize: 13 }}>✓ Verified @vt.edu</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.btn} onPress={() => setScreen('thread')}>
            <Text style={styles.btnText}>Contact Seller</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- MESSAGE THREAD ----------
  if (screen === 'thread' && activeListing) {
    return (
      <SafeAreaView style={styles.browseContainer}>
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => setScreen('detail')}>
            <Text style={styles.backArrow}>← {activeListing.seller}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ padding: 20, flex: 1 }}>
          {messages.map((m, i) => (
            <View
              key={i}
              style={[styles.bubble, m.from === 'me' ? styles.bubbleMe : styles.bubbleThem]}
            >
              <Text style={{ color: m.from === 'me' ? '#FBF6F1' : '#231512' }}>{m.text}</Text>
            </View>
          ))}
          <View style={styles.safeSpot}>
            <Text style={{ fontWeight: '700', fontSize: 13 }}>📍 Suggested safe meetup spot</Text>
            <Text style={{ color: '#6A5750', fontSize: 13 }}>Newman Library, main entrance</Text>
          </View>
        </ScrollView>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.msgInput}
            placeholder="Type a message…"
            value={draft}
            onChangeText={setDraft}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>➤</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.btn, { margin: 20 }]} onPress={() => setScreen('rating')}>
          <Text style={styles.btnText}>Trade complete — rate it</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ---------- RATING ----------
  if (screen === 'rating' && activeListing) {
    return (
      <SafeAreaView style={styles.browseContainer}>
        <View style={styles.topbar}>
          <Text style={styles.wordmarkSmall}>Rate your trade</Text>
        </View>
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ fontWeight: '700', marginTop: 20 }}>
            How was your trade with {activeListing.seller}?
          </Text>
          <View style={{ flexDirection: 'row', marginVertical: 20 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} onPress={() => setRating(n)}>
                <Text style={{ fontSize: 36, color: n <= rating ? '#F2A65A' : '#E6D9CE' }}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.btn} onPress={() => setScreen('browse')}>
            <Text style={styles.btnText}>Submit Rating</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  loginContainer: { flex: 1, backgroundColor: '#7A1B3A' },
  hero: { flex: 1, justifyContent: 'center', padding: 32, gap: 6 },
  wordmark: { fontSize: 34, fontWeight: '800', color: '#FBF6F1', marginBottom: 4 },
  wordmarkSmall: { fontSize: 20, fontWeight: '800', color: '#FBF6F1' },
  tagline: { fontSize: 15, color: '#F0DCC9', marginBottom: 18 },
  fieldLabel: { fontSize: 13, color: '#F0DCC9', marginBottom: 6 },
  field: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    padding: 14,
    color: '#FBF6F1',
    fontSize: 16,
  },
  fieldError: { borderColor: '#E5751F' },
  hint: { fontSize: 12, color: '#D9B9A6', marginTop: 6 },
  errorText: { fontSize: 12, color: '#F2A65A', marginTop: 6, fontWeight: '700' },
  btn: { backgroundColor: '#E5751F', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 18 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkText: { color: '#F0DCC9', fontSize: 13, textAlign: 'center', marginTop: 16 },
  browseContainer: { flex: 1, backgroundColor: '#FBF6F1' },
  topbar: { backgroundColor: '#7A1B3A', padding: 20 },
  backArrow: { color: '#FBF6F1', fontWeight: '700' },
  searchInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6D9CE', borderRadius: 12, padding: 14, fontSize: 15 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6D9CE', borderRadius: 16, padding: 14, marginBottom: 12, alignItems: 'center' },
  cardTitle: { fontWeight: '700', fontSize: 15 },
  cardMeta: { color: '#6A5750', fontSize: 13, marginTop: 2 },
  cardPrice: { color: '#7A1B3A', fontWeight: '800', fontSize: 15, marginTop: 4 },
  detailTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  detailPrice: { fontSize: 22, fontWeight: '800', color: '#7A1B3A', marginBottom: 12 },
  detailDesc: { fontSize: 15, color: '#3A2A26', lineHeight: 22, marginBottom: 16 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6D9CE', borderRadius: 14, padding: 14, marginBottom: 20 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7A1B3A', alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '78%', padding: 12, borderRadius: 16, marginBottom: 10 },
  bubbleThem: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6D9CE', alignSelf: 'flex-start' },
  bubbleMe: { backgroundColor: '#7A1B3A', alignSelf: 'flex-end' },
  safeSpot: { backgroundColor: '#F2ECE4', borderWidth: 1, borderColor: '#E6D9CE', borderRadius: 14, padding: 14, marginTop: 10 },
  inputRow: { flexDirection: 'row', padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: '#E6D9CE' },
  msgInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6D9CE', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7A1B3A', alignItems: 'center', justifyContent: 'center' },
});