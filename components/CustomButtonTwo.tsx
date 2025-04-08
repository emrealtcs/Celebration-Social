import {
  ActivityIndicator,
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";

const CustomButtonTwo = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
  icon,
}: {
  title: string;
  handlePress: (event: GestureResponderEvent) => void;
  containerStyles?: string;
  textStyles?: string;
  isLoading?: boolean;
  icon?: any;
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-black rounded-xl min-h-[62px] flex flex-column px-6 justify-center items-center  ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
      disabled={isLoading}
    >
      {icon && <Image className="w-10 h-10 mr-4 mb-1" source={icon} />}

      <Text className={`text-white font-psemibold text-lg ${textStyles}`}>
        {title}
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

export default CustomButtonTwo;
