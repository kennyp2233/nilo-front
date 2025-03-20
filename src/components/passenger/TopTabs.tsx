// src/components/passenger/TopTabs.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/src/components/ui";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type TopTabItem = {
    name: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
    tabs: TopTabItem[];
};

export default function TopTabs({ tabs }: Props) {
    const { colors } = useTheme();
    const router = useRouter();
    const pathname = usePathname();

    return (
        <View style={[styles.container, { borderBottomColor: colors.border }]}>
            {tabs.map((tab) => {
                const isActive = pathname.startsWith(tab.name);
                return (
                    <TouchableOpacity
                        key={tab.name}
                        style={[
                            styles.tab,
                            { borderBottomColor: isActive ? colors.primary : "transparent" }
                        ]}
                        onPress={() => router.push(tab.name as any)}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={20}
                            color={isActive ? colors.primary : colors.text.secondary}
                        />
                        <Text
                            variant="subtitle"
                            weight={isActive ? "semibold" : "normal"}
                            color={isActive ? "accent" : "secondary"}
                            style={styles.tabText}
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
        width: SCREEN_WIDTH,
        borderBottomWidth: 1
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        paddingVertical: 16,
        borderBottomWidth: 2
    },
    tabText: {
        fontSize: 16,
    }
});