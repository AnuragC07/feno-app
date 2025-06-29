import { Slot } from "expo-router";
import React from "react";

export const unstable_settings = {
  initialRouteName: "tabs",
  groups: {
    auth: "(auth)/*",
    tabs: "(tabs)/*",
  },
};

export default function RootLayout() {
  return <Slot />;
}
