import { ReactNode } from "react";
import CustomTabs from "@/components/common/CustomTabs";
import { View } from "react-native";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import TopTabs from "@/components/passenger/TopTabs";

export default function MainLayout() {
    const { colors } = useTheme();


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={["top", "bottom"]} >
       
            <View style={{ flex: 1 }}>
                <Slot />
            </View>
        
        </SafeAreaView>
    );
}
