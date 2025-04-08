import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  textInputStyles,
  ...props
}: {
  title?: string;
  value: string;
  handleChangeText: (text: string) => void;
  placeholder?: string;
  otherStyles?: string;
  textInputStyles?: string;
} & TextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      {title && (
        <Text className="text-base text-black font-pmedium">{title}</Text>
      )}

      <View
        className={`w-full h-16 px-4 bg-white rounded-xl border-2 border-black-200 flex flex-row items-center ${textInputStyles}`}
      >
        <TextInput
          className="flex-1 text-black font-psemibold text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7B7B8B"
          onChangeText={handleChangeText}
          secureTextEntry={title?.includes("Password") && !showPassword}
          {...props}
        />

        {title?.includes("Password") && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#7B7B8B"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
