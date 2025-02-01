import { Href, router } from "expo-router";
import {
  Text,
  TextInput,
  View,
  ScrollView,
  Image,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
} from "@expo-google-fonts/poppins";
import Constants from "expo-constants";
import { RadioButton, RadioGroup } from "@/components/RadioButton";
type InputType =
  | string
  | Number
  | NativeSyntheticEvent<TextInputChangeEventData>;
export default function joinGame() {
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
  });
  const [loading, setLoading] = useState(false);
  const [gameCode, setGameCode] = useState<InputType>("");
  const [selectedRoleValue, setSelectedRoleValue] = useState("");
  const [error, setError] = useState<InputType>("");
  const url = Constants.expoConfig?.extra?.API_URL ?? "http://localhost:3000";

  const joinGame = async () => {
    try {
      if (gameCode === "") {
        Alert.alert("Game code required");
        return;
      }
      setLoading(true);

      const res = await fetch(`${url}/api/games/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: gameCode }),
      });
      const data = await res.json();
      if (!data.error) {
        await AsyncStorage.setItem("player", JSON.stringify(data.player));
        await AsyncStorage.setItem("game", JSON.stringify(data.game));
        await AsyncStorage.setItem("gameId", JSON.stringify(data.game._id));

        router.push({ pathname: "/(home)" });
      } else {
        Alert.alert(data.error);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  if (!fontsLoaded) {
    return <View></View>;
  } else {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.parent}>
          <View style={styles.logo_container}>
            <Text style={styles.logo_text}>HIDE</Text>
            <View style={styles.iconContainer}>
              <Text style={styles.icon_text}>&</Text>

              <Image
                source={require("@/assets/images/business_16623349.png")}
                resizeMode="cover"
                style={styles.img}
              />
            </View>
            <Text style={styles.logo_text}>SEEK</Text>
          </View>
          <View style={styles.inputs}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Enter game code</Text>
              <TextInput
                style={styles.input}
                placeholder={"Game code"}
                placeholderTextColor={"#717171"}
                onChangeText={(text) => setGameCode(text)}
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={loading ? () => console.log() : () => joinGame()}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.buttonText}>JOIN</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <StatusBar backgroundColor="#010709" />
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
    backgroundColor: "#F7FFF7",
  },
  parent: {
    flex: 1,
  },
  logo_container: {
    flex: 2,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
  },
  icon_text: {
    fontSize: 60,
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
    marginVertical: 5,
  },
  img: {
    width: 80,
    height: 80,
  },
  logo_text: {
    fontSize: 30,
    //fontWeight: 600,
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
    marginVertical: 0,
    padding: 0,
  },
  scrollView: {
    gap: 15,
    paddingVertical: 20,
  },

  formTitle: {
    fontSize: 36,
    fontFamily: "Poppins_400Regular",
    marginVertical: 10,
    color: "#F7F0F0",
    textAlign: "center",
  },
  inputs: {
    flex: 5,
    gap: 5,
    marginVertical: 5,
  },
  inputContainer: {
    gap: 10,
    marginHorizontal: 15,
  },

  label: {
    fontSize: 15,
    color: "343434",
  },
  input: {
    borderRadius: 7,
    borderColor: "#BDBDBD",
    padding: 15,
    paddingHorizontal: 10,

    color: "#BDBDBD",
    borderWidth: 0.8,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    marginHorizontal: 15,
    backgroundColor: "#262626",
    padding: 25,
    borderRadius: 45,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    textTransform: "uppercase",
    fontSize: 15,
  },
});
