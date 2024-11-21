import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Button,
  RefreshControl,
} from "react-native";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import io from "socket.io-client";

const ServiceCard = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [selectedDates, setSelectedDates] = useState({});
  const [reviewStars, setReviewStars] = useState({});
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSortBy, setSelectedSortBy] = useState('date');
  const [selectedPriceOrder, setSelectedPriceOrder] = useState('asc');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState({
    show: false,
    type: null,
  });
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const navigation = useNavigation();
  const socket = io("http://192.168.1.19:3000");

  useEffect(() => {
    fetchServices();
    fetchCategories();
    socket.on("serviceUpdated", (updatedService) => {
      console.log("Service mis à jour:", updatedService); // Debug
      setServices((prevServices) =>
        prevServices.map((service) =>
          service.ID === updatedService.ID ? updatedService : service
        )
      );
    });

    // Cleanup on unmount
    return () => {
      socket.off("serviceUpdated");
    };
  }, [selectedSortBy, selectedPriceOrder, selectedCategory]);

  const fetchServices = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const response = await axios.get("http://192.168.1.210:3000/services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(response.data)) {
        const servicesWithDetails = await Promise.all(
          response.data.map(async (service) => {
            const userResponse = await axios.get(
              `http://192.168.1.210:3000/users/${service.userId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const user = userResponse.data;
            const reviewsResponse = await axios.get(
              `http://192.168.1.210:3000/reviews/service/${service.ID}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const reviews = reviewsResponse.data;
            const averageRating =
              reviews.length > 0
                ? reviews.reduce((acc, review) => acc + review.stars, 0) /
                  reviews.length
                : 0;
            return {
              ...service,
              user: {
                id: user.id,
                Nom: user.Nom,
                Email: user.Email,
                Num: user.Num,
              },
              reviews: reviews,
              averageRating: averageRating,
              isFavorite: favorites.includes(service.ID),
            };
          })
        );
        setServices(servicesWithDetails);
        setFilteredServices(servicesWithDetails);
      } else {
        console.error(
          "Réponse API non valide : le tableau de services est introuvable."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des services :", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://192.168.1.210:3000/categories");
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error("Réponse API non valide : les catégories sont introuvables.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories :", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...services];
    
    if (searchTerm) {
      filtered = filtered.filter((service) =>
        service.Titre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((service) =>
        service.Categorie.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (selectedSortBy === 'date') {
      filtered = filtered.sort((a, b) => new Date(a.DateDebut) - new Date(b.DateDebut));
    } else if (selectedSortBy === 'price') {
      filtered = filtered.sort((a, b) => selectedPriceOrder === 'asc' ? a.Prix - b.Prix : b.Prix - a.Prix);
    }

    setFilteredServices(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedSortBy, selectedPriceOrder, selectedCategory, services]);

  const toggleFavorite = async (serviceId) => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const isCurrentlyFavorite = favorites.includes(serviceId);
      let updatedFavorites = [...favorites];
      if (isCurrentlyFavorite) {
        updatedFavorites = updatedFavorites.filter((id) => id !== serviceId);
        await axios.delete(`http://192.168.1.210:3000/favorites/${serviceId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        updatedFavorites.push(serviceId);
        await axios.post(
          "http://192.168.1.210:3000/favorites",
          { serviceId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      setFavorites(updatedFavorites);
      setSuccessMessage(
        isCurrentlyFavorite
          ? "Service retiré des favoris."
          : "Service ajouté aux favoris."
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erreur lors de la gestion des favoris :", error);
      setErrorMessage("Erreur lors de la gestion des favoris.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleReview = async (serviceId, stars) => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const userId = JSON.parse(atob(token.split(".")[1])).id;

      const existingReview = services
        .find((service) => service.ID === serviceId)
        .reviews.find((review) => review.userId === userId);

      if (existingReview) {
        await axios.put(
          `http://192.168.1.210:3000/reviews/${existingReview.id}`,
          { stars },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          "http://192.168.1.210:3000/reviews",
          {
            serviceId: serviceId,
            stars: stars,
            userId: userId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setSuccessMessage("Avis ajouté avec succès !");
      fetchServices();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erreur lors de l'ajout d'avis :", error);
      setErrorMessage("Erreur lors de l'ajout d'avis.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
  };

  const handleDateChange = (event, date) => {
    if (date) {
      setShowDatePicker({ show: false, type: null });
      setSelectedDates((prev) => ({
        ...prev,
        [currentServiceId]: {
          ...prev[currentServiceId],
          [showDatePicker.type]: date.toISOString(),
        },
      }));
    }
  };

  const handleReservation = async (serviceId) => {
    try {
      const { startDate, endDate } = selectedDates[serviceId] || {};
      if (!startDate || !endDate) {
        setErrorMessage("Veuillez sélectionner les deux dates.");
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }

      const token = await AsyncStorage.getItem("jwt");
      await axios.post(
        "http://192.168.1.210:3000/reservations",
        {
          serviceId,
          startDate,
          endDate,
          userId: JSON.parse(atob(token.split(".")[1])).id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Réservation effectuée avec succès !");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erreur lors de la réservation :", error);
      setErrorMessage("Erreur lors de la réservation.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const renderServiceItem = ({ item }) => (
    <View style={styles.serviceCard}>
      <Text style={styles.serviceTitle}>{item.Titre}</Text>
      <Text style={styles.servicePrice}>Prix : {item.Prix}€</Text>
      <Text style={styles.serviceCategory}>Catégorie : {item.Categorie}</Text>
      <Text style={styles.serviceDescription}>{item.Description}</Text>
      <Text style={styles.serviceDate}>
        Date début : {moment(item.DateDebut).format("DD/MM/YYYY")}
      </Text>
      <Text style={styles.serviceDate}>
        Date fin : {moment(item.DateFin).format("DD/MM/YYYY")}
      </Text>
      <Text style={styles.serviceUser}>Offert par : {item.user.Nom}</Text>
      <View style={styles.serviceRating}>
        <Text>Note : {item.averageRating.toFixed(1)}</Text>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleReview(item.ID, star)}
          >
            <FontAwesome
              name="star"
              size={24}
              color={
                item.reviews.some((review) => review.stars === star)
                  ? "gold"
                  : "gray"
              }
            />
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item.ID)}
      >
        <FontAwesome
          name={item.isFavorite ? "heart" : "heart-o"}
          size={24}
          color={item.isFavorite ? "red" : "black"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.reserveButton}
        onPress={() => {
          setCurrentServiceId(item.ID);
          setShowDatePicker({ show: true, type: "start" });
        }}
      >
        <Text>Réserver</Text>
      </TouchableOpacity>
      {showDatePicker.show && (
        <DateTimePicker
          mode="date"
          value={new Date()}
          onChange={handleDateChange}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          value={searchTerm}
          onChangeText={handleSearch}
        />
        <Button title="Filtrer" onPress={() => setShowFilter(!showFilter)} />
        {showFilter && (
          <View style={styles.filters}>
            <View>
              <Text>Tri par :</Text>
              <TouchableOpacity
                onPress={() => setSelectedSortBy('date')}
                style={styles.filterButton}
              >
                <Text>Date</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedSortBy('price')}
                style={styles.filterButton}
              >
                <Text>Prix</Text>
              </TouchableOpacity>
              {selectedSortBy === 'price' && (
                <View style={styles.sortOrderContainer}>
                  <TouchableOpacity
                    onPress={() => setSelectedPriceOrder('asc')}
                    style={styles.filterButton}
                  >
                    <Text>Prix croissant</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSelectedPriceOrder('desc')}
                    style={styles.filterButton}
                  >
                    <Text>Prix décroissant</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View>
              <Text>Catégorie :</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Entrez une catégorie"
                value={selectedCategory}
                onChangeText={setSelectedCategory}
              />
            </View>
          </View>
        )}
      </View>
      <FlatList
        data={filteredServices}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.ID.toString()}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={fetchServices} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  serviceCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  servicePrice: {
    fontSize: 16,
    color: "#333",
  },
  serviceCategory: {
    fontSize: 14,
    color: "#777",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#555",
    marginVertical: 10,
  },
  serviceDate: {
    fontSize: 12,
    color: "#999",
  },
  serviceUser: {
    fontSize: 14,
    fontWeight: "bold",
  },
  serviceRating: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  favoriteButton: {
    marginVertical: 5,
  },
  reserveButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  filterContainer: {
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  filters: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#e1e1e1",
    borderRadius: 5,
    alignItems: "center",
  },
  sortOrderContainer: {
    marginTop: 10,
  },
  success: {
    color: "green",
    fontWeight: "bold",
    marginBottom: 10,
  },
  error: {
    color: "red",
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default ServiceCard;
