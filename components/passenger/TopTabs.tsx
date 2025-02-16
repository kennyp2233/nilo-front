import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type TopTabItem = {
    name: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap; // Definir que el icono será de Ionicons
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
                            style={[
                                styles.tabText,
                                {
                                    color: isActive ? colors.primary : colors.text.secondary,
                                    fontWeight: isActive ? "600" : "400"
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
        marginTop: 4 // Espacio entre el icono y el texto
    }
});
