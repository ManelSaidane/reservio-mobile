import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import axios from "axios";
import welcomeOfferImage from "../../assets/images/un-bar-gay-festif-768x503.png";
import relaxOfferImage from "../../assets/images/massage-paris.jpg";
import eventOfferImage from "../../assets/images/comment_assurer_securite_evenement.jpg";
import studentOfferImage from "../../assets/images/carte-étudiante-isic-600x400.jpg";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import restaurantIcon from "../../assets/images/serveur.png";
import wellnessIcon from "../../assets/images/traitement-de-beaute.png";
import eventIcon from "../../assets/images/evenement.png";
import activityIcon from "../../assets/images/mode-de-vie.png";
import transportIcon from "../../assets/images/transport.png";
import lodgingIcon from "../../assets/images/hebergement-web.png";
import defaultIcon from "../../assets/images/comment_assurer_securite_evenement.jpg"; // Add a default icon
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import io from "socket.io-client";
import { API_BASE_URL } from '@env';

import colorimage from "../../assets/images/images.png";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
const HomeScreen = () => {
  const [categories, setCategories] = useState([]);
  // const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchCategories();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    Animated.timing(translateYAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      console.log("Categories fetched:", response.data);
      const mappedCategories = response.data.map((category) => ({
        id: category.ID,
        name: category.Nom,
        icon: getCategoryIcon(category.Nom), // Map the icon name to the imported icon
      }));
      setCategories(mappedCategories);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories :", error);
    }
  };

  const handleCategoryPress = (categoryId) => {
    navigation.navigate("CategoryProducts", { categoryId });
  };

  const getCategoryIcon = (categoryName) => {
    switch (categoryName) {
      case "Restauration":
        return restaurantIcon;
      case "Transport":
        return transportIcon;
      case "Activité":
        return activityIcon;
      case "Soins-et-bien etre":
        return wellnessIcon;
      case "Evenement":
        return eventIcon;
      case "hebergement":
        return lodgingIcon;
      default:
        console.warn(`No icon found for category: ${categoryName}`);
        return defaultIcon; // Provide a default icon if none found
    }
  };

  const renderCategoryItem = ({ item }) => (
    <Animated.View
      style={[
        styles.categoryItem,
        { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] },
      ]}
    >
      <TouchableOpacity
        onPress={() => handleCategoryPress(item.id)}
        style={styles.categoryItemContent}
      >
        <Image source={item.icon} style={styles.categoryIcon} />
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const specialOffers = [
    {
      id: "1",
      image: welcomeOfferImage,
      title: "Offre de Bienvenue",
      description:
        "Recevez 20% de réduction sur votre première Reservation ! Utilisez le code BIENVENUE20.",
    },
    {
      id: "2",
      image: relaxOfferImage,
      title: "Offre Détente",
      description:
        "Offrez-vous une journée de détente avec 20% de réduction sur tous les soins bien-être. Réservez avant la fin du mois.",
    },
    {
      id: "3",
      image: eventOfferImage,
      title: "Offre Événement Spécial",
      description:
        "Réservez pour un événement et bénéficiez de 15% de réduction sur votre commande. Offre valable pour les événements de plus de 50 personnes.",
    },
    {
      id: "4",
      image: studentOfferImage,
      title: "Offre Étudiant",
      description:
        "Étudiants, obtenez 10% de réduction sur tous les services avec une carte étudiante valide.",
    },
  ];

  const renderSpecialOfferItem = ({ item }) => (
    <Animated.View
      style={[
        styles.specialOfferItem,
        { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] },
      ]}
    >
      <Image source={item.image} style={styles.specialOfferImage} />
      <View style={styles.specialOfferText}>
        <Text style={styles.specialOfferTitle}>{item.title}</Text>
        <Text style={styles.specialOfferDescription}>{item.description}</Text>
      </View>
    </Animated.View>
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDates, setSelectedDates] = useState({});
  const [reviewStars, setReviewStars] = useState({});
  const { width } = Dimensions.get("window");
  const [showDatePicker, setShowDatePicker] = useState({
    show: false,
    type: null,
  });
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const navigation = useNavigation();
  const socket = io(`${API_BASE_URL}`);

  // useEffect(() => {
  //   fetchServices();
  //   socket.on("serviceUpdated", (updatedService) => {
  //     console.log("Service mis à jour:", updatedService); // Debug
  //     setServices((prevServices) =>
  //       prevServices.map((service) =>
  //         service.ID === updatedService.ID ? updatedService : service
  //       )
  //     );
  //   });

  //   // Cleanup on unmount
  //   return () => {
  //     socket.off("serviceUpdated");
  //   };
  // }, []);
  useFocusEffect(
    useCallback(() => {
      fetchServices(); // Appel à fetchServices chaque fois que la page devient active
    }, [fetchServices])
  );

  useEffect(() => {
    fetchServices(); // Recherche initiale
    socket.on("serviceUpdated", (updatedService) => {
      console.log("Service mis à jour:", updatedService); // Debug
      fetchServices(); // Rechercher de nouveaux services
    });

    // Cleanup on unmount
    return () => {
      socket.off("serviceUpdated");
    };
  }, [fetchServices]);


  //   try {
  //     const token = await AsyncStorage.getItem("jwt");
  //     const response = await axios.get("http://192.168.1.19:3000/services", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (Array.isArray(response.data)) {
  //       const servicesWithDetails = await Promise.all(
  //         response.data.map(async (service) => {
  //           const userResponse = await axios.get(
  //             `http://192.168.1.19:3000/users/${service.userId}`,
  //             {
  //               headers: {
  //                 Authorization: `Bearer ${token}`,
  //               },
  //             }
  //           );
  //           const user = userResponse.data;
  //           const reviewsResponse = await axios.get(
  //             `http://192.168.1.19:3000/reviews/service/${service.ID}`,
  //             {
  //               headers: {
  //                 Authorization: `Bearer ${token}`,
  //               },
  //             }
  //           );
  //           const reviews = reviewsResponse.data;
  //           const averageRating =
  //             reviews.length > 0
  //               ? reviews.reduce((acc, review) => acc + review.stars, 0) /
  //                 reviews.length
  //               : 0;
  //           return {
  //             ...service,
  //             user: {
  //               id: user.id,
  //               Nom: user.Nom,
  //               Email: user.Email,
  //               Num: user.Num,
  //             },
  //             reviews: reviews,
  //             averageRating: averageRating,
  //             isFavorite: favorites.includes(service.ID),
  //           };
  //         })
  //       );
  //       setServices(servicesWithDetails);
  //       setFilteredServices(servicesWithDetails);
  //     } else {
  //       console.error(
  //         "Réponse API non valide : le tableau de services est introuvable."
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération des services :", error);
  //   }
  // };
  const fetchServices = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("jwt");
      const response = await axios.get(
        `${API_BASE_URL}/services?page=${pageNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
        // Si c'est la première page, écraser les anciens services
        setServices((prevServices) =>
          pageNumber === 1
            ? servicesWithDetails
            : [...prevServices, ...servicesWithDetails]
        );
        setFilteredServices((prevServices) =>
          pageNumber === 1
            ? servicesWithDetails
            : [...prevServices, ...servicesWithDetails]
        );
        setHasMore(response.data.length > 0);
      } else {
        console.error(
          "Réponse API non valide : le tableau de services est introuvable."
        );
        setHasMore(false);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des services :", error);
    } finally {
      setLoading(false);
    }
  };

  // const fetchServices = async (pageNumber = 1) => {
  //   try {
  //     setLoading(true);
  //     const token = await AsyncStorage.getItem("jwt");
  //     const response = await axios.get(
  //       `http://192.168.1.19:3000/services?page=${pageNumber}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     if (Array.isArray(response.data)) {
  //       const servicesWithDetails = await Promise.all(
  //         response.data.map(async (service) => {
  //           const userResponse = await axios.get(
  //             `http://192.168.1.19:3000/users/${service.userId}`,
  //             {
  //               headers: {
  //                 Authorization: `Bearer ${token}`,
  //               },
  //             }
  //           );
  //           const user = userResponse.data;
  //           const reviewsResponse = await axios.get(
  //             `http://192.168.1.19:3000/reviews/service/${service.ID}`,
  //             {
  //               headers: {
  //                 Authorization: `Bearer ${token}`,
  //               },
  //             }
  //           );
  //           const reviews = reviewsResponse.data;
  //           const averageRating =
  //             reviews.length > 0
  //               ? reviews.reduce((acc, review) => acc + review.stars, 0) /
  //                 reviews.length
  //               : 0;
  //           return {
  //             ...service,
  //             user: {
  //               id: user.id,
  //               Nom: user.Nom,
  //               Email: user.Email,
  //               Num: user.Num,
  //             },
  //             reviews: reviews,
  //             averageRating: averageRating,
  //             isFavorite: favorites.includes(service.ID),
  //           };
  //         })
  //       );
  //       setServices((prevServices) => [
  //         ...prevServices,
  //         ...servicesWithDetails,
  //       ]);
  //       setFilteredServices((prevServices) => [
  //         ...prevServices,
  //         ...servicesWithDetails,
  //       ]);
  //       setHasMore(response.data.length > 0);
  //     } else {
  //       console.error(
  //         "Réponse API non valide : le tableau de services est introuvable."
  //       );
  //       setHasMore(false);
  //     }
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération des services :", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchServices(nextPage);
        return nextPage;
      });
    }
  };

  const toggleFavorite = async (serviceId) => {
    try {
      // Récupérer le token JWT depuis AsyncStorage
      const token = await AsyncStorage.getItem("jwt");
      if (!token) {
        throw new Error("Token JWT non trouvé");
      }

      // Vérifier si le service est actuellement dans les favoris
      const isCurrentlyFavorite = favorites.includes(serviceId);
      let updatedFavorites = [...favorites];

      if (isCurrentlyFavorite) {
        // Retirer le service des favoris
        updatedFavorites = updatedFavorites.filter((id) => id !== serviceId);
        await axios.delete(`${API_BASE_URL}/favorites/${serviceId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Ajouter le service aux favoris
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

      // Mettre à jour l'état des favoris
      setFavorites(updatedFavorites);

      // Afficher un message de succès
      setSuccessMessage(
        isCurrentlyFavorite
          ? "Service retiré des favoris."
          : "Service ajouté aux favoris."
      );
      setTimeout(() => setSuccessMessage(""), 3000); // Réinitialiser le message après 3 secondes
    } catch (error) {
      console.error("Erreur lors de la gestion des favoris :", error);

      // Afficher un message d'erreur
      setErrorMessage("Erreur lors de la gestion des favoris.");
      setTimeout(() => setErrorMessage(""), 3000); // Réinitialiser le message après 3 secondes
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
    const filtered = services.filter((service) =>
      service.Titre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
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

      const isoStartDate = new Date(startDate).toISOString();
      const isoEndDate = new Date(endDate).toISOString();
      const service = services.find((s) => s.ID === serviceId);
      if (!service) {
        setErrorMessage("Service introuvable.");
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }

      const dateDebut = new Date(service.DateDebut);
      const dateFin = new Date(service.DateFin);
      const selectedStartDateObj = new Date(startDate);
      const selectedEndDateObj = new Date(endDate);

      if (
        selectedStartDateObj < dateDebut ||
        selectedEndDateObj > dateFin ||
        selectedEndDateObj < selectedStartDateObj
    ) {
        setErrorMessage(
          "Les dates choisies doivent être incluses dans la plage des dates début et fin du service."
        );
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }

      const token = await AsyncStorage.getItem("jwt");
      if (!token) {
        setErrorMessage("Token non disponible. Veuillez vous reconnecter.");
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }

      const userId = JSON.parse(atob(token.split(".")[1])).id;

      await axios.post(
        `"${API_BASE_URL}/reservation`,
        {
          serviceId: serviceId,
          DateDebut: isoStartDate,
          DateFin: isoEndDate,
          userId: userId,
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
    <View style={styles.serviceItem}>
      <View style={styles.serviceHeader}>
        <Image
          source={{ uri: `${API_BASE_URL}/uploads/${item.Image}` }}
          style={styles.serviceImage}
        />
          <TouchableOpacity
        style={[styles.favoriteButton, item.isFavorite && styles.favorited]}
        onPress={() => toggleFavorite(item.ID)}
      >
        <FontAwesome
          name={item.isFavorite ? "heart" : "heart-o"}
          size={24}
          color={item.isFavorite ? "red" : "gray"}
        />
      </TouchableOpacity>
      </View>
      <View style={styles.serviceDetails}>
        <Text style={styles.serviceTitle}>{item.Titre}</Text>
        <Text style={styles.serviceDescription}>
          Description: {item.Description}
        </Text>
        <Text style={styles.servicePrice}>Prix: {item.Prix} Dt</Text>
        <Text style={styles.serviceDate}>
          Offre valable du {moment(item.DateDebut).format("DD/MM/YYYY")} au{" "}
          {moment(item.DateFin).format("DD/MM/YYYY")}
        </Text>
        <Text>Choisir vos dates :</Text>
        <TouchableOpacity
          onPress={() => {
            setCurrentServiceId(item.ID);
            setShowDatePicker({ show: true, type: "startDate" });
          }}
        >
          <Text style={styles.selectDateButton}>
            {selectedDates[item.ID]?.startDate
              ? moment(selectedDates[item.ID].startDate).format("DD/MM/YYYY")
              : "Sélectionner une date de début"}
          </Text>
        </TouchableOpacity>
        {showDatePicker.show &&
          showDatePicker.type === "startDate" &&
          currentServiceId === item.ID && (
            <DateTimePicker
              value={
                selectedDates[item.ID]?.startDate
                  ? new Date(selectedDates[item.ID].startDate)
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date(item.DateDebut)}
              maximumDate={new Date(item.DateFin)}
            />
          )}
        <TouchableOpacity
          onPress={() => {
            setCurrentServiceId(item.ID);
            setShowDatePicker({ show: true, type: "endDate" });
          }}
        >
          <Text style={styles.selectDateButton}>
            {selectedDates[item.ID]?.endDate
              ? moment(selectedDates[item.ID].endDate).format("DD/MM/YYYY")
              : "Sélectionner une date de fin"}
          </Text>
        </TouchableOpacity>
        {showDatePicker.show &&
          showDatePicker.type === "endDate" &&
          currentServiceId === item.ID && (
            <DateTimePicker
              value={
                selectedDates[item.ID]?.endDate
                  ? new Date(selectedDates[item.ID].endDate)
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date(item.DateDebut)}
              maximumDate={new Date(item.DateFin)}
            />
          )}
        <TouchableOpacity
          style={styles.reserveButton}
          onPress={() => handleReservation(item.ID)}
        >
          <Text style={styles.reserveButtonText}>Réserver</Text>
        </TouchableOpacity>
        <Text style={styles.serviceProviderTitle}>Service fourni par :</Text>
        <Text>Nom: {item.user.Nom}</Text>
        <Text>Email: {item.user.Email}</Text>
        <Text>Téléphone: {item.user.Num}</Text>
        <Text>Moyenne des avis: {item.averageRating.toFixed(1)} / 5</Text>
        <Text>Votre avis :</Text>
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
      </View>
    </View>
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <Image source={colorimage} style={styles.backgroundImage} /> */}
        {/* <Text style={styles.welcomeText}>Bienvenue ! Découvrez et réservez dès aujourd'hui vos expériences inoubliables</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un service"
          value={searchTerm}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={() => navigation.navigate("Favorites")}>
          <MaterialIcons name="favorite" size={40} color="black" />
        </TouchableOpacity> */}
        <Text style={styles.welcomeText}>
          Bienvenue ! Découvrez et réservez dès aujourd'hui vos expériences
          inoubliables
        </Text>
        <View style={styles.searchAndIconContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un service"
            value={searchTerm}
            onChangeText={handleSearch}
          />
          <TouchableOpacity
            style={styles.favoriteIcon}
            onPress={() => navigation.navigate("Favorites")}
          >
            <MaterialIcons name="favorite" size={40} color="purple" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.specialOffersSection}>
          <Text style={styles.sectionTitle}>Offres Spéciales</Text>
          <FlatList
            data={specialOffers}
            renderItem={renderSpecialOfferItem}
            keyExtractor={(item) => item.id}
            horizontal
          />
        </View>
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
          />
        </View>
        <View style={styles.recommendedSection}>
          <Text style={styles.sectionTitle}>Recommandé pour Vous</Text>
          <View style={styles.container}>
            {successMessage ? (
              <Text style={styles.successMessage}>{successMessage}</Text>
            ) : null}
            {errorMessage ? (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}
            {/* <FlatList
              data={filteredServices}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.ID.toString()}
              contentContainerStyle={styles.serviceList}
            /> */}
            <FlatList
              data={filteredServices}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.ID.toString()}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1} // Trigger load more when 10% from the bottom
              ListFooterComponent={() =>
                loading ? <Text>Loading...</Text> : null
              }
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },

  // backgroundImage: {
  //   position: 'absolute',
  //   width: '100%',
  //   height: '80%',
  //   resizeMode: 'cover',
  //   borderBottomWidth: 4,
  //   borderBottomColor: 'black',
  // },
  // header: {
  //   padding: 30,
  //   bottom: 5,
  //   // backgroundColor: "#f5f5f5",
  //   backgroundColor:  'rgba(255, 255, 255, 0)',
  //   borderBottomWidth: 2,
  //   borderColor: "#ccc",
  //   borderRadius: 50,
  //   overflow: "hidden",
  // },
  header: {
    padding: 30,
    backgroundColor: "#f5f5f5", // Fond transparent
    // borderBottomWidth: 2, // Épaisseur de la bordure inférieure
    // borderBottomColor: "#ccc", // Couleur de la bordure inférieure
    // borderRadius: 50,
    overflow: "hidden",
    alignItems: "center",
    width: "100%",
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },

  searchAndIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },

  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "white",
    borderRadius: 40,
    paddingHorizontal: 10,
    marginRight: 10,
  },

  scrollContainer: {
    paddingBottom: 20,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
  },
  specialOffersSection: {
    marginBottom: 20,
  },
  specialOfferItem: {
    marginBottom: 10,
    alignItems: "center",
  },
  specialOfferImage: {
    width: 300,
    height: 200,
    borderRadius: 8,
    marginRight: 10,
  },
  specialOfferText: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 10,
    borderRadius: 5,
  },
  specialOfferTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  specialOfferDescription: {
    color: "#fff",
    fontSize: 14,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoryItem: {
    marginRight: 10,
    alignItems: "center",
  },
  categoryItemContent: {
    alignItems: "center",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    color: "#343a40",
  },
  recommendedSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    padding: 10,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  // searchInput: {
  //   flex: 1,
  //   borderWidth: 1,
  //   borderColor: "#ccc",
  //   borderRadius: 5,
  //   padding: 5,
  //   height: 40,
  // },
  favoriteButton: {
    position: "absolute",
    right: 0,
    top: 10,
  },
  serviceList: {
    paddingBottom: 16,
  },
  serviceItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceImage: {
    width: 200,
    height: 250,
    borderRadius: 8,
  },

  // favorited: {
  //   backgroundColor: "#FFD700",
  // },
  serviceDetails: {
    marginTop: 16,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  serviceDescription: {
    marginBottom: 8,
  },
  servicePrice: {
    marginBottom: 8,
  },
  serviceDate: {
    marginBottom: 8,
  },
  selectDateButton: {
    color: "#007BFF",
    marginBottom: 8,
  },
  reserveButton: {
    backgroundColor: "#28a745",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  reserveButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  serviceProviderTitle: {
    marginTop: 16,
    fontWeight: "bold",
  },
  starContainer: {
    flexDirection: "row",
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  successMessage: {
    color: "green",
    marginBottom: 16,
  },
  errorMessage: {
    color: "red",
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 16,
  },
  filterText: {
    marginLeft: 8,
  },
  filterMenu: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
    elevation: 5,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  filterOption: {
    paddingVertical: 8,
  },
  selectedFilterOption: {
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
  filterInput: {
    height: 40,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  applyFilterButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  applyFilterButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default HomeScreen;
