import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, Animated, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { LoginAction } from '../redux/Action/authActions'; // Ajustez le chemin si nécessaire
import { RootState } from '../reducers/store'; // Ajustez le chemin si nécessaire

const { width } = Dimensions.get('window');

const Login: React.FC = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [fadeAnim] = useState(new Animated.Value(0));
  const [buttonTranslateY] = useState(new Animated.Value(50));
  const [backgroundColor] = useState(new Animated.Value(0));

  const authError = useSelector((state: RootState) => state.auth.error);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const onChangeHandler = (name: keyof typeof form, value: string) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  const onSubmit = async () => {
    try {
      const response = await dispatch(LoginAction(form) as any);
      if (response.success && response.access_token) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Erreur de Connexion', response.error || 'Échec de la connexion');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la soumission du formulaire.');
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY, {
        toValue: 0,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(backgroundColor, {
            toValue: 1,
            duration: 7000,
            useNativeDriver: false,
          }),
          Animated.timing(backgroundColor, {
            toValue: 0,
            duration: 7000,
            useNativeDriver: false,
          }),
        ])
      ).start(),
    ]).start();
  }, [fadeAnim, buttonTranslateY, backgroundColor]);

  const backgroundColorInterpolate = backgroundColor.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#BCADAD', '#f2eeee', '#BCADAD'], // Couleurs pastel modernes
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: backgroundColorInterpolate }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.backgroundOverlay} />
      <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: buttonTranslateY }] }]}>
        <Text style={styles.title}>Connexion</Text>
        {authError && <Text style={styles.errorMessage}>{authError}</Text>}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#B0BEC5"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => onChangeHandler('email', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#B0BEC5"
            secureTextEntry
            value={form.password}
            onChangeText={(text) => onChangeHandler('password', text)}
          />
          <TouchableOpacity style={styles.button} onPress={onSubmit}>
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('DmPassword')}>
          <Text style={styles.registerText}>
            Mot de passe Oublié? Réinitialiser le mot de passe
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#BCADAD',
    borderBottomRightRadius: width / 2,
    borderBottomLeftRadius: width / 2,
    height: width,
    zIndex: -1,
  },
  formContainer: {
    width: width * 0.85,
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#BCADAD',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#D32F2F',
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    height: 50,
    borderColor: '#BCADAD',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: '100%',
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  button: {
    backgroundColor: '#ff497c',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    marginTop: 20,
    color: '#BCADAD',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});

export default Login;
