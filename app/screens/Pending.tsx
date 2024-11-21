import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
const PendingReservations = () => {
  const [pendingReservations, setPendingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingReservations();
  }, []);

  const fetchPendingReservations = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) {
        throw new Error('Token manquant.');
      }
      const userId = getUserIdFromToken(token);
      if (!userId) {
        throw new Error('ID utilisateur invalide.');
      }
      const response = await axios.get(
        `${API_BASE_URL}/reservation/${userId}/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPendingReservations(response.data);
    } catch (error) {
      console.error('Error fetching pending reservations:', error.response?.data || error.message);
      setError('Erreur lors de la récupération des réservations en attente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCancelReservation = async (reservationId) => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) {
        throw new Error('Token manquant.');
      }
      await axios.delete(`${API_BASE_URL}/reservation/${reservationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    
      setPendingReservations(prevReservations =>
        prevReservations.filter(reservation => reservation.ID !== reservationId)
      );
    } catch (error) {
      console.error('Error cancelling reservation:', error.response?.data || error.message);
      setError('Erreur lors de l\'annulation de la réservation.');
    }
  };

  const getUserIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const renderReservation = ({ item }) => (
    <View style={styles.reservationItem}>
      <Text style={styles.infoText}><Text style={styles.bold}>Date de début:</Text> {item.DateDebut ? formatDate(item.DateDebut) : 'Non spécifiée'}</Text>
      <Text style={styles.infoText}><Text style={styles.bold}>Date de fin:</Text> {item.DateFin ? formatDate(item.DateFin) : 'Non spécifiée'}</Text>
      <Text style={styles.infoText}><Text style={styles.bold}>Statut:</Text> {item.statut}</Text>
      <Text style={styles.infoText}><Text style={styles.bold}>Titre du Service:</Text> {item.service.Titre}</Text>
      <Text style={styles.infoText}><Text style={styles.bold}>Description du Service:</Text> {item.service.Description}</Text>
      <Button
        title="Annuler"
        onPress={() => handleCancelReservation(item.ID)}
        color="#ff3d00"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Réservations en Attente</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          {error && <Text style={styles.errorMessage}>{error}</Text>}
          {pendingReservations.length === 0 ? (
            <Text style={styles.noReservationsText}>Aucune réservation en attente trouvée.</Text>
          ) : (
            <FlatList
              data={pendingReservations}
              renderItem={renderReservation}
              keyExtractor={(item) => item.ID.toString()}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  reservationItem: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  errorMessage: {
    color: '#ff4d4d',
    textAlign: 'center',
    marginVertical: 10,
  },
  noReservationsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
  },
});

export default PendingReservations;
