import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
const PasswordReset = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { token } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/reservation/reset-password/${token}`, { newPassword });
      setMessage('Le mot de passe a été réinitialisé.');
      Alert.alert('Succès', 'Le mot de passe a été réinitialisé.');
      navigation.navigate('Login'); // Utilisation de navigation.navigate au lieu de navigate('/login')
    } catch (error) {
      setMessage('Erreur lors de la réinitialisation du mot de passe.');
      Alert.alert('Erreur', 'Erreur lors de la réinitialisation du mot de passe.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réinitialisation du Mot de Passe</Text>
      <View style={styles.form}>
        <Text>Nouveau Mot de Passe :</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          required
        />
        <Text>Confirmer le Mot de Passe :</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          required
        />
        <Button title="Réinitialiser le Mot de Passe" onPress={handleSubmit} />
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  message: {
    fontSize: 16,
    color: 'red',
  },
});

export default PasswordReset;
