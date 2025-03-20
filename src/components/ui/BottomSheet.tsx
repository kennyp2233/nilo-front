// src/components/ui/BottomSheet.tsx
import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, Dimensions, Platform, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    WithSpringConfig,
    interpolate,
    useAnimatedGestureHandler,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useTheme } from "@/src/theme/ThemeContext";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
    snapPoints?: number[]; // Array of heights in percentages (0-100)
    index?: number; // Initial snap point index
    onIndexChange?: (index: number) => void;
    springConfig?: WithSpringConfig;
    showHandle?: boolean;
    backdropOpacity?: number;
    children: React.ReactNode;
    enableBackdropDismiss?: boolean;
    enableDynamicSizing?: boolean;
    style?: any;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
    expanded,
    onExpandedChange,
    snapPoints = [25, 50, 90],
    index = 0,
    onIndexChange,
    springConfig = {
        damping: 30,
        stiffness: 300,
        mass: 1,
        overshootClamping: false,
    },
    showHandle = true,
    backdropOpacity = 0.5,
    children,
    enableBackdropDismiss = true,
    enableDynamicSizing = false,
    style,
}) => {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    // Convert snap points from percentages to actual pixel values
    const snapPointsPixels = useMemo(() =>
        snapPoints.map(point => (point / 100) * SCREEN_HEIGHT),
        [snapPoints]);

    // Get maximum translationY (fully collapsed state)
    const MAX_TRANSLATE_Y = 0;
    const MIN_TRANSLATE_Y = -snapPointsPixels[snapPointsPixels.length - 1];

    // Animation values
    const translateY = useSharedValue(0);
    const active = useSharedValue(false);
    const initialSnap = useSharedValue(0);

    // Update state when index or expanded prop changes
    useEffect(() => {
        if (expanded) {
            const snapIndex = Math.min(snapPointsPixels.length - 1, Math.max(0, index));
            const snapPoint = -snapPointsPixels[snapIndex];
            translateY.value = withSpring(snapPoint, springConfig);
            active.value = true;
        } else {
            translateY.value = withSpring(0, springConfig);
            active.value = false;
        }
    }, [expanded, index]);

    // Pan gesture handler
    const gesture = Gesture.Pan()
        .onStart(() => {
            initialSnap.value = translateY.value;
        })
        .onUpdate((event) => {
            const newTranslateY = initialSnap.value + event.translationY;
            translateY.value = Math.min(MAX_TRANSLATE_Y, Math.max(MIN_TRANSLATE_Y, newTranslateY));
        })
        .onEnd((event) => {
            // Find nearest snap point based on velocity and current position
            let destSnapPoint = 0;
            let destSnapIndex = 0;

            // If velocity is high enough, use it to determine direction
            if (Math.abs(event.velocityY) >= 500) {
                if (event.velocityY > 0) {
                    // Swiping down, find next lower snap point
                    for (let i = snapPointsPixels.length - 1; i >= 0; i--) {
                        if (-translateY.value > snapPointsPixels[i] * 0.5) {
                            destSnapPoint = -snapPointsPixels[i];
                            destSnapIndex = i;
                            break;
                        }
                    }
                } else {
                    // Swiping up, find next higher snap point
                    for (let i = 0; i < snapPointsPixels.length; i++) {
                        if (-translateY.value < snapPointsPixels[i] * 1.5) {
                            destSnapPoint = -snapPointsPixels[i];
                            destSnapIndex = i;
                            break;
                        }
                    }
                }
            } else {
                // Find closest snap point
                let minDistance = Infinity;

                snapPointsPixels.forEach((snapPoint, idx) => {
                    const distance = Math.abs(-translateY.value - snapPoint);
                    if (distance < minDistance) {
                        minDistance = distance;
                        destSnapPoint = -snapPoint;
                        destSnapIndex = idx;
                    }
                });
            }

            // Fully collapsed
            if (destSnapPoint === 0) {
                translateY.value = withSpring(destSnapPoint, springConfig, () => {
                    runOnJS(onExpandedChange)(false);
                    if (onIndexChange) runOnJS(onIndexChange)(destSnapIndex);
                });
            } else {
                translateY.value = withSpring(destSnapPoint, springConfig, () => {
                    if (onIndexChange) runOnJS(onIndexChange)(destSnapIndex);
                });
                runOnJS(onExpandedChange)(true);
            }
        });

    // Backdrop touch handler
    const handleBackdropPress = () => {
        if (enableBackdropDismiss) {
            onExpandedChange(false);
        }
    };

    // Animated styles
    const bottomSheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    const backdropStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateY.value,
            [0, MIN_TRANSLATE_Y],
            [0, backdropOpacity],
            'clamp'
        );

        return {
            opacity,
            display: opacity > 0 ? 'flex' : 'none',
        };
    });

    return (
        <>
            {/* Backdrop */}
            <Animated.View
                style={[
                    styles.backdrop,
                    { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' },
                    backdropStyle
                ]}
            >
                <TouchableOpacity
                    style={styles.backdropTouchable}
                    onPress={handleBackdropPress}
                    activeOpacity={1}
                />
            </Animated.View>

            {/* Bottom Sheet */}
            <GestureDetector gesture={gesture}>
                <Animated.View
                    style={[
                        styles.container,
                        {
                            backgroundColor: colors.background.primary,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            shadowColor: isDark ? '#000' : '#888',
                            paddingBottom: insets.bottom,
                        },
                        bottomSheetStyle,
                        style,
                    ]}
                >
                    {showHandle && (
                        <View style={styles.handleContainer}>
                            <View style={[styles.handle, { backgroundColor: colors.border }]} />
                        </View>
                    )}
                    <View style={styles.content}>
                        {children}
                    </View>
                </Animated.View>
            </GestureDetector>
        </>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    backdropTouchable: {
        width: '100%',
        height: '100%',
    },
    container: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
        overflow: "hidden",
        elevation: 24,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    handleContainer: {
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    content: {
        flex: 1,
    },
});

export default BottomSheet;