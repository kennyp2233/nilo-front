import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import type { RelativePathString } from "expo-router";

type TabItem = {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
  tabs: TabItem[];
  style?: object;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CustomTabs({ tabs, style }: Props) {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? colors.background.secondary
            : colors.background.primary,
          borderTopColor: colors.border
        },
        style
      ]}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => router.push(tab.name as RelativePathString)}
            style={[
              styles.tab,
              isActive && {
                backgroundColor: colors.primary
              }
            ]}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={isActive ? colors.background.primary : colors.text.secondary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: isActive ? colors.background.primary : colors.text.secondary
                }
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 60,
    width: SCREEN_WIDTH,
    borderTopWidth: 1,
    bottom: 0
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  tabText: {
    fontSize: 12,
    marginTop: 4
  }
});