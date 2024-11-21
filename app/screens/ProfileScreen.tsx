import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import { format, parseISO } from 'date-fns';
const { width } = Dimensions.get("window");
import Icon from "react-native-vector-icons/MaterialIcons";
import { MaterialIcons } from '@expo/vector-icons';
const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [image, setImage] = useState(null);
  const [localImageUri, setLocalImageUri] = useState(null);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  // const fetchUserData = useCallback(async () => {
  //   try {
  //     const token = await AsyncStorage.getItem("jwt");
  //     const response = await axios.get(
  //       "http://192.168.1.19:3000/users/profile",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     setUser(response.data);
  //     setEditedUser(response.data);
  //   } catch (error) {
  //     console.error("Error fetching user data:", error);
  //   }
  // }, []);
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("jwt");
      const response = await axios.get(
        "http://192.168.1.210:3000/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data);
      setEditedUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Sorry, we need camera roll permissions to make this work!"
        );
      }
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditedUser(user);
  };

  const handleChange = (name, value) => {
    setEditedUser({
      ...editedUser,
      [name]: value,
    });
  };

  // Formatage de la date
const formatDate = (dateString) => {
  if (!dateString) return "Non renseigné";

  try {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy'); // Formate la date au format jour/mois/année
  } catch (error) {
    return "Date invalide";
  }
};

  const handleImagePick = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;
        setImage(imageUri);

        const fileUri = `${FileSystem.cacheDirectory}profile-image.jpg`;

        try {
          await FileSystem.copyAsync({
            from: imageUri,
            to: fileUri,
          });
          setLocalImageUri(fileUri);
        } catch (error) {
          console.error("Error saving image:", error);
          Alert.alert("Error", "Failed to save image.");
        }
      } else {
        Alert.alert("Error", "No image selected or URI is invalid.");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      Alert.alert("Error", "No image selected.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: image,
        type: "image/jpeg",
        name: "profile-image.jpg",
      });

      const token = await AsyncStorage.getItem("jwt");
      const response = await axios.post(
        `http://192.168.1.210:3000/users/${user.id}/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUser(response.data);
      setImage(null);
      Alert.alert("Success", "Image de profil mise à jour avec succès !");
    } catch (error) {
      console.error("Error uploading profile image:", error);
      Alert.alert("Error", "Failed to upload image.");
    }
  };

  const handleImageDelete = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const response = await axios.delete(
        `http://192.168.1.210:3000/users/${user.id}/image`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data);
      Alert.alert("Success", "Image de profil supprimée avec succès !");
    } catch (error) {
      console.error("Error deleting profile image:", error);
      Alert.alert("Error", "Failed to delete image.");
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const decoded = jwtDecode(token); // decode token to get user id
      const userId = decoded.id;

      // Convert numeric values to integers
      const updatedUser = {
        ...editedUser,
        Num: parseInt(editedUser.Num, 10) || null,
      };

      console.log("Sending data:", updatedUser); // Log the data to be sent

      const response = await axios.put(
        `http://192.168.1.210:3000/users/${userId}`,
        updatedUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
      setEditing(false);
      Alert.alert("Success", "Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Error updating user profile:", error.response || error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("jwt");
      navigation.navigate("Welcome");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

 
//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>Mon Profil</Text>
//       {loading ? (
//         <ActivityIndicator size="large" color="#0000ff" />
//       ) : (
//         user && (
//           <>
//             <View style={styles.profileCard}>
//               <View style={styles.imageContainer}>
//                 {user.image || localImageUri ? (
//                   <Image
//                     source={{ uri: localImageUri || user.image }}
//                     style={styles.profileImage}
//                   />
//                 ) : (
//                   <Image
//                     source={require("../../assets/images/travail-en-equipe.png")}
//                     style={styles.profileImage}
//                   />
//                 )}
//               </View>
//               {editing && (
//                 <View style={styles.imageButtonContainer}>
//                   <TouchableOpacity
//                     style={styles.imageButton}
//                     onPress={handleImagePick}
//                   >
//                     <Text style={styles.imageButtonText}>Choisir une image</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={styles.imageButton}
//                     onPress={handleImageUpload}
//                   >
//                     <Text style={styles.imageButtonText}>Télécharger</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={styles.imageButton}
//                     onPress={handleImageDelete}
//                   >
//                     <Text style={styles.imageButtonText}>Supprimer</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>
//             <View style={styles.infoCard}>
//               {editing ? (
//                 <>
//                   <View style={styles.infoItem}>
//                     <Icon name="person" size={24} color="#ffffff" />
//                     <TextInput
//                       style={styles.input}
//                       placeholder="Nom"
//                       value={editedUser.Nom || ""}
//                       onChangeText={(text) => handleChange("Nom", text)}
//                     />
//                   </View>
//                   <View style={styles.infoItem}>
//                     <Icon name="person-outline" size={24} color="#ffffff" />
//                     <TextInput
//                       style={styles.input}
//                       placeholder="Prénom"
//                       value={editedUser.Prenom || ""}
//                       onChangeText={(text) => handleChange("Prenom", text)}
//                     />
//                   </View>
//                   <View style={styles.infoItem}>
//                     <Icon name="email" size={24} color="#ffffff" />
//                     <TextInput
//                       style={styles.input}
//                       placeholder="Email"
//                       keyboardType="email-address"
//                       value={editedUser.Email || ""}
//                       onChangeText={(text) => handleChange("Email", text)}
//                     />
//                   </View>
//                   <View style={styles.infoItem}>
//                     <Icon name="phone" size={24} color="#ffffff" />
//                     <TextInput
//                       style={styles.input}
//                       placeholder="Numéro"
//                       keyboardType="numeric"
//                       value={editedUser.Num ? editedUser.Num.toString() : ""}
//                       onChangeText={(text) => handleChange("Num", text)}
//                     />
//                   </View>
//                 </>
//               ) : (
//                 <>
//                   <View style={styles.infoItem}>
//                     <Text style={styles.infoLabel}>Nom :</Text>
//                     <Text style={styles.infoValue}>{user.Nom}</Text>
//                   </View>
//                   <View style={styles.infoItem}>
//                     <Text style={styles.infoLabel}>Prénom :</Text>
//                     <Text style={styles.infoValue}>{user.Prenom}</Text>
//                   </View>
//                   <View style={styles.infoItem}>
//                     <Text style={styles.infoLabel}>Email :</Text>
//                     <Text style={styles.infoValue}>{user.Email}</Text>
//                   </View>
//                   <View style={styles.infoItem}>
//                     <Text style={styles.infoLabel}>Numéro :</Text>
//                     <Text style={styles.infoValue}>
//                       {user.Num ? user.Num.toString() : "Non renseigné"}
//                     </Text>
//                   </View>
//                   <View style={styles.infoItem}>
//                     <Text style={styles.infoLabel}>Bio :</Text>
//                     <Text style={styles.infoValue}>{user.Bio}</Text>
//                   </View>
//                   <View style={styles.infoItem}>
//                     <Text style={styles.infoLabel}>Date de Naissance :</Text>
//                     <Text style={styles.infoValue}>
//                       {formatDate(user.DateNaissance)}
//                     </Text>
//                   </View>
//                 </>
//               )}
//             </View>
//             {editing ? (
//               <View style={styles.buttonContainer}>
//                 <Button title="Enregistrer" onPress={handleSubmit} />
//                 <Button
//                   title="Annuler"
//                   onPress={handleCancelEdit}
//                   color="#FF3B30"
//                 />
//               </View>
//             ) : (
//               <View style={styles.buttonContainer}>
//                 <Button title="Modifier" onPress={handleEdit} />
//                 <Button
//                   title="Déconnexion"
//                   onPress={handleLogout}
//                   color="#FF3B30"
//                 />
//               </View>
//             )}
//           </>
//         )
//       )}
//     </ScrollView>
//   );
  
// };
return (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.header}>Mon Profil</Text>
    {loading ? (
      <ActivityIndicator size="large" color="#0000ff" />
    ) : (
      user && (
        <>
          <View style={styles.profileCard}>
            <View style={styles.imageContainer}>
              {user.image || localImageUri ? (
                <Image
                  source={{ uri: localImageUri || user.image }}
                  style={styles.profileImage}
                />
              ) : (
                <Image
                  source={require("../../assets/images/travail-en-equipe.png")}
                  style={styles.profileImage}
                />
              )}
            </View>
            {editing && (
              <View style={styles.imageButtonContainer}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={handleImagePick}
                >
                  <Text style={styles.imageButtonText}>Choisir une image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={handleImageUpload}
                >
                  <Text style={styles.imageButtonText}>Télécharger</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={handleImageDelete}
                >
                  <Text style={styles.imageButtonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.infoCard}>
            {editing ? (
              <>
                <View style={styles.infoItem}>
                <MaterialIcons name="person" size={24} color="#ffffff" />
                  <TextInput
                    style={styles.input}
                    placeholder="Nom"
                    value={editedUser.Nom || ""}
                    onChangeText={(text) => handleChange("Nom", text)}
                  />
                </View>
                <View style={styles.infoItem}>
                  <Icon name="person-outline" size={24} color="#ffffff" />
                  <TextInput
                    style={styles.input}
                    placeholder="Prénom"
                    value={editedUser.Prenom || ""}
                    onChangeText={(text) => handleChange("Prenom", text)}
                  />
                </View>
                <View style={styles.infoItem}>
                  <Icon name="email" size={24} color="#ffffff" />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    value={editedUser.Email || ""}
                    onChangeText={(text) => handleChange("Email", text)}
                  />
                </View>
                <View style={styles.infoItem}>
                  <Icon name="phone" size={24} color="#ffffff" />
                  <TextInput
                    style={styles.input}
                    placeholder="Numéro"
                    keyboardType="numeric"
                    value={editedUser.Num ? editedUser.Num.toString() : ""}
                    onChangeText={(text) => handleChange("Num", text)}
                  />
                </View>
                <View style={styles.infoItem}>
                  <Icon name="Bio" size={24} color="#ffffff" />
                  <TextInput
                    style={styles.input}
                    placeholder="Bio"
                    keyboardType="email-address"
                    value={editedUser.Bio || ""}
                    onChangeText={(text) => handleChange("Bio", text)}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoItem}>
                  <Icon name="person" size={24} color="#ffffff" />
                  <Text style={styles.infoLabel}>Nom :</Text>
                  <Text style={styles.infoValue}>{user.Nom}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="person-outline" size={24} color="#ffffff" />
                  <Text style={styles.infoLabel}>Prénom :</Text>
                  <Text style={styles.infoValue}>{user.Prenom}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="email" size={24} color="#ffffff" />
                  <Text style={styles.infoLabel}>Email :</Text>
                  <Text style={styles.infoValue}>{user.Email}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="phone" size={24} color="#ffffff" />
                  <Text style={styles.infoLabel}>Numéro :</Text>
                  <Text style={styles.infoValue}>
                    {user.Num ? user.Num.toString() : "Non renseigné"}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="info" size={24} color="#ffffff" />
                  <Text style={styles.infoLabel}>Bio :</Text>
                  <Text style={styles.infoValue}>{user.Bio}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="calendar-today" size={24} color="#ffffff" />
                  <Text style={styles.infoLabel}>Date de Naissance :</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(user.DateNaissance)}
                  </Text>
                </View>
              </>
            )}
          </View>
          {editing ? (
            <View style={styles.buttonContainer}>
              <Button title="Enregistrer" onPress={handleSubmit} />
              <Button
                title="Annuler"
                onPress={handleCancelEdit}
                color="#FF3B30"
              />
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <Button title="Modifier" onPress={handleEdit} />
              <Button
                title="Déconnexion"
                onPress={handleLogout}
                color="#FF3B30"
              />
            </View>
          )}
        </>
      )
    )}
  </ScrollView>
);
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  
  header: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#3A3A3A", 
  },
  profileCard: {
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#D8BFD8",
  },
  imageContainer: {
    marginBottom: 10,
  },
  profileImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    borderWidth: 2,
    borderColor: "#D8BFD8",
    backgroundColor: "#E0E0E0",
  },
  imageButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  imageButton: {
    backgroundColor: "#E8D6D0",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  imageButtonText: {
    color: "#3A3A3A", 
    fontSize: 16,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  
  infoValue: {
    flex: 1,
    color: "#6D6D6D",
  },
  input: {
    flex: 1,
    marginLeft: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#D8BFD8",
    borderRadius: 4,
  },
  
  // buttonContainer: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  // },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButton: {
    backgroundColor: '#4CAF50', // Vert pour le bouton "Modifier"
  },
  logoutButton: {
    backgroundColor: '#FF3B30', // Rouge pour le bouton "Déconnexion"
  },
});

export default ProfileScreen;
