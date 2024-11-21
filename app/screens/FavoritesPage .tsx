import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from '@env';
const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const navigation = useNavigation();
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchFavorites();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const response = await axios.get(`${API_BASE_URL}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data); // Ajouté pour débogage
      setFavorites(response.data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const handleDeleteFavorite = async (favoriteId) => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      await axios.delete(`${API_BASE_URL}/favorites/${favoriteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFavorites(favorites.filter((favorite) => favorite.ID !== favoriteId));
    } catch (error) {
      console.error("Error deleting favorite:", error);
    }
  };

  const handlePressService = (serviceId) => {
    navigation.navigate("ServiceDetails", { serviceId });
  };

  const renderFavoriteItem = ({ item }) => (
    <Animated.View style={[styles.favoriteItem, { opacity: fadeAnim }]}>
      <TouchableOpacity
        onPress={() => handlePressService(item.service.ID)}
        style={styles.serviceDetails}
      >
        <Image
          source={{ uri: `${API_BASE_URL}/uploads/${item.Image}` }}
          style={styles.serviceImage}
        />
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceTitle}>{item.service.Titre}</Text>
          <Text style={styles.servicePlace}>{item.service.Place}</Text>
          <Text style={styles.servicePrice}>Prix: {item.service.Prix} Dt</Text>
          <Text style={styles.serviceDescription}>
            {item.service.Description}
          </Text>
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>
              Email: {item.service.user?.Email || "N/A"}
            </Text>
            <Text style={styles.userPhone}>
              Numéro: {item.service.user?.Num || "N/A"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleDeleteFavorite(item.ID)}
        style={styles.deleteButton}
      >
        <FontAwesome name="trash" size={24} color="red" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Favoris</Text>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.ID.toString()}
        />
      ) : (
        <Text style={styles.noFavoritesText}>Aucun service favori</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f4f8",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  favoriteItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
    padding: 16,
    transform: [{ scale: 1 }],
    transition: "transform 0.3s ease-in-out",
  },
  serviceDetails: {
    flexDirection: "row",
    flex: 1,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
  },
  servicePlace: {
    fontSize: 14,
    color: "#777",
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  userInfo: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 8,
  },
  userEmail: {
    fontSize: 14,
    color: "#555",
  },
  userPhone: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  noFavoritesText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});

export default FavoritesPage;
