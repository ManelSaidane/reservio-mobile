import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar, Dimensions, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import logoImage from '../../assets/images/logo-no-background.png'; // Assurez-vous que le chemin est correct

const { width } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();

  // Animations
  const logoOpacity = new Animated.Value(0);
  const logoScale = new Animated.Value(0.8);
  const buttonTranslateY = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1.2,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY, {
        toValue: 0,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.backgroundOverlay} />
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Image source={logoImage} style={styles.logo} />
      </Animated.View>
      <Text style={styles.welcomeText}>Bienvenue à Reservio</Text>
      <Animated.View style={[styles.buttonContainer, { transform: [{ translateY: buttonTranslateY }] }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Se Connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('RegisterClient')}
        >
          <Text style={styles.buttonText}>S'Inscrire</Text>
        </TouchableOpacity>
      </Animated.View>
      <View style={styles.footerBottom}>
  <Text style={styles.footerText}>
    &copy; 2024 Reservio. Tous droits réservés. | Contact: saidaneemanel@gmail.com
  </Text>
</View>

    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2eeee',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#BCADAD',
    borderBottomRightRadius: width / 2,
    borderBottomLeftRadius: width / 2,
    height: width,
    zIndex: -1,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#BCADAD',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#ff497c',
    paddingVertical: 15,
    marginBottom: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerBottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#BCADAD', 
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  
});

export default WelcomeScreen;
