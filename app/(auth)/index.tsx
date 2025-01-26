import { Href, router } from "expo-router";
import {
  Text,
  View,
  ScrollView,
  Image,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";
import Constants from "expo-constants";
type InputType =
  | string
  | Number
  | NativeSyntheticEvent<TextInputChangeEventData>;
export default function SignIn() {
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_800ExtraBold,
  });
  const [howToMenu, setHowToMenu] = useState(false);
  const [error, setError] = useState<InputType>("");
  const url = Constants.expoConfig?.extra?.API_URL;

  const goToCreateGame = () => {
    router.push({ pathname: "/(auth)/createGame" });
  };
  const goToJoinGame = () => {
    router.push({ pathname: "/(auth)/joinGame" });
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
        <Modal
          animationType="slide"
          transparent={true}
          visible={howToMenu}
          onRequestClose={() => {
            setHowToMenu(!howToMenu);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.close}
                onPress={() => {
                  setHowToMenu(!howToMenu);
                }}
              >
                <AntDesign name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.modalHeading}>How To Play</Text>
              <Text style={styles.modalText}>
                Start by either creating a new game or joining an existing game.
                Given the role, Hider or Seeker, change your position by
                clicking on the tiles.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setHowToMenu(!howToMenu)}
              >
                <Text style={styles.modalText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.button} onPress={goToCreateGame}>
              <Text style={styles.buttonText}>CREATE GAME</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={goToJoinGame}>
              <Text style={styles.buttonText}>JOIN GAME</Text>
            </TouchableOpacity>
            <Text style={styles.play_text} onPress={() => setHowToMenu(true)}>
              How to play
            </Text>
          </View>
        </View>
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
    fontSize: 85,
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
    marginVertical: 5,
  },
  img: {
    width: 120,
    height: 120,
  },
  logo_text: {
    fontSize: 50,
    //fontWeight: 600,
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
    marginVertical: 0,
    padding: 0,
  },
  scrollView: {
    gap: 15,
  },

  formTitle: {
    fontSize: 36,
    fontFamily: "Poppins_400Regular",
    marginVertical: 10,
    color: "#F7F0F0",
    textAlign: "center",
  },
  inputContainer: {
    gap: 5,
  },
  label: {
    color: "#F7F0F0",
  },
  input: {
    borderRadius: 5,
    borderColor: "#BDBDBD",
    padding: 5,
    paddingHorizontal: 10,
    color: "#BDBDBD",
    borderWidth: 0.8,
  },
  buttons: {
    flex: 2,
    marginHorizontal: 15,
    justifyContent: "flex-start",
  },
  button: {
    backgroundColor: "#262626",
    padding: 25,
    marginTop: 20,
    borderRadius: 45,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    textTransform: "uppercase",
    fontSize: 15,
  },
  play_text: {
    fontSize: 15,
    marginVertical: 20,
    textAlign: "center",
    textTransform: "uppercase",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalView: {
    margin: 20,
    width: 320,
    height: 400,
    backgroundColor: "#343434",
    borderRadius: 5,
    paddingHorizontal: 25,
    alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5,
  },

  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalHeading: {
    fontSize: 25,
    textAlign: "center",
    color: "white",
    marginVertical: 15,
  },
  modalText: {
    fontSize: 17,
    textAlign: "left",
    color: "white",
  },
  modalButton: {
    alignSelf: "baseline",
    marginTop: 25,
    backgroundColor: "#262626",
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
  },
  close: {
    width: "100%",
    alignItems: "flex-end",
    marginVertical: 20,
  },
});
