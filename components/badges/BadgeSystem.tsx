import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { View, Text, Pressable, Modal } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { styles } from "@/styles/App.styles";

// The Badge structure
type Badge = {
  id: string;
  title: string;
  description?: string;
  awardedAt: number; // Date.now()
};

// The badge context: where it lives
type BadgeContextValue = {
  badges: Record<string, Badge>;
  hasBadge: (id: string) => boolean;
  awardBadge: (badge: Omit<Badge, "awardedAt">) => Promise<boolean>; // returns true if newly awarded
  clearBadges: () => Promise<void>;
  lastUnlocked: Badge | null;
  dismissToast: () => void;
};

// We store the badges
const STORAGE_KEY = "badges.v1";
const BadgeContext = createContext<BadgeContextValue | null>(null);

export function BadgeProvider({ children }: { children: React.ReactNode }) {
  const [badges, setBadges] = useState<Record<string, Badge>>({});
  const [lastUnlocked, setLastUnlocked] = useState<Badge | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Record<string, Badge>;
        setBadges(parsed ?? {});
      } catch (e) {
        console.warn("[badges] failed to load from storage:", e);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Record<string, Badge>) => {
    setBadges(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const hasBadge = useCallback((id: string) => !!badges[id], [badges]);

  const awardBadge: BadgeContextValue["awardBadge"] = useCallback(
    async (badge) => {
      if (__DEV__) console.log("[badges] awarding", badge.id);

      if (badges[badge.id]) return false;
      const full: Badge = { ...badge, awardedAt: Date.now() };
      const next = { ...badges, [badge.id]: full };

      await persist(next);

      setLastUnlocked(full);
      return true;
    },
    [badges, persist],
  );

  const clearBadges = useCallback(async () => {
    setBadges({});
    setLastUnlocked(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const dismissToast = useCallback(() => {
    setLastUnlocked(null);
  }, []);

  const value = useMemo(
    () => ({
      badges,
      hasBadge,
      awardBadge,
      clearBadges,
      lastUnlocked,
      dismissToast,
    }),
    [badges, lastUnlocked, dismissToast, hasBadge, awardBadge, clearBadges],
  );

  return (
    <BadgeContext.Provider value={value}>
      {children}
      <BadgeToast />
    </BadgeContext.Provider>
  );
}

export function useBadges() {
  const ctx = useContext(BadgeContext);
  if (!ctx) throw new Error("useBadges must be used within BadgeProvider");
  return ctx;
}

// The badge as a toast
function BadgeToast() {
  const ctx = useContext(BadgeContext);
  if (!ctx) return null;
  const { lastUnlocked, dismissToast } = ctx;
  if (!lastUnlocked) return null;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={!!lastUnlocked}
      onRequestClose={dismissToast}
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable
          onPress={dismissToast}
          accessibilityRole="button"
          accessibilityLabel={`Badge unlocked: ${lastUnlocked.title}. Tap to dismiss.`}
          accessibilityHint="Tap to dismiss this notification"
          style={[styles.badgeToast]}
	  testID="badge-toast"
        >
          <Text style={[styles.badgeToastTitle]}>
            Badge Unlocked: {lastUnlocked.title}
          </Text>
          {!!lastUnlocked.description && (
            <Text style={[styles.badgeToastDescription]}>
              {lastUnlocked.description}
            </Text>
          )}
          <Text style={[styles.badgeToastDismiss]}>Tap to dismiss</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

// In order to list the badges
export function BadgeList() {
  const { badges } = useBadges();
  const all = Object.values(badges).sort((a, b) => b.awardedAt - a.awardedAt);

  if (all.length === 0) {
    return <Text style={styles.badgeNone}>No badges yet.</Text>;
  }

  return (
    <View style={{ gap: 10 }}>
      {all.map((b) => (
        <View key={b.id} style={styles.badgeListIn}>
          <Text style={styles.badgeListInText}>{b.title}</Text>
          {!!b.description && (
            <Text style={styles.badgeListInDesc}>{b.description}</Text>
          )}
        </View>
      ))}
    </View>
  );
}
