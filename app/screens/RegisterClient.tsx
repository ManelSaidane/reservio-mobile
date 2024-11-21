// import React, { useState } from "react";
// import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from "react-native";
// import { useDispatch } from "react-redux";
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useNavigation } from '@react-navigation/native';
// import { setUser } from "../redux/Action/authActions";

// const RegisterClient = () => {
//   const [formData, setFormData] = useState({
//     nom: "",
//     prenom: "",
//     email: "",
//     num: "",
//     motDePasse: "",
//     confirmerMotDePasse: "",
//     dateNaissance: "",
//   });
//   const [message, setMessage] = useState<string | null>(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const dispatch = useDispatch();
//   const navigation = useNavigation();

//   const handleChange = (name: string, value: string) => {
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const handleDateChange = (event: any, selectedDate: Date | undefined) => {
//     setShowDatePicker(Platform.OS === 'ios');
//     if (selectedDate) {
//       const formattedDate = selectedDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
//       handleChange('dateNaissance', formattedDate);
//     }
//   };

//   const handleSubmit = async () => {
//     if (formData.motDePasse !== formData.confirmerMotDePasse) {
//       setMessage("Les mots de passe ne correspondent pas");
//       return;
//     }

//     try {
//       const response = await fetch("http://192.168.1.19:3000/auth/signup/client", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           nom: formData.nom,
//           prenom: formData.prenom,
//           email: formData.email,
//           num: formData.num,
//           motDePasse: formData.motDePasse,
//           dateNaissance: formData.dateNaissance,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         dispatch(setUser({ type: "client", token: data.token }));
//         setMessage("Inscription réussie!");
//         navigation.navigate('ServiceCard'); // Naviguer vers ServiceCard après inscription réussie
//       } else {
//         const errorData = await response.json();
//         if (errorData.error === "Email déjà utilisé") {
//           setMessage("L'email est déjà utilisé. Veuillez en choisir un autre.");
//         } else {
//           setMessage("Erreur lors de l'inscription");
//         }
//       }
//     } catch (error) {
//       console.error("Erreur:", error);
//       setMessage("Erreur inattendue lors de l'inscription");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.authPage}>
//         <Text style={styles.title}>Inscription Client</Text>
//         {message && <Text style={styles.message}>{message}</Text>}
//         <View style={styles.form}>
//           <TextInput
//             style={styles.input}
//             placeholder="Nom"
//             onChangeText={(text) => handleChange("nom", text)}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Prénom"
//             onChangeText={(text) => handleChange("prenom", text)}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Numéro de téléphone"
//             keyboardType="phone-pad"
//             onChangeText={(text) => handleChange("num", text)}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Email"
//             keyboardType="email-address"
//             onChangeText={(text) => handleChange("email", text)}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Mot de passe"
//             secureTextEntry
//             onChangeText={(text) => handleChange("motDePasse", text)}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Confirmer le mot de passe"
//             secureTextEntry
//             onChangeText={(text) => handleChange("confirmerMotDePasse", text)}
//           />
//           <View style={styles.datePickerContainer}>
//             <Button title="Choisir la date de naissance" onPress={() => setShowDatePicker(true)} />
//             {showDatePicker && (
//               <DateTimePicker
//                 testID="dateTimePicker"
//                 value={new Date()}
//                 mode="date"
//                 is24Hour={true}
//                 display="default"
//                 onChange={handleDateChange}
//               />
//             )}
//             {formData.dateNaissance ? (
//               <Text style={styles.dateText}>Date de naissance : {formData.dateNaissance}</Text>
//             ) : null}
//           </View>
//           <Button title="Confirmer" onPress={handleSubmit} color="#ff497c" />
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f2eeee",
//     padding: 16,
//   },
//   authPage: {
//     width: "100%",
//     maxWidth: 600,
//     backgroundColor: "#BCADAD",
//     borderRadius: 8,
//     padding: 20,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 16,
//   },
//   message: {
//     color: "red",
//     marginBottom: 15,
//   },
//   form: {
//     width: "100%",
//   },
//   input: {
//     height: 40,
//     borderColor: "#ccc",
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginBottom: 15,
//     width: "100%",
//   },
//   datePickerContainer: {
//     marginBottom: 15,
//     width: "100%",
//   },
//   dateText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: "#333",
//   },
// });

// export default RegisterClient;
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform, Dimensions } from "react-native";
import { useDispatch } from "react-redux";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { setUser } from "../redux/Action/authActions";
import { API_BASE_URL } from '@env';
const { width } = Dimensions.get('window');

const RegisterClient = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    num: "",
    motDePasse: "",
    confirmerMotDePasse: "",
    dateNaissance: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const formatDate = (dateString) => {
    if (!dateString) return "Non renseigné";
  
    // Si c'est un timestamp en millisecondes
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide"; // Vérifie si la date est valide
  
    // Formate la date en DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };
  

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
      handleChange('dateNaissance', formattedDate);
    }
  };

  const handleSubmit = async () => {
    if (formData.motDePasse !== formData.confirmerMotDePasse) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/client`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          num: formData.num,
          motDePasse: formData.motDePasse,
          dateNaissance: formData.dateNaissance,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(setUser({ type: "client", token: data.token }));
        setMessage("Inscription réussie!");
        navigation.navigate('ServiceCard'); // Naviguer vers ServiceCard après inscription réussie
      } else {
        const errorData = await response.json();
        if (errorData.error === "Email déjà utilisé") {
          setMessage("L'email est déjà utilisé. Veuillez en choisir un autre.");
        } else {
          setMessage("Erreur lors de l'inscription");
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage("Erreur inattendue lors de l'inscription");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundOverlay} />
      <View style={styles.authPage}>
        <Text style={styles.title}>Inscription Client</Text>
        {message && <Text style={styles.message}>{message}</Text>}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nom"
            onChangeText={(text) => handleChange("nom", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Prénom"
            onChangeText={(text) => handleChange("prenom", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Numéro de téléphone"
            keyboardType="phone-pad"
            onChangeText={(text) => handleChange("num", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={(text) => handleChange("email", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry
            onChangeText={(text) => handleChange("motDePasse", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            secureTextEntry
            onChangeText={(text) => handleChange("confirmerMotDePasse", text)}
          />
          <View style={styles.datePickerContainer}>
            <Button title="Choisir la date de naissance" onPress={() => setShowDatePicker(true)} color="#ff497c" />
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={new Date()}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={handleDateChange}
              />
            )}
            {formData.dateNaissance ? (
              <Text style={styles.dateText}>Date de naissance : {formData.dateNaissance}</Text>
            ) : null}
          </View>
          <Button title="Confirmer" onPress={handleSubmit} color="#ff497c" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2eeee",
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#BCADAD',
    borderBottomRightRadius: width / 2,
    borderBottomLeftRadius: width / 2,
    height: width,
    zIndex: -1,
  },
  authPage: {
    width: "90%",
    maxWidth: 600,
    backgroundColor: "#ffffff", // Couleur de fond du formulaire
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#BCADAD', // Couleur du texte comme WelcomeScreen
    marginBottom: 16,
  },
  message: {
    color: "red",
    marginBottom: 15,
  },
  form: {
    width: "100%",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: "100%",
  },
  datePickerContainer: {
    marginBottom: 15,
    width: "100%",
  },
  dateText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});

export default RegisterClient;
