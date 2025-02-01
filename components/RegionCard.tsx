import {
  StyleSheet,
  Text,
  Pressable,
  Dimensions,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import React from "react";
import { Link, router } from "expo-router";

type RegionProps = {
  region: {
    id: number;
    name: string;
    plays: number;
  };
  isAllowed: boolean;
};
const RegionCard: React.FC<RegionProps> = ({ region, isAllowed }) => {
  const goToRegion = () => {
    if (isAllowed && region.plays > 0) {
      router.push({
        pathname: "/(home)/regions/[id]",
        params: { id: region.id },
      });
    }
  };
  return (
    <TouchableOpacity
      style={[
        styles.container,
        region.plays === 0 && { backgroundColor: "lightgrey" },
      ]}
      onPress={goToRegion}
    >
      <Image
        source={
          region?.name === "forest"
            ? require("@/assets/images/forest_3238394.png")
            : region?.name === "clouds"
            ? require("@/assets/images/smoke_6853958.png")
            : region?.name === "house"
            ? require("@/assets/images/house.png")
            : region?.name === "city"
            ? require("@/assets/images/city.png")
            : region?.name === "ocean"
            ? require("@/assets/images/sea.png")
            : require("@/assets/images/mountain.png")
        }
        resizeMode="cover"
        style={styles.img}
      />
    </TouchableOpacity>
  );
};

export default RegionCard;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get("window").width / 2,
    height: (Dimensions.get("window").height - 260) / 3,
    position: "relative",
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: 80,
    height: 80,
  },
});
