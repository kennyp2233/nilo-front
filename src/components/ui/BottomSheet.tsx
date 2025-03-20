// src/components/BottomSheetContainer.tsx
import React, { useCallback, useRef, useMemo } from "react";
import { StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@/src/theme/ThemeContext";

interface BottomSheetContainerProps {
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
    children: React.ReactNode;
}

const BottomSheetContainer: React.FC<BottomSheetContainerProps> = ({
    expanded,
    onExpandedChange,
    children
}) => {
    const { colors } = useTheme();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["15%", "75%"], []);

    const handleSheetChanges = useCallback(
        (index: number) => {
            onExpandedChange(index === 1);
        },
        [onExpandedChange]
    );

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={expanded ? 1 : 0}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            enablePanDownToClose={false}
            handleIndicatorStyle={styles.handleIndicator}
            backgroundStyle={{ backgroundColor: colors.background.primary }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <BottomSheetView style={styles.contentContainer}>
                    {children}
                </BottomSheetView>
            </KeyboardAvoidingView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 16
    },
    handleIndicator: {
        width: 40,
        height: 4,
        backgroundColor: "#CCCCCC",
        borderRadius: 2
    }
});

export default BottomSheetContainer;
