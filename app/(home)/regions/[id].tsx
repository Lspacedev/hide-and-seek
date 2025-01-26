import { useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  Text,
  ScrollView,
  FlatList,
  Dimensions,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from "react-native";
import React from "react";
import RoomCard from "@/components/RoomCard";
import { io } from "socket.io-client";
import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, router, useNavigation } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
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
type PosProps = {
  re: number;
  ro: number;
};

type data = {
  playerId: string;
  role: string;
  pos: PosProps[];
};
const Region = () => {
  const [player, setPlayer] = useState<PlayerType | null>(null);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState(-1);
  const [plays, setPlays] = useState(3);
  const [regionName, setRegionName] = useState("");

  const [modalVisible, setModalVisible] = useState(false);

  const { id } = useLocalSearchParams();

  const url = Constants.expoConfig?.extra?.API_URL ?? "http://localhost:3000";
  const navigation = useNavigation();

  // Effect
  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      if (
        e.data.action.type === "GO_BACK" &&
        player?.role === "Hider" &&
        player?.status === "HIDDEN"
      ) {
        e.preventDefault();
      }
    });
  }, [player]);

  useEffect(() => {
    (async () => {
      const game = await getData("game");
      const [region] = game?.regions.filter(
        (region: Region) => region.id === Number(id)
      );

      const gamePlays = region.plays;
      setPlays(gamePlays);
    })();
  }, []);
  useFocusEffect(
    useCallback(() => {
      getPlayer();
      getRegion();
    }, [])
  );
  useEffect(() => {
    gameResults();
  }, [player]);
  useFocusEffect(
    useCallback(() => {
      const getPlays = async () => {
        const socket = io(url);

        socket.on("game-status-update", async (updatedGame) => {
          const [region] = updatedGame.regions.filter(
            (region: Region) => region.id === Number(id)
          );

          const gamePlays = region.plays;
          setPlays(gamePlays);
        });
      };
      getPlays();
    }, [])
  );
  useEffect(() => {
    const socket = io(url);

    socket.on("seeker-update", async (data) => {
      if (player?.role === "Seeker" && player?._id === data._id) {
        await AsyncStorage.removeItem("player");
        await AsyncStorage.setItem("player", JSON.stringify(data));
        getPlayer();
      }
    });

    // return () => {
    //   socket.disconnect();
    // };
  }, [player]);

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
  const getRegion = async () => {
    const game = await getData("game");
    const [region] = game.regions.filter(
      (region: Region) => region.id === Number(id)
    );

    setRegionName(region.name);
  };

  const gameResults = async () => {
    if (player?.status === "LOST" || player?.status === "WON") {
      setModalVisible(true);
    }
  };
  const endGame = async () => {
    const game = await getData("game");

    try {
      const res = await fetch(`${url}/api/games/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId: game?._id, playerId: player?._id }),
      });
      const data = await res.json();
      if (!data.error) {
        await AsyncStorage.clear();
        setModalVisible(false);

        router.push({ pathname: "/(auth)" });
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  };
  const quitGame = async () => {
    const game = await getData("game");

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
        await AsyncStorage.clear();
        setModalVisible(false);

        router.push({ pathname: "/(auth)" });
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  };
  const hide = async () => {
    if (target === -1) {
      Alert.alert("No target selected");
      return;
    }
    setLoading(true);
    //emit id and target to server
    const socket = io(url);
    const data = {
      gameId: player?.game_id,
      playerId: player?._id,
      role: player?.role,
      pos: [Number(id), target],
    };
    socket.emit("hide-position-update", data);
    socket.on("hider-update", async (data) => {
      if (player?._id === data._id) {
        await AsyncStorage.removeItem("player");
        await AsyncStorage.setItem("player", JSON.stringify(data));
        getPlayer();
        setLoading(false);
      }
    });
  };
  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text
              style={styles.modalText}
            >{`Game Over. You ${player?.status}`}</Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={endGame}
            >
              <Text style={styles.textStyle}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.parent}>
        <View style={styles.header}>
          <View style={styles.gameRoute}>
            <Text style={styles.headerText}>{regionName}</Text>
          </View>
          <View style={styles.gamePanel}>
            {player &&
              player.role === "Seeker" &&
              player.status === "SEEKING" && (
                <View style={styles.comp}>
                  <Text style={styles.text}>{`Plays : ${plays}/3`}</Text>
                </View>
              )}

            <TouchableOpacity style={styles.comp} onPress={quitGame}>
              <Text style={styles.text}>Quit</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.gameArea}>
          <FlatList
            contentContainerStyle={{ padding: 0 }}
            data={[1, 2, 3, 4, 5, 6]}
            numColumns={2}
            columnWrapperStyle={{ gap: 2, marginVertical: 2 }}
            renderItem={({ item }) => {
              return (
                <RoomCard
                  re={Number(id)}
                  ro={item}
                  target={target}
                  setTarget={(num) => setTarget(num)}
                />
              );
            }}
          />
        </View>
        {player &&
          player.role === "Hider" &&
          player.status !== "HIDDEN" &&
          player.status !== "LOST" && (
            <TouchableOpacity
              style={styles.btn}
              onPress={loading ? () => console.log() : () => hide()}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.btnText}>Hide</Text>
              )}
            </TouchableOpacity>
          )}
      </View>
    </View>
  );
};

export default Region;
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
    paddingTop: 20,
    height: 100,
    backgroundColor: "#343434",
  },
  headerText: {
    color: "white",
    fontSize: 25,
    textTransform: "uppercase",
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
  btn: {
    marginVertical: 20,
    marginHorizontal: 15,
    backgroundColor: "#262626",
    padding: 20,
    paddingHorizontal: 50,
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
    width: 250,
    height: 150,
    backgroundColor: "whitesmoke",
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
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

  button: {
    borderRadius: 30,
    padding: 15,
    paddingHorizontal: 25,
    elevation: 2,
    backgroundColor: "#262626",
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#262626",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },

  modalText: {
    fontSize: 18,
    textAlign: "center",
  },
});
