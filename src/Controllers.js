import { db } from "./App";
export function getUsers(ownerID) {
  let users = [];
  return db
    .collection("users")
    .where("ID", "!=", ownerID)
    .get()
    .then((docs) => {
      docs.forEach((doc) => {
        users.push(doc.data());
      });
      return users;
    });
}
export function getMessagesOf(conversationID) {
  let messages = [];
  return db
    .collection("messages")
    .orderBy("date")
    .get()
    .then((docs) => {
      docs.forEach((doc) => {
        let data = doc.data();
        if (data.roomID === conversationID) {
          messages.push(data);
        }
      });
      return messages;
    });
}
export function getChatrooms(userID) {
  let chatrooms = [];
  return db
    .collection("chatrooms")
    .orderBy("modifiedDate", "desc")
    .get()
    .then((docs) => {
      docs.forEach((doc) => {
        if (doc.data().user1 === userID || doc.data().user2 === userID) {
          chatrooms.push(doc.data());
        }
      });
      return chatrooms;
    });
}
export function getUser(userID) {
  return db
    .collection("users")
    .doc(userID)
    .get()
    .then((doc) => {
      return doc.data();
    });
}
export function getChatroom(conversationID) {
  return db
    .collection("chatrooms")
    .doc(conversationID)
    .get()
    .then((doc) => {
      return doc.data();
    });
}
export function subscribeConversation(conversationId, callback) {
  return db
    .collection("messages")
    .where("roomID", "==", conversationId)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          callback();
        }
      });
    });
}
export async function getLastMessages(rooms) {
  let lastMessages = [];
  await rooms.map((room) => {
    let count = 0;
    db.collection("messages")
      .orderBy("date", "desc")
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          let mes = doc.data();
          if (mes.roomID === room.ID && count !== 1) {
            lastMessages.push(mes);
            count++;
          }
        });
      });
  });
  return lastMessages;
}


