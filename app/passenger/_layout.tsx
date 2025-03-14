import { ReactNode } from "react";
import CustomTabs from "@/src/components/common/CustomTabs";
import { View } from "react-native";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme/ThemeContext";
import TopTabs from "@/src/components/passenger/TopTabs";

export default function MainLayout() {
    const { colors } = useTheme();
    const topTabs = [
        { name: "/", title: "NILO", icon: "car-outline" },
        { name: "/rental", title: "NILO Rental", icon: "trail-sign-outline" }
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={["top", "bottom"]} >
            <TopTabs tabs={topTabs as any} />
            <View style={{ flex: 1 }}>
                <Slot />
            </View>
            <CustomTabs
                tabs={[
                    { name: "/passenger", title: "Inicio", icon: "home" },
                    { name: "/profile", title: "Perfil", icon: "person" },
                    { name: "/settings", title: "Ajustes", icon: "settings" },
                ]}
            />
        </SafeAreaView>
    );
}
