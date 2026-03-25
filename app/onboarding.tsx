import { useState, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, Dimensions, FlatList, Animated,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../lib/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: 'layers-outline' as const,
    title: 'Создавайте колоды',
    text: 'Организуйте знания по колодам, темам и подтемам. Каждая карточка — вопрос и ответ.',
    color: '#6366F1',
  },
  {
    icon: 'git-network-outline' as const,
    title: 'Граф знаний',
    text: 'Видите всю картину: какие темы усвоены, а какие требуют внимания. Размер и цвет подскажут.',
    color: '#38BDF8',
  },
  {
    icon: 'trending-up-outline' as const,
    title: 'Умное повторение',
    text: 'Алгоритм SM-2 подбирает интервалы: сложные карточки — чаще, лёгкие — реже.',
    color: '#34D399',
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleFinish = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    setTimeout(() => router.replace('/(tabs)'), 50);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentSlide + 1 });
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable style={styles.skipBtn} onPress={handleFinish}>
        <Text style={[styles.skipText, { color: colors.textMuted }]}>Пропустить</Text>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setCurrentSlide(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon} size={64} color={item.color} />
            </View>
            <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.slideText, { color: colors.textSecondary }]}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            );
          })}
        </View>

        <Pressable
          style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>
            {currentSlide === slides.length - 1 ? 'Начать' : 'Далее'}
          </Text>
          <Ionicons
            name={currentSlide === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
            size={20}
            color="#fff"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: { fontSize: 15, fontWeight: '500' },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    gap: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 16,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
