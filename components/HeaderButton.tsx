import React from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  GestureResponderEvent,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const HeaderButton = ({
  text,
  handlePress,
  textStyles,
  isLoading,
}: {
  text: string;
  handlePress?: (event: GestureResponderEvent) => void;
  textStyles?: string;
  isLoading?: boolean;
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`mx-2 -my-5 p-2 min-h-[40px] flex flex-row justify-center items-center`}
    >
      <Text
        className={`text-black text-xl font-semibold font-psemibold ${textStyles}`}
      >
        {text}
      </Text>
      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#fff"
          size="small"
          className="ml-2"
        />
      )}
    </TouchableOpacity>
  );
};

export default HeaderButton;
