import { useState, useEffect } from 'react';
import { View, Text, Pressable, Switch, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';
import { requestPermissions, scheduleDaily, cancelAll, getNotificationSettings } from '../lib/notifications';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function SettingsScreen() {
  const { colors, mode, toggle } = useTheme();
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [hour, setHour] = useState(20);
  const [minute, setMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    getNotificationSettings().then(s => {
      setNotifEnabled(s.enabled);
      setHour(s.hour);
      setMinute(s.minute);
    });
  }, []);

  const handleToggleNotif = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('Нет разрешения', 'Разрешите уведомления в настройках устройства');
        return;
      }
      await scheduleDaily(hour, minute);
      setNotifEnabled(true);
    } else {
      await cancelAll();
      setNotifEnabled(false);
    }
  };

  const handleTimeChange = async (h: number, m: number) => {
    setHour(h);
    setMinute(m);
    if (notifEnabled) {
      await scheduleDaily(h, m);
    }
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Настройки',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Theme */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ОФОРМЛЕНИЕ</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name={mode === 'dark' ? 'moon' : 'sunny'}
                size={22}
                color={colors.primary}
              />
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Тёмная тема</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  {mode === 'dark' ? 'Включена' : 'Выключена'}
                </Text>
              </View>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggle}
              trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Notifications */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>УВЕДОМЛЕНИЯ</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Напоминания</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  Ежедневное напоминание об изучении
                </Text>
              </View>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={handleToggleNotif}
              trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {notifEnabled && (
            <>
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              <Pressable style={styles.row} onPress={() => setShowTimePicker(!showTimePicker)}>
                <View style={styles.rowLeft}>
                  <Ionicons name="time-outline" size={22} color={colors.primary} />
                  <View>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>Время</Text>
                    <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                      {pad(hour)}:{pad(minute)}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={showTimePicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textMuted}
                />
              </Pressable>

              {showTimePicker && (
                <View style={styles.timePickerWrap}>
                  <View style={styles.timePicker}>
                    <ScrollView
                      style={[styles.timeCol, { borderColor: colors.border }]}
                      showsVerticalScrollIndicator={false}
                    >
                      {HOURS.map(h => (
                        <Pressable
                          key={h}
                          style={[
                            styles.timeItem,
                            h === hour && { backgroundColor: colors.primary + '20' },
                          ]}
                          onPress={() => handleTimeChange(h, minute)}
                        >
                          <Text style={[
                            styles.timeText,
                            { color: h === hour ? colors.primary : colors.textSecondary },
                            h === hour && { fontWeight: '700' },
                          ]}>
                            {pad(h)}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                    <Text style={[styles.timeSep, { color: colors.textMuted }]}>:</Text>
                    <ScrollView
                      style={[styles.timeCol, { borderColor: colors.border }]}
                      showsVerticalScrollIndicator={false}
                    >
                      {[0, 15, 30, 45].map(m => (
                        <Pressable
                          key={m}
                          style={[
                            styles.timeItem,
                            m === minute && { backgroundColor: colors.primary + '20' },
                          ]}
                          onPress={() => handleTimeChange(hour, m)}
                        >
                          <Text style={[
                            styles.timeText,
                            { color: m === minute ? colors.primary : colors.textSecondary },
                            m === minute && { fontWeight: '700' },
                          ]}>
                            {pad(m)}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Info */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>О ПРИЛОЖЕНИИ</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>CogniDeck</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  Версия 1.0.0 · Интервальное повторение
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSubtitle: { fontSize: 12, marginTop: 2 },
  separator: { height: 1, marginHorizontal: 16 },
  timePickerWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timeCol: {
    height: 160,
    width: 80,
    borderWidth: 1,
    borderRadius: 12,
  },
  timeItem: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  timeText: { fontSize: 18 },
  timeSep: { fontSize: 24, fontWeight: '700' },
});
