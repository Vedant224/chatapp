import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  //get user for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message );
    }
  };

  //get meesage for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message || "Failed to get message");
    }
  };

  //send messages to user
  const sendMessage = async(messageData)=>{
    try {
        const {data}= await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
        if (data.success && data.newMessage) {
        setMessages((prevMessages)=>[...prevMessages,data.newMessage]);
      }
      else {
        toast.error(data.messages || "Failed to send message");
      }
    } catch (error) {
        toast.error(error.message || "Failed to send message")
    }
  }

  //subscribe to messages for user
  const subscribedToMessages = async()=>{
    if(!socket) return;

    socket.on("newMessage",(newMessage)=>{
        if(selectedUser && newMessage.senderId === selectedUser._id){
            newMessage.seen =true;
            setMessages((prevMessages)=>[...prevMessages,newMessage]);
            axios.put(`/api/messages/mark/${newMessage._id}`);
        }
        else{
            setUnseenMessages((prevUnseenMessages)=>({
                ...prevUnseenMessages,[newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId]+1 : 1
            }))
        }
    })
  }

  //unsubscribe from messages
  const unsubscribeFromMessages = ()=>{
    if(socket) socket.off("newMessage");
  }
  useEffect(()=>{
    subscribedToMessages();
    return ()=> unsubscribeFromMessages();
  },[socket,selectedUser])

  const value = {
    messages,users,selectedUser,getUsers,getMessages,sendMessage,setSelectedUser,unseenMessages,setUnseenMessages
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
