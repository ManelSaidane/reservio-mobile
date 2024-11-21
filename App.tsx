import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import store from "./app/reducers/store";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "./app/screens/LoginScreen";
import RegisterClient from "./app/screens/RegisterClient";
import ServiceCard from "./app/screens/ServiceCard ";
import HomeScreen from "./app/screens/HomeScreen";
import WelcomeScreen from "./app/screens/WelcomeScreen";
import FavoritesPage from "./app/screens/FavoritesPage ";
import ProfileScreen from "./app/screens/ProfileScreen";
import NotificationsScreen from "./app/screens/NotificationsScreen";
import SentRequestsScreen from "./app/screens/Pending";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SocketProvider } from "./socket"; // Assurez-vous que le chemin est correct
import PasswordResetRequest from "./app/screens/PasswordResetRequest ";
import PasswordReset from "./app/screens/PasswordReset";
import FilterServices from "./app/screens/FilterServices";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: 'tomato',
      tabBarInactiveTintColor: 'gray',
    }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
       <Tab.Screen
        name="Search"
        component={FilterServices}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Sent Requests"
        component={SentRequestsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="send" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />

    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("jwt");
      setIsAuthenticated(!!token);
    };

    checkAuthentication();
  }, []);

  return (
    <Provider store={store}>
      <SocketProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={isAuthenticated ? "Home" : "Welcome"}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="RegisterClient" component={RegisterClient} />
            <Stack.Screen name="ServiceCard" component={ServiceCard} />
            <Stack.Screen name="Favorites" component={FavoritesPage} />
            <Stack.Screen name="DmPassword" component={PasswordResetRequest} />
            <Stack.Screen name="Reset" component={PasswordReset} />
            {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
            <Stack.Screen
              name="Home"
              component={BottomTabNavigator}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SocketProvider>
    </Provider>
  );
};

export default App;
