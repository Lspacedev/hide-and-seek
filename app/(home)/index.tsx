import {
  Text,
  TextInput,
  Modal,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

import Constants from "expo-constants";
import RegionCard from "@/components/RegionCard";
import AntDesign from "@expo/vector-icons/AntDesign";

type PlayerType = {
  game_id: string;
  name: string;
  role: string;
  position: number[];
  status: string;
  joined: boolean;
  _id: string;
};

type Region = {
  id: number;
  name: string;
  plays: number;
};
type GameType = {
  name: string;
  code: string;
  regions: Region[];
  rooms: number[];
  totalPlays: number;
  seeker_joined: boolean;
  all_hiders_joined: boolean;
  seeker_seeking: boolean;
  all_hiders_hidden: boolean;
  _id: string;
};
export default function Index() {
  const [player, setPlayer] = useState<PlayerType | null>(null);
  const [game, setGame] = useState<GameType | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [codeModal, setCodeModal] = useState(true);
  const url = Constants.expoConfig?.extra?.API_URL ?? "http://localhost:3000";

  useEffect(() => {
    (async () => {
      let codeModal = await getData("codeModal");
      if (codeModal !== null) {
        setCodeModal(codeModal);
      }
    })();
  }, []);
  useEffect(() => {
    if (player && player.role === "Seeker") {
      if (player.status === "SEEKING") {
        setIsAllowed(true);
      }
    }
    if (player && player.role === "Hider") {
      if (player.status === "HIDDEN") {
        setIsAllowed(false);
      } else if (game && !game.seeker_joined) {
        setIsAllowed(false);
      } else {
        setIsAllowed(true);
      }
    }
  }, [player, game]);
  useFocusEffect(
    useCallback(() => {
      getPlayer();
      getGame();
    }, [])
  );

  useEffect(() => {
    const socket = io(url);

    socket.on("game-deleted", async () => {
      await AsyncStorage.clear();
      router.push({ pathname: "/(auth)" });
    });
    socket.on("game-status-update", async (updatedGame) => {
      await AsyncStorage.removeItem("game");
      await AsyncStorage.setItem("game", JSON.stringify(updatedGame));
      getGame();
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const getData = async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      // error reading value
    }
  };

  const getPlayer = async () => {
    setLoading(true);
    try {
      const data = await AsyncStorage.getItem("player");
      if (data !== null) {
        const obj = JSON.parse(data);
        setPlayer(obj);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data", error);
      setLoading(false);
    }
  };

  const getGame = async () => {
    setLoading(true);
    try {
      const data = await AsyncStorage.getItem("game");
      if (data !== null) {
        const obj = JSON.parse(data);
        setGame(obj);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data", error);
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
    } catch (error) {
      console.log("Error", error);
    }
  };

  const getStatus = () => {
    if (player && player?.role === "Seeker") {
      if (game && game?.all_hiders_joined === false) {
        return "Waiting for hiders to join game";
      } else if (game && game?.all_hiders_hidden === false) {
        return "Waiting for hiders to hide";
      } else if (game && game?.all_hiders_hidden === true) {
        return "Hiders have now hidden somewhere";
      }
    } else {
      if (game && game?.seeker_joined === false) {
        return "Waiting for seeker to join";
      } else if (
        game &&
        game?.seeker_joined === true &&
        player?.status !== "HIDDEN"
      ) {
        return "Look for a place to hide";
      } else if (
        game &&
        game?.seeker_joined === true &&
        player?.status === "HIDDEN"
      ) {
        return "Waiting for seeker to start seeking";
      } else if (game && game?.seeker_seeking === true) {
        return "Seker is now seeking";
      }
    }
  };
  const seek = async () => {
    setLoading(true);
    const socket = io(url);
    socket.emit("start-seeking", { playerId: player?._id });
    socket.on("seeker-update", async (data) => {
      if (player?._id === data._id) {
        await AsyncStorage.removeItem("player");
        await AsyncStorage.setItem("player", JSON.stringify(data));
        getPlayer();
        setLoading(false);
      }
    });
  };
  const quit = async () => {
    try {
      const res = await fetch(`${url}/api/games/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId: game?._id }),
      });
      const data = await res.json();
      if (!data.error) {
        router.push({ pathname: "/(auth)" });
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  };
  if (loading) return <ActivityIndicator />;
  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={codeModal && player?.name === "Player 1"}
        onRequestClose={async () => {
          setCodeModal(!codeModal);
          await AsyncStorage.removeItem("codeModal");
          await AsyncStorage.setItem("codeModal", JSON.stringify(false));
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalHeading}>INVITE CODE</Text>
            <Text style={styles.code}>{game?.code}</Text>

            <Text style={styles.modalText}>
              Use code to allow other players to join.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={async () => {
                setCodeModal(!codeModal);
                await AsyncStorage.removeItem("codeModal");
                await AsyncStorage.setItem("codeModal", JSON.stringify(false));
              }}
            >
              <Text style={styles.modalBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.parent}>
        <View style={styles.header}>
          <View style={styles.gameRoute}>
            <Text style={styles.headerText}>LOBBY</Text>
            <Text style={styles.codeText}>{`Game Code: ${game?.code}`}</Text>
          </View>
          <View style={styles.gamePanel}>
            <View style={styles.comp}>
              <Text style={styles.text}>{`Total Plays: ${
                game && game.totalPlays
              }`}</Text>
            </View>
            <TouchableOpacity style={styles.comp} onPress={quit}>
              <Text style={styles.text}>Quit</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.gameArea}>
          {game && game.regions && game.regions.length > 0 ? (
            <FlatList
              contentContainerStyle={{ padding: 0 }}
              data={game.regions}
              numColumns={2}
              columnWrapperStyle={{ gap: 5, marginVertical: 5 }}
              renderItem={({ item }) => {
                return <RegionCard region={item} isAllowed={isAllowed} />;
              }}
            />
          ) : (
            <Text>Empty</Text>
          )}
        </View>
        {player &&
          player.role === "Seeker" &&
          player.status !== "SEEKING" &&
          player.status !== "WON" &&
          game?.all_hiders_hidden && (
            <TouchableOpacity
              style={styles.btn}
              onPress={loading ? () => console.log() : () => seek()}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.btnText}>Seek</Text>
              )}
            </TouchableOpacity>
          )}
        <View style={styles.statusBar}>
          <Text style={styles.text}>{getStatus()}</Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 0,
  },

  parent: {
    flex: 1,
  },
  header: {
    flex: 1,
    paddingTop: 50,
    height: 100,
    backgroundColor: "#343434",
  },
  headerText: {
    color: "white",
    fontSize: 25,
  },
  gameRoute: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gamePanel: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  comp: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBar: {
    flex: 1,
    height: 100,
    backgroundColor: "#343434",
    alignItems: "center",
    justifyContent: "center",
  },
  gameArea: {
    flex: 5,
    paddingHorizontal: 5,
    backgroundColor: "#F7FFF7",
  },

  text: {
    textAlign: "center",
    textTransform: "uppercase",
    padding: 0,
    color: "whitesmoke",
  },
  code: {
    textAlign: "center",
    padding: 0,
    color: "whitesmoke",
    backgroundColor: "#262626",
    paddingVertical: 15,
    paddingHorizontal: 35,
    fontSize: 25,
    borderRadius: 60,
  },
  codeText: {
    fontSize: 17,
    textAlign: "center",
    color: "gray",
    marginHorizontal: 25,
    marginVertical: 10,
  },
  btn: {
    marginVertical: 20,
    marginHorizontal: 15,
    backgroundColor: "#262626",
    padding: 20,
    borderRadius: 45,
    alignItems: "center",
  },
  btnText: {
    textAlign: "center",
    color: "whitesmoke",
  },
  input: {
    borderRadius: 5,
    borderColor: "#BDBDBD",
    padding: 5,
    marginVertical: 15,
    paddingHorizontal: 10,
    color: "#BDBDBD",
    borderWidth: 0.8,
    width: "100%",
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
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: "center",
    gap: 25,
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
    textAlign: "center",
    color: "white",
    marginHorizontal: 25,
  },
  modalButton: {
    marginTop: 25,
    backgroundColor: "whitesmoke",
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
  },
  modalBtnText: {
    fontSize: 17,
    textAlign: "center",
    color: "#262626",
    marginHorizontal: 25,
  },
  close: {
    width: "100%",
    alignItems: "flex-end",
    marginVertical: 20,
  },
});
