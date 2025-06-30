import { Slot } from "expo-router";
import React from "react";
import Toast from "react-native-toast-message";

export const unstable_settings = {
  initialRouteName: "tabs",
  groups: {
    auth: "(auth)/*",
    tabs: "(tabs)/*",
  },
};

export default function RootLayout() {
  return (
    <>
      <Slot />
      <Toast />
    </>
  );
}
