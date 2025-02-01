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
      foregroundImage: "./assets/images/icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.lspacedev.hideandseek",
  },
  extra: {
    eas: {
      projectId: "b0da8d37-5fc4-431e-8532-0a837bc89ae3",
    },
    API_URL: process.env.API_URL,
  },
});
