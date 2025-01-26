import { ExpoConfig, ConfigContext } from "@expo/config";
import * as dotenv from "dotenv";

// initialize dotenv
dotenv.config();

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: "hide-and-seek",
  name: "hide-and-seek",
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.lspacedev.hideandseek",
  },
  extra: {
    eas: {
      projectId: "2dc5de4b-9f85-43b3-ac63-aba6241dd850",
    },
    API_URL: process.env.API_URL,
  },
});
