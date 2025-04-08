import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'

interface FriendCardProp {
    name: string;
    friendUsername: {
        [key: string]: string; // {uid : username}
        };
    // profilepicture: Image; //how to implement?
    isFriend: boolean;
    requestSent?: boolean;
    requestReceived?: boolean;
  }

//const defaultProfilePicture = require("../../assets/images/placeholder.png");

const FriendComponent = ({name, friendUsername, isFriend, requestSent, requestReceived}: FriendCardProp) => {

    const pending = !isFriend && (requestSent || requestReceived);
    const displayedUsername = friendUsername ? Object.values(friendUsername)[0] : null;

    return (
      <View style={styles.card}>
        {/* Name & Username (Stacked) */}
        <View style={styles.textContainer}>
          <Text style={styles.name}>{name}</Text>
          {displayedUsername && <Text style={styles.username}>@{displayedUsername}</Text>}
        </View>
  
        {/* Right-Aligned Actions */}
        <View style={styles.actionContainer}>
          {requestSent && <Text style={styles.pendingNotice}>Pending</Text>}
  
          {!isFriend && requestReceived && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.confirmButton}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      padding: 10,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
      marginVertical: 5,
      width: "90%",
      justifyContent: "space-between",
    },
    textContainer: {
      flex: 1,
    },
    name: {
      fontSize: 16,
      fontWeight: "bold",
    },
    username: {
      fontSize: 14,
      color: "gray",
    },
    actionContainer: {
      alignItems: "flex-end", // Right-align actions
    },
    pendingNotice: {
      fontSize: 15,
      fontStyle: "italic",
      color: "black",
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 8, // Ensures spacing between buttons
    },
    confirmButton: {
      backgroundColor: "#4CAF50",
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    deleteButton: {
      backgroundColor: "#FF6347",
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
    },
  });
  
  export default FriendComponent;