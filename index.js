import React from "react"
import { AppRegistry, Platform } from "react-native"
import App from "./src/App"
import { name as appName } from "./app.json"
import messaging from "@react-native-firebase/messaging"
import { Notifications } from "react-native-notifications"
import { store } from "./src/store"
import { getPopupRef } from "./src/components/PopupNotification"

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  const { data, notification } = remoteMessage
  if (typeof data != "object") return

  console.log("remoteMessage", remoteMessage)

  if (data.twi_message_type == "twilio.channel.new_message") {
    Notifications.postLocalNotification({
      body: data.twi_body,
      title: data.author || "Message",
    })
  } else if (data?.notification_type == "incomming_call" || data?.notification_type == "incomming_calll") {
    getPopupRef()?.showNotification(notification.title, notification.body, data, 10000)
  }
})

if (Platform.OS == "ios") {
  Notifications.events().registerNotificationReceivedBackground(
    (
      notification: Notification,
      completion: (response: NotificationCompletion) => void,
    ) => {
      console.log("Notification Received - Background", notification.payload)

      const { payload } = notification
      if (typeof payload != "object") return

      if (payload.twi_message_type == "twilio.channel.new_message") {
        Notifications.postLocalNotification({
          body: payload.twi_body,
          title: payload.author || "Message",
        })
      }

      // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
      completion({ alert: false, sound: false, badge: false })
    },
  )
}

function HeadlessCheck({ isHeadless }) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null
  }

  return <App />
}

AppRegistry.registerComponent(appName, () => HeadlessCheck)