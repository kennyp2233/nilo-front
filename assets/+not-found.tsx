import React, { useEffect } from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  const bounceAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    // Animación de rebote para el ícono
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -20,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación de fade in para el texto
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Animación de slide up para el botón
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <>

      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {/* Contenedor de la ilustración animada */}
        <View style={styles.illustrationContainer}>
          <Animated.View style={[styles.iconContainer, { transform: [{ translateY: bounceAnim }] }]}>
            <Ionicons
              name="planet-outline"
              size={120}
              color={colors.primary}
            />
          </Animated.View>
          <Animated.View style={[styles.smallIcon, { transform: [{ translateY: bounceAnim }] }]}>
            <Ionicons
              name="help-circle-outline"
              size={40}
              color={colors.primary + '80'}
            />
          </Animated.View>
          <Animated.View style={[styles.smallIcon2, { transform: [{ translateY: bounceAnim }] }]}>
            <Ionicons
              name="help-circle-outline"
              size={30}
              color={colors.primary + '60'}
            />
          </Animated.View>
        </View>

        {/* Contenedor del texto animado */}
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={[styles.errorCode, { color: colors.primary + '99' }]}>
            404
          </Text>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            ¡Ups! Página no encontrada
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Parece que te has perdido en el espacio. La página que buscas no existe o ha sido movida.
          </Text>
        </Animated.View>

        {/* Botón animado con Link */}
        <Animated.View style={[styles.buttonContainer, {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim
        }]}>
          <Link href="/" asChild style={[
            styles.button,
            { backgroundColor: colors.primary }
          ]}>
            <TouchableOpacity

              activeOpacity={0.8}
            >
              <Ionicons
                name="home-outline"
                size={20}
                color="#FFF"
              />
              <Text style={styles.buttonText}>
                Volver al inicio
              </Text>
            </TouchableOpacity>
          </Link>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  illustrationContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
  },
  smallIcon: {
    position: 'absolute',
    right: 100,
    top: 40,
  },
  smallIcon2: {
    position: 'absolute',
    left: 100,
    top: 60,
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 40,
    paddingHorizontal: 20,
  },
  errorCode: {
    fontSize: 80,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
});