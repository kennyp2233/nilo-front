// src/components/ui/TabView.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabItem {
    key: string;
    title: string;
    icon?: keyof typeof Ionicons.glyphMap;
    badge?: number;
}

interface TabViewProps {
    tabs: TabItem[];
    renderScene: (route: TabItem, index: number) => React.ReactNode;
    onTabChange?: (index: number) => void;
    initialTabIndex?: number;
    tabBarStyle?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    showIcons?: boolean;
    scrollEnabled?: boolean;
}

const TabView: React.FC<TabViewProps> = ({
    tabs,
    renderScene,
    onTabChange,
    initialTabIndex = 0,
    tabBarStyle,
    contentContainerStyle,
    showIcons = true,
    scrollEnabled = true,
}) => {
    const { colors } = useTheme();
    const [activeIndex, setActiveIndex] = useState(initialTabIndex);
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);

    // Animated indicator values
    const inputRange = tabs.map((_, i) => i * SCREEN_WIDTH);
    const indicatorWidth = SCREEN_WIDTH / tabs.length;
    const translateX = scrollX.interpolate({
        inputRange,
        outputRange: tabs.map((_, i) => i * indicatorWidth),
    });

    // Handle tab press
    const handleTabPress = (index: number) => {
        setActiveIndex(index);
        scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
        if (onTabChange) {
            onTabChange(index);
        }
    };

    // Handle scroll animation
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    // Handle scroll end
    const handleScrollEnd = (event: any) => {
        const { contentOffset } = event.nativeEvent;
        const index = Math.round(contentOffset.x / SCREEN_WIDTH);

        if (index !== activeIndex) {
            setActiveIndex(index);
            if (onTabChange) {
                onTabChange(index);
            }
        }
    };

    // Update scroll position when active index changes
    useEffect(() => {
        scrollViewRef.current?.scrollTo({ x: activeIndex * SCREEN_WIDTH, animated: true });
    }, [activeIndex]);

    return (
        <View style={styles.container}>
            {/* Tab Bar */}
            <View style={[styles.tabBar, { backgroundColor: colors.background.primary }, tabBarStyle]}>
                {tabs.map((tab, index) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tabItem,
                            { width: SCREEN_WIDTH / tabs.length }
                        ]}
                        onPress={() => handleTabPress(index)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.tabContent}>
                            {showIcons && tab.icon && (
                                <Ionicons
                                    name={tab.icon}
                                    size={20}
                                    color={index === activeIndex ? colors.primary : colors.text.secondary}
                                    style={styles.tabIcon}
                                />
                            )}

                            <Text
                                variant="subtitle"
                                weight={index === activeIndex ? "semibold" : "normal"}
                                color={index === activeIndex ? "accent" : "secondary"}
                                style={styles.tabTitle}
                            >
                                {tab.title}
                            </Text>

                            {tab.badge && tab.badge > 0 && (
                                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                                    <Text style={styles.badgeText}>
                                        {tab.badge > 99 ? '99+' : tab.badge}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Animated Indicator */}
                <Animated.View
                    style={[
                        styles.indicator,
                        {
                            width: indicatorWidth,
                            backgroundColor: colors.primary,
                            transform: [{ translateX }]
                        }
                    ]}
                />
            </View>

            {/* Content */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
                style={styles.contentContainer}
                contentContainerStyle={contentContainerStyle}
                scrollEnabled={scrollEnabled}
            >
                {tabs.map((tab, index) => (
                    <View key={tab.key} style={{ width: SCREEN_WIDTH }}>
                        {renderScene(tab, index)}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        height: 48,
        position: 'relative',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E0E0E0',
    },
    tabItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIcon: {
        marginRight: 6,
    },
    tabTitle: {
        fontSize: 14,
    },
    indicator: {
        position: 'absolute',
        height: 3,
        bottom: 0,
    },
    contentContainer: {
        flex: 1,
    },
    badge: {
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        marginLeft: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default TabView;