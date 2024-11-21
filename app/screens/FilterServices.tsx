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
  Image,
  RefreshControl,
} from "react-native";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import io from "socket.io-client";
import { Picker } from "@react-native-picker/picker";
import { API_BASE_URL } from '@env';
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
  const [selectedSortBy, setSelectedSortBy] = useState("date");
  const [selectedPriceOrder, setSelectedPriceOrder] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState({
    show: false,
    type: null,
  });
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const navigation = useNavigation();
  const socket = io(`${API_BASE_URL}`);
  const [showPromotions, setShowPromotions] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchCategories();
    socket.on("serviceUpdated", (updatedService) => {
      console.log("Service mis à jour:", updatedService);
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
  }, []);

  let filteredTitle = "";
  if (services && typeof services.Titre === "string") {
    filteredTitle = services.Titre.toLowerCase();
  }

  useEffect(() => {
    applyFilters();
  }, [
    searchTerm,
    selectedSortBy,
    selectedPriceOrder,
    selectedCategory,
    services,
  ]);

  const fetchServices = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const response = await axios.get(`${API_BASE_URL}/services`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(response.data)) {
        const servicesWithDetails = await Promise.all(
          response.data.map(async (service) => {
            const userResponse = await axios.get(
              `${API_BASE_URL}/users/${service.userId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const user = userResponse.data;
            const reviewsResponse = await axios.get(
              `${API_BASE_URL}/reviews/service/${service.ID}`,
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
      const response = await axios.get(`${API_BASE_URL}/categories`);
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error(
          "Réponse API non valide : les catégories sont introuvables."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories :", error);
    }
  };
  // const getServicesByCategory = async (categoryId) => {
  //   try {
  //     const response = await axios.get(
  //       `http://192.168.1.19:3000/services/category/${categoryId}`
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération des services :", error);
  //   }
  // };

  const applyFilters = () => {
    let filtered = [...services];
    console.log("Services:", services);
    console.log("Search Term:", searchTerm);
    console.log("Selected Category:", selectedCategory);

    if (searchTerm) {
      filtered = filtered.filter((service) => {
        const title = service.Titre ? service.Titre.toLowerCase() : "";
        console.log("Filtering by Title:", title);
        return title.includes(searchTerm.toLowerCase());
      });
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (service) => String(service.categorieId) === String(selectedCategory)
      );
    }

    if (selectedSortBy === "date") {
      filtered = filtered.sort(
        (a, b) => new Date(a.DateDebut) - new Date(b.DateDebut)
      );
    } else if (selectedSortBy === "price") {
      filtered = filtered.sort((a, b) =>
        selectedPriceOrder === "asc" ? a.Prix - b.Prix : b.Prix - a.Prix
      );
    }

    console.log("Filtered Services:", filtered);
    setFilteredServices(filtered);
  };

  const toggleFavorite = async (serviceId) => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const isCurrentlyFavorite = favorites.includes(serviceId);
      let updatedFavorites = [...favorites];
      if (isCurrentlyFavorite) {
        updatedFavorites = updatedFavorites.filter((id) => id !== serviceId);
        await axios.delete(`${API_BASE_URL}/favorites/${serviceId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        updatedFavorites.push(serviceId);
        await axios.post(
          `${API_BASE_URL}/favorites`,
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
          `${API_BASE_URL}/reviews/${existingReview.id}`,
          { stars },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/reviews`,
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
        Alert.alert(
          "Erreur",
          "Veuillez sélectionner les dates de début et de fin."
        );
        return;
      }
      const token = await AsyncStorage.getItem("jwt");
      await axios.post(
        `${API_BASE_URL}/reservations`,
        {
          serviceId: serviceId,
          startDate,
          endDate,
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
      <View style={styles.imageAndFavoriteContainer}>
        <Image
          source={{
            uri: item.Image
              ? `${API_BASE_URL}/uploads/${item.Image}`
              : "https://via.placeholder.com/150",
          }}
          style={styles.serviceImage}
        />
        <TouchableOpacity
          onPress={() => toggleFavorite(item.ID)}
          style={styles.favoriteButton}
        >
          <FontAwesome
            name={item.isFavorite ? "heart" : "heart-o"}
            size={24}
            color={item.isFavorite ? "red" : "black"} // Rouge si favori, noir sinon
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.serviceTitle}>{item.Titre}</Text>
      <Text style={styles.servicePrice}>Prix : {item.Prix} Dt</Text>
      <Text style={styles.serviceDescription}>
        Description : {item.Description}
      </Text>
      <Text style={styles.serviceDate}>
        Date début : {moment(item.DateDebut).format("DD/MM/YYYY")}
      </Text>
      <Text style={styles.serviceDate}>
        Date fin : {moment(item.DateFin).format("DD/MM/YYYY")}
      </Text>

      <Text style={styles.serviceDate}>Fournisseur: {item.user.Nom}</Text>

      <View style={styles.datePickerContainer}>
        <Button
          title="Sélectionner une date de début"
          onPress={() => setShowDatePicker({ show: true, type: "startDate" })}
        />
        <Button
          title="Sélectionner une date de fin"
          onPress={() => setShowDatePicker({ show: true, type: "endDate" })}
        />
      </View>
      {showDatePicker.show && (
        <DateTimePicker
          mode="date"
          value={new Date()}
          onChange={handleDateChange}
        />
      )}
      <TouchableOpacity
        onPress={() => handleReservation(item.ID)}
        style={styles.reserveButton}
      >
        <Text>Réserver</Text>
      </TouchableOpacity>
      {/* <Text style={styles.serviceDate}>Donner un avis</Text> */}
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleReview(item.ID, star)}
          >
            <FontAwesome
              name={reviewStars[item.ID] >= star ? "star" : "star-o"}
              size={24}
              color="#FFD700"
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.serviceDate}>
        Moyenne des avis: {item.averageRating.toFixed(1)} / 5
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Rechercher..."
        value={searchTerm}
        onChangeText={handleSearch}
        style={styles.searchInput}
      />
      <View>
        <Text style={styles.filterLabel}>Filtrer par:</Text>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.pickerCategory}
        >
          {categories.map((category) => (
            <Picker.Item
              key={category.ID}
              label={category.Nom}
              value={category.ID}
            />
          ))}
        </Picker>

        {/* <Text style={styles.filterLabel}>Tri par :</Text> */}
        <Picker
          selectedValue={selectedSortBy}
          onValueChange={(itemValue) => setSelectedSortBy(itemValue)}
          style={styles.pickerSort}
        >
          <Picker.Item label="Date" value="date" />
          <Picker.Item label="Prix" value="price" />
        </Picker>
        
        {/* 
        <Text style={styles.filterLabel}>Ordre du prix :</Text> */}
        {/* <Picker
          selectedValue={selectedPriceOrder}
          onValueChange={(itemValue) => setSelectedPriceOrder(itemValue)}
          style={styles.pickerPriceOrder}
        >
          <Picker.Item label="Croissant" value="asc" />
          <Picker.Item label="Décroissant" value="desc" />
        </Picker> */}
      </View>
      {successMessage && (
        <Text style={styles.successMessage}>{successMessage}</Text>
      )}
      {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
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

// const styles = StyleSheet.create({
//   filterContainer: {
//     position: "relative",
//     margin: 10,
//     padding: 20,
//   },
//   picker: {
//     height: 100,
//     width: 150,
//   },
//   filterListShow: {
//     display: "flex",
//     opacity: 1,
//     transform: "translateY(0)",
//   },

//   filterItemHover: {
//     backgroundColor: "#f1f1f1",
//   },
//   filterItemFirstChild: {
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//   },
//   filterItemLastChild: {
//     borderBottomWidth: 0,
//     borderBottomLeftRadius: 12,
//     borderBottomRightRadius: 12,
//   },
//   card: {
//     borderColor: "#ccc",
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 16,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   price: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   favoriteButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 8,
//   },
//   reserveButton: {
//     marginVertical: 8,
//   },
//   reviewButton: {
//     marginVertical: 8,
//   },
//   datePickerContainer: {
//     marginVertical: 8,
//   },
//   successMessage: {
//     color: "green",
//     marginBottom: 16,
//   },
//   errorMessage: {
//     color: "red",
//     marginBottom: 16,
//   },
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   searchInput: {
//     borderColor: "#ccc",
//     borderWidth: 1,
//     borderRadius: 4,
//     padding: 8,
//     marginBottom: 16,
//   },

//   starContainer: {
//     flexDirection: "row",
//   },
//   serviceCard: {
//     borderColor: "#ccc",
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 16,
//     backgroundColor: "#fff",
//   },
//   serviceImage: {
//     width: "100%",
//     height: 150,
//     resizeMode: "cover",
//     borderRadius: 8,
//   },
//   serviceTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginVertical: 8,
//   },
//   servicePrice: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginVertical: 4,
//   },
//   serviceCategory: {
//     fontSize: 14,
//     marginVertical: 4,
//   },
//   serviceDescription: {
//     fontSize: 14,
//     marginVertical: 8,
//   },
//   serviceDate: {
//     fontSize: 14,
//     marginVertical: 4,
//   },
// });
// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       padding: 16,
//       backgroundColor: "#f4f4f4", // Ajoute un fond clair pour une meilleure visibilité
//     },
//     searchInput: {
//       borderColor: "#ddd",
//       borderWidth: 1,
//       borderRadius: 8,
//       padding: 10,
//       marginBottom: 20,
//       backgroundColor: "#fff", // Fond blanc pour l'entrée de recherche
//       fontSize: 16,
//     },
//     filterContainer: {
//       marginVertical: 20,
//       padding: 10,
//       backgroundColor: "#fff",
//       borderRadius: 8,
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 8,
//       elevation: 2,
//     },
//     picker: {
//       height: 50,
//       width: '100%',
//       marginVertical: 10,
//     },
//     successMessage: {
//       color: "#28a745",
//       fontSize: 16,
//       fontWeight: "bold",
//       marginBottom: 16,
//       textAlign: "center",
//     },
//     errorMessage: {
//       color: "#dc3545",
//       fontSize: 16,
//       fontWeight: "bold",
//       marginBottom: 16,
//       textAlign: "center",
//     },
//     serviceCard: {
//       borderColor: "#ddd",
//       borderWidth: 1,
//       borderRadius: 10,
//       padding: 16,
//       marginBottom: 20,
//       backgroundColor: "#fff",
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 8,
//       elevation: 2,
//     },
//     serviceImage: {
//       width: '100%',
//       height: 180,
//       resizeMode: "cover",
//       borderRadius: 10,
//       marginBottom: 10,
//     },
//     serviceTitle: {
//       fontSize: 20,
//       fontWeight: "bold",
//       marginBottom: 8,
//     },
//     servicePrice: {
//       fontSize: 18,
//       fontWeight: "bold",
//       marginBottom: 6,
//       color: "#333", // Couleur plus sombre pour le prix
//     },
//     serviceCategory: {
//       fontSize: 16,
//       marginBottom: 6,
//       color: "#555", // Couleur plus claire pour la catégorie
//     },
//     serviceDescription: {
//       fontSize: 16,
//       marginBottom: 12,
//       color: "#666",
//     },
//     serviceDate: {
//       fontSize: 16,
//       marginBottom: 6,
//       color: "#666",
//     },
//     favoriteButton: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginVertical: 10,
//     },
//     reserveButton: {
//       marginVertical: 10,
//       padding: 10,
//       backgroundColor: "#007bff",
//       borderRadius: 5,
//     },
//     reserveButtonText: {
//       color: "#fff",
//       fontSize: 16,
//       fontWeight: "bold",
//       textAlign: "center",
//     },
//     datePickerContainer: {
//       marginVertical: 10,
//     },
//     starContainer: {
//       flexDirection: "row",
//       marginVertical: 10,
//     },

//   });
// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       padding: 16,
//       backgroundColor: '#f4f4f4',
//     },
//     searchInput: {
//       borderColor: '#d1d1d1',
//       borderWidth: 1,
//       borderRadius: 6,
//       paddingHorizontal: 12,
//       paddingVertical: 8,
//       marginBottom: 16,
//       backgroundColor: '#fff',
//       fontSize: 16,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 8,
//       elevation: 2,
//     },

//     filterLabel: {
//       fontSize: 18,
//       fontWeight: '500',
//       marginBottom: 12,
//       color: '#333',
//     },
//     filterContainer: {
//         margin: 10,
//         padding: 20,
//         flexDirection: 'column',
//       },
//       pickerCategory: {
//         height: 50,
//         width: '100%',
//         marginBottom: 10,
//       },
//       pickerSort: {
//         height: 50,
//         width: '100%',
//         marginBottom: 10,
//       },
//       pickerPriceOrder: {
//         height: 50,
//         width: '100%',
//         marginBottom: 10,
//       },
//     pickerItem: {
//       fontSize: 16,
//     },
//     successMessage: {
//       color: '#28a745',
//       fontSize: 16,
//       textAlign: 'center',
//       marginBottom: 16,
//     },
//     errorMessage: {
//       color: '#dc3545',
//       fontSize: 16,
//       textAlign: 'center',
//       marginBottom: 16,
//     },
//     serviceCard: {
//       backgroundColor: '#fff',
//       borderRadius: 8,
//       borderColor: '#d1d1d1',
//       borderWidth: 1,
//       padding: 16,
//       marginBottom: 16,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 4 },
//       shadowOpacity: 0.2,
//       shadowRadius: 8,
//       elevation: 3,
//     },
//     serviceImage: {
//       width: '100%',
//       height: 150,
//       borderRadius: 8,
//       marginBottom: 8,
//     },
//     serviceTitle: {
//       fontSize: 20,
//       fontWeight: '600',
//       marginBottom: 4,
//       color: '#222',
//     },
//     servicePrice: {
//       fontSize: 18,
//       color: '#555',
//       marginBottom: 4,
//     },
//     serviceCategory: {
//       fontSize: 14,
//       color: '#888',
//       marginBottom: 4,
//     },
//     serviceDescription: {
//       fontSize: 14,
//       color: '#444',
//       marginBottom: 8,
//     },
//     serviceDate: {
//       fontSize: 14,
//       color: '#888',
//       marginBottom: 4,
//     },
//     starContainer: {
//       flexDirection: 'row',
//       marginVertical: 8,
//     },
//     favoriteButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginVertical: 8,
//     },
//     reserveButton: {
//       backgroundColor: '#007bff',
//       borderRadius: 6,
//       paddingVertical: 12,
//       paddingHorizontal: 20,
//       alignItems: 'center',
//       marginVertical: 8,
//     },
//     reserveButtonText: {
//       color: '#fff',
//       fontWeight: '600',
//       fontSize: 16,
//     },
//     datePickerContainer: {
//       marginVertical: 8,
//     },
//   });

// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       padding: 16,
//     },
//     searchInput: {
//       borderColor: "#ccc",
//       borderWidth: 1,
//       borderRadius: 4,
//       padding: 8,
//       marginBottom: 16,
//     },
//     filterContainer: {
//       flexDirection: "row",
//       flexWrap: "wrap",
//       marginBottom: 16,
//       padding: 10,
//       borderBottomWidth: 1,
//       borderBottomColor: "#ddd",
//     },
//     filterLabel: {
//       fontSize: 16,
//       fontWeight: "bold",
//       marginRight: 8,
//       marginTop: 8,
//     },
//     pickerCategory: {
//       height: 40,
//       width: 150,
//       marginRight: 10,
//       marginBottom: 20,
//       flexDirection : "column",
//     },
//     pickerSort: {
//       height: 40,
//       width: 150,
//       marginRight: 10,
//       marginBottom: 8,
//       flexDirection : "column",
//     },
//     pickerPriceOrder: {
//       height: 40,
//       width: 150,
//       marginRight: 10,
//       marginBottom: 8,
//     },
//     successMessage: {
//       color: "green",
//       marginBottom: 16,
//     },
//     errorMessage: {
//       color: "red",
//       marginBottom: 16,
//     },
//     serviceCard: {
//       borderColor: "#ccc",
//       borderWidth: 1,
//       borderRadius: 8,
//       padding: 16,
//       marginBottom: 16,
//       backgroundColor: "#fff",
//     },
//     serviceImage: {
//       width: "100%",
//       height: 150,
//       resizeMode: "cover",
//       borderRadius: 8,
//     },
//     serviceTitle: {
//       fontSize: 18,
//       fontWeight: "bold",
//       marginVertical: 8,
//     },
//     servicePrice: {
//       fontSize: 16,
//       fontWeight: "bold",
//       marginVertical: 4,
//     },
//     serviceCategory: {
//       fontSize: 14,
//       marginVertical: 4,
//     },
//     serviceDescription: {
//       fontSize: 14,
//       marginVertical: 4,
//     },
//     serviceDate: {
//       fontSize: 14,
//       marginVertical: 4,
//     },
//     favoriteButton: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginVertical: 8,
//     },
//     reserveButton: {
//       marginVertical: 8,
//     },
//     datePickerContainer: {
//       marginVertical: 8,
//     },
//     starContainer: {
//       flexDirection: "row",
//     },
//   });
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f4f4f4",
  },
  searchInput: {
    borderColor: "#d1d1d1",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 0,
    backgroundColor: "#fff",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  // filterContainer: {
  //   flexDirection: "row",
  //   marginBottom: 16,
  //   padding: 10,
  // },
  // filterContainer: {
  //   flexDirection: 'column',
  //   marginBottom: 12,
  //   padding: 8,
  //   backgroundColor: '#fff',
  //   borderRadius: 6,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 1 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 2,
  //   elevation: 1,
  // },
  filterLabel: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "500",
    marginBottom: -4,
    color: "#333",
  },
  pickerCategory: {
    marginTop: -50,
    marginBottom: 50,
    height: 36,
    // marginBottom:200,
  },
  pickerSort: {
    height: -5,
    marginBottom: -70,
  },
  // pickerPriceOrder: {
  //   height: 36,
  //   marginBottom: 40,
  // },
  pickerItem: {
    fontSize: 13,
  },
  successMessage: {
    color: "#28a745",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  errorMessage: {
    color: "#dc3545",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#d1d1d1",
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceImage: {
    width: 150,
    height: 150,
    resizeMode: "cover",
    borderRadius: 8,
    marginRight: 10,
  },
  favoriteButton: {
    position: "absolute",
    right: 0,
    top: 10,
  },
  imageAndFavoriteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  serviceCategory: {
    fontSize: 16,
    marginBottom: 6,
    color: "#555",
  },
  serviceDescription: {
    fontSize: 16,
    marginBottom: 12,
    color: "#666",
  },
  serviceDate: {
    fontSize: 16,
    marginBottom: 6,
    color: "#666",
  },
  reserveButton: {
    backgroundColor: "#28a745",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  reserveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  datePickerContainer: {
    marginVertical: 10,
  },
  starContainer: {
    flexDirection: "row",
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ServiceCard;
