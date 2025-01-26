import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  View,
} from "react-native";
import React from "react";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
type PosProps = {
  re: number;
  ro: number;
};
type RoomProps = {
  re: number;
  ro: number;
  target: number;
  setTarget: (num: number) => void;
};

type data = {
  gameId: string;
  playerId: string;
  role: string;
  pos: number[];
};
const RoomCard: React.FC<RoomProps> = ({ re, ro, target, setTarget }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [seekerSelected, setSeekerSelected] = useState(false);
  const [won, setWon] = useState(false);
  const url = Constants.expoConfig?.extra?.API_URL ?? "http://localhost:3000";

  useEffect(() => {
    if (ro === target) {
      setIsSelected(true);
    } else {
      setIsSelected(false);
    }
  }, [target]);
  useEffect(() => {
    const socket = io(url);

    socket.on("seeker-update", async (data) => {
      const player = await getData("player");

      if (
        player &&
        player.role === "Seeker" &&
        data.status === "WON" &&
        data.position[1] === ro
      ) {
        setWon(true);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    const socket = io(url);
    socket.on("seeker-coords-update", async (seekerCoords) => {
      const player = await getData("player");
      if (seekerCoords.length > 0 && player && player.role === "Hider") {
        if (re === seekerCoords[0]) {
          if (ro === seekerCoords[1]) {
            setSeekerSelected(true);
          } else {
            setSeekerSelected(false);
          }
        }
      }
    });
    // return () => {
    //   socket.disconnect();
    // };
  }, []);
  const getData = async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      // error reading value
    }
  };

  const updatePos = async () => {
    const socket = io(url);

    const player = await getData("player");

    if (player && player.role === "Hider" && player.status === "HIDDEN") {
      return;
    }

    setTarget(ro);

    const data: data = {
      gameId: player.game_id,
      playerId: player._id,
      role: player.role,
      pos: [re, ro],
    };
    socket.emit("position-update", data);
  };
  return (
    <TouchableOpacity
      style={[
        styles.container,
        won
          ? { backgroundColor: "green" }
          : seekerSelected
          ? { backgroundColor: "red" }
          : isSelected && { backgroundColor: "gray" },
      ]}
      onPress={updatePos}
    >
      <FontAwesome5 name="question" size={24} color="black" />
    </TouchableOpacity>
  );
};

export default RoomCard;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get("window").width / 2,
    height: (Dimensions.get("window").height - 230) / 3,
    position: "relative",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
});
