// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { View, Text, Button, FlatList, StyleSheet , ActivityIndicator, TouchableOpacity} from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const Notifications = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   // const fetchNotifications = useCallback(async () => {
//   //   try {
//   //     const token = await AsyncStorage.getItem('jwt');
//   //     if (!token) {
//   //       throw new Error('Token manquant.');
//   //     }
//   //     const userId = getUserIdFromToken(token);
//   //     if (!userId) {
//   //       throw new Error('ID utilisateur invalide.');
//   //     }
//   //     console.log(`Fetching notifications for user ID: ${userId}`);
//   //     const response = await axios.get(
//   //       `http://192.168.1.19:3000/reservation/${userId}/accepted-rejected`,
//   //       {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       }
//   //     );
//   //     setNotifications(response.data);
//   //   } catch (error) {
//   //     console.error('Error fetching notifications:', error.response?.data || error.message);
//   //     setError('Erreur lors de la récupération des notifications.');
//   //   }
//   // }, []);
// const fetchNotifications = useCallback(async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('jwt');
//       if (!token) {
//         throw new Error('Token manquant.');
//       }
//       const userId = getUserIdFromToken(token);
//       if (!userId) {
//         throw new Error('ID utilisateur invalide.');
//       }
//       console.log(`Fetching notifications for user ID: ${userId}`);
//       const response = await axios.get(
//         `http://192.168.1.19:3000/reservation/${userId}/accepted-rejected`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setNotifications(response.data);
//     } catch (error) {
//       console.error('Error fetching notifications:', error.response?.data || error.message);
//       setError('Erreur lors de la récupération des notifications.');
//     } finally {
//       setLoading(false);
//     }
//   }, []);
//   const cancelReservation = useCallback(async (id) => {
//     if (!id) {
//       console.error('ID de réservation manquant.');
//       setError('ID de réservation manquant.');
//       return;
//     }
//     try {
//       const token = await AsyncStorage.getItem('jwt');
//       if (!token) {
//         throw new Error('Token manquant.');
//       }
//       console.log(`Attempting to cancel reservation with ID: ${id}`);
//       const response = await axios.patch(
//         `http://192.168.1.19:3000/reservation/cancel/${id}`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       console.log('Cancellation response:', response.data);
//       fetchNotifications(); // Réactualiser la liste des notifications
//     } catch (error) {
//       console.error('Error canceling reservation:', error.response?.data || error.message);
//       setError('Erreur lors de l\'annulation de la réservation.');
//     }
//   }, [fetchNotifications]);

//   useEffect(() => {
//     fetchNotifications();
//   }, [fetchNotifications]);

//   const getUserIdFromToken = (token) => {
//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       return payload.id;
//     } catch (error) {
//       console.error('Error decoding token:', error);
//       return null;
//     }
//   };

//   const renderNotification = ({ item }) => (
//     <View style={styles.notificationItem}>
//       <Text style={styles.infoText}><Text style={styles.bold}>Statut:</Text> {item.statut}</Text>
//       <Text style={styles.infoText}><Text style={styles.bold}>Date:</Text> {new Date(item.DATE).toLocaleDateString()}</Text>
//       <Text style={styles.infoText}><Text style={styles.bold}>Titre du service:</Text> {item.service.Titre}</Text>
//       <Text style={styles.infoText}><Text style={styles.bold}>Description du service:</Text> {item.service.Description}</Text>
//       <Text style={styles.infoText}><Text style={styles.bold}>Nom du fournisseur:</Text> {item.service.user?.Nom || 'Non disponible'}</Text>
//       <Text style={styles.infoText}><Text style={styles.bold}>Numéro de téléphone du fournisseur:</Text> {item.service.user?.Num || 'Non disponible'}</Text>
//       <Text style={styles.infoText}><Text style={styles.bold}>Message:</Text> {getMessageForStatus(item.statut)}</Text>
//       {item.statut === 'ACCEPTED' && (
//         <Button
//           title="Annuler"
//           onPress={() => cancelReservation(item.ID)}
//           color="#ff3d00"
//         />
//       )}
//     </View>
//   );

//   const getMessageForStatus = (statut) => {
//     switch (statut) {
//       case 'ACCEPTED':
//         return 'Votre réservation a été acceptée.';
//       case 'REJECTED':
//         return 'Votre réservation a été rejetée.';
//       default:
//         return 'Statut de réservation inconnu.';
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Notifications</Text>
//       {error && <Text style={styles.errorMessage}>{error}</Text>}
//       {notifications.length === 0 ? (
//         <Text>Aucune notification trouvée.</Text>
//       ) : (
//         <FlatList
//           data={notifications}
//           renderItem={renderNotification}
//           keyExtractor={(item) => item.ID.toString()}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginVertical: 20,
//   },
//   notificationItem: {
//     padding: 15,
//     marginVertical: 10,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//     elevation: 3,
//   },
//   infoText: {
//     fontSize: 16,
//     marginVertical: 2,
//   },
//   bold: {
//     fontWeight: 'bold',
//   },
//   errorMessage: {
//     color: 'red',
//     textAlign: 'center',
//     marginVertical: 10,
//   },
// });

// export default Notifications;
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("jwt");
      if (!token) {
        throw new Error("Token manquant.");
      }
      const userId = getUserIdFromToken(token);
      if (!userId) {
        throw new Error("ID utilisateur invalide.");
      }
      console.log(`Fetching notifications for user ID: ${userId}`);
      const response = await axios.get(
        `${API_BASE_URL}/reservation/${userId}/accepted-rejected`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications(response.data);
    } catch (error) {
      console.error(
        "Error fetching notifications:",
        error.response?.data || error.message
      );
      setError("Erreur lors de la récupération des notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelReservation = useCallback(
    async (id) => {
      if (!id) {
        console.error("ID de réservation manquant.");
        setError("ID de réservation manquant.");
        return;
      }
      try {
        const token = await AsyncStorage.getItem("jwt");
        if (!token) {
          throw new Error("Token manquant.");
        }
        console.log(`Attempting to cancel reservation with ID: ${id}`);
        const response = await axios.patch(
          `${API_BASE_URL}/reservation/cancel/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Cancellation response:", response.data);
        fetchNotifications(); // Réactualiser la liste des notifications
      } catch (error) {
        console.error(
          "Error canceling reservation:",
          error.response?.data || error.message
        );
        setError("Erreur lors de l'annulation de la réservation.");
      }
    },
    [fetchNotifications]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getUserIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>Statut:</Text> {item.statut}
      </Text>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>Date Début:</Text>{" "}
        {formatDate(item.DateDebut)}
      </Text>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>Date Fin:</Text> {formatDate(item.DateFin)}
      </Text>

      <Text style={styles.infoText}>
        <Text style={styles.bold}>Titre du service:</Text> {item.service.Titre}
      </Text>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>Description du service:</Text>{" "}
        {item.service.Description}
      </Text>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>Nom du fournisseur:</Text>{" "}
        {item.service.user?.Nom || "Non disponible"}
      </Text>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>Numéro de téléphone du fournisseur:</Text>{" "}
        {item.service.user?.Num || "Non disponible"}
      </Text>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>Message:</Text>{" "}
        {getMessageForStatus(item.statut)}
      </Text>
      {item.statut === "ACCEPTED" && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => cancelReservation(item.ID)}
        >
          <Text style={styles.buttonText}>Annuler</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getMessageForStatus = (statut) => {
    switch (statut) {
      case "ACCEPTED":
        return "Votre réservation a été acceptée.";
      case "REJECTED":
        return "Votre réservation a été rejetée.";
      default:
        return "Statut de réservation inconnu.";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <>
          {error && <Text style={styles.errorMessage}>{error}</Text>}
          {notifications.length === 0 ? (
            <Text style={styles.noNotificationsText}>
              Aucune notification trouvée.
            </Text>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderNotification}
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
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#343a40",
  },
  notificationItem: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 4,
    color: "#495057",
  },
  bold: {
    fontWeight: "600",
    color: "#343a40",
  },
  errorMessage: {
    color: "#dc3545",
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
  },
  noNotificationsText: {
    textAlign: "center",
    fontSize: 18,
    color: "#6c757d",
    marginVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#ff3d00",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Notifications;
