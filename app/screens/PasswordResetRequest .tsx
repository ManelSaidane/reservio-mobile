import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, StatusBar } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
const { width } = Dimensions.get('window');

const PasswordResetRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_BASE_URL}/reservation/forgot-password`, { email });
      setMessage('Un email de réinitialisation a été envoyé.');
      Alert.alert('Succès', 'Un email de réinitialisation a été envoyé.');
    } catch (error) {
      setMessage('Erreur lors de la demande de réinitialisation.');
      Alert.alert('Erreur', 'Erreur lors de la demande de réinitialisation.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.backgroundOverlay} />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Réinitialiser le Mot de Passe</Text>
        <View style={styles.form}>
          <Text>Email :</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
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
  message: {
    fontSize: 16,
    color: 'red',
    marginTop: 20,
  },
});

export default PasswordResetRequest;
