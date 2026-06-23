import { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const QUOTES = [
  { text: 'Be yourself; everyone else is already taken.', author: 'Oscar Wilde' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'Do not watch the clock; do what it does. Keep going.', author: 'Sam Levenson' },
  { text: 'The only impossible journey is the one you never begin.', author: 'Tony Robbins' },
];

export default function App() {
  const [index, setIndex] = useState(0);

  const nextQuote = () => {
    setIndex(Math.floor(Math.random() * QUOTES.length));
  };

  const q = QUOTES[index];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>💡 Daily Quotes</Text>
        <View style={styles.quoteBox}>
          <Text style={styles.quote}>"{q.text}"</Text>
          <Text style={styles.author}>— {q.author}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={nextQuote}>
          <Text style={styles.buttonText}>Get New Quote</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Quote #{index + 1} of {QUOTES.length}</Text>
        <StatusBar style="auto" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 12 },
  quoteBox: { padding: 18, borderRadius: 8, backgroundColor: '#f6f8fa', width: '100%', alignItems: 'center' },
  quote: { fontSize: 18, fontStyle: 'italic', textAlign: 'center', lineHeight: 26 },
  author: { fontSize: 14, textAlign: 'right', width: '100%', marginTop: 12 },
  button: { marginTop: 18, backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  footer: { marginTop: 12, color: '#666' },
});
