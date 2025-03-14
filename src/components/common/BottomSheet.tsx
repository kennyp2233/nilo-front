// BottomSheet.tsx
import React, { useEffect } from "react";
import { StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    WithSpringConfig,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface BottomSheetProps {
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
    expandedHeight: number;
    collapsedHeight: number;
    springConfig?: WithSpringConfig;
    children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
    expanded,
    onExpandedChange,
    expandedHeight,
    collapsedHeight,
    // Configuración de spring sugerida (ajústala según tus necesidades)
    springConfig = {
        damping: 30,
        stiffness: 300,
        mass: 1,
    },
    children,
}) => {
    const insets = useSafeAreaInsets();

    const MAX_TRANSLATE_Y = 0;
    // Se incorpora el inset inferior para que el sheet quede completamente oculto al colapsar
    const MIN_TRANSLATE_Y = expandedHeight - collapsedHeight + insets.bottom;

    // Calculamos el valor inicial según el estado "expanded"
    const initialPosition = expanded ? MAX_TRANSLATE_Y : MIN_TRANSLATE_Y;
    const translateY = useSharedValue(initialPosition);
    const startY = useSharedValue(initialPosition);

    const gesture = Gesture.Pan()
        .onStart(() => {
            // Acceso seguro dentro del worklet
            startY.value = translateY.value;
        })
        .onUpdate((event) => {
            const newTranslateY = startY.value + event.translationY;
            // Restringe el movimiento entre expandido (0) y colapsado (MIN_TRANSLATE_Y)
            translateY.value = Math.min(MIN_TRANSLATE_Y, Math.max(MAX_TRANSLATE_Y, newTranslateY));
        })
        .onEnd((event) => {
            // Umbral basado en posición y velocidad
            const threshold = Platform.OS === "ios" ? MIN_TRANSLATE_Y * 0.3 : MIN_TRANSLATE_Y / 2;
            const shouldExpand = event.velocityY < -500 || translateY.value < threshold;
            translateY.value = withSpring(
                shouldExpand ? MAX_TRANSLATE_Y : MIN_TRANSLATE_Y,
                springConfig,
                () => {
                    runOnJS(onExpandedChange)(shouldExpand);
                }
            );
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    useEffect(() => {
        translateY.value = withSpring(expanded ? MAX_TRANSLATE_Y : MIN_TRANSLATE_Y, springConfig);
    }, [expanded]);

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                style={[styles.container, animatedStyle, { height: expandedHeight }]}
            >
                {children}
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
        backgroundColor: "white",
        // Sombra para dar profundidad
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default BottomSheet;
