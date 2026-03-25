import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DECK_COLORS } from '../lib/types';

interface ColorPickerProps {
  selected: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <View style={styles.container}>
      {DECK_COLORS.map((color) => (
        <Pressable
          key={color}
          style={[styles.swatch, { backgroundColor: color }]}
          onPress={() => onSelect(color)}
        >
          {selected === color && (
            <Ionicons name="checkmark" size={18} color="#fff" />
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
