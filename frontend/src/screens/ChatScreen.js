import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container } from "react-bootstrap";
import { io } from "socket.io-client";

import ChatBody from "../components/chatComponents/ChatBody";
import RecentChatList from "../components/chatComponents/RecentChatList";

import { getRecentChats, fetchCurrentMessages } from "../actions/chatActions";

// import { addUnseenMsg } from '../actions/notificationActions';

const SERVER = process.env.REACT_APP_SOCKET_URL;

//const socket = io(SERVER, {
//  transports: ["websocket", "polling"],
//});

const ChatScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Use useRef to persist socket instance across re-renders
  const socketRef = useRef(null);

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const selectedChat = useSelector((state) => state.selectedChat);
  const { currentUser, currentChat } = selectedChat;

  const { recent_chat } = useSelector((state) => state.recentChat);

  useEffect(() => {
    if (!userInfo) {
      return navigate("/login");
    }

    // Initialize socket if it doesn't exist
    if (!socketRef.current) {
      socketRef.current = io(SERVER, {
        transports: ["websocket", "polling"],
      });
    }

    const socket = socketRef.current;

    socket.emit("setup", userInfo);

    socket.on("connected", () => {
      console.log(`My Socket Id is: ${socket.id}`);
    });

    // Message received handler - updates chat when new message comes
    const handleMessageReceived = (receivedMessage) => {
      // This triggers the message list to update
      if (currentChat && receivedMessage.chat._id === currentChat._id) {
        dispatch(fetchCurrentMessages(currentChat._id, socket));
      }
      // Also refresh recent chats to show latest message
      dispatch(getRecentChats());
    };

    // Confirmation required handler - for rental confirmations
    const handleConfirmationRequired = (renterInfo) => {
      // This would update the UI to show confirmation buttons
      // You might dispatch an action to update state here
      console.log("Confirmation required from:", renterInfo);
      dispatch(getRecentChats()); // Refresh chat list
    };

    // Event listeners
    socket.on("message received", handleMessageReceived);
    socket.on("confirmation required", handleConfirmationRequired);

    if (!recent_chat) {
      dispatch(getRecentChats());
    }

    if (currentChat) {
      dispatch(fetchCurrentMessages(currentChat._id, socket));
    } else if (recent_chat.length > 0) {
      dispatch(fetchCurrentMessages(recent_chat[0]._id, socket));
    }

    // CLEANUP FUNCTION - CRITICAL
    return () => {
      if (socket) {
        socket.off("connected");
        socket.off("message received", handleMessageReceived);
        socket.off("confirmation required", handleConfirmationRequired);
        // Note: We DON'T disconnect here because we want to keep the socket alive
        // across component re-renders, but we remove the specific event listeners
      }
    };
  }, [userInfo, navigate, dispatch, recent_chat, currentChat]);

  // Cleanup when component completely unmounts (user leaves chat)
  useEffect(() => {
    return () => {
      // Only disconnect when user completely leaves the chat screen
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <Container className="chat-container" fluid="md">
      <Row className="chat-mainRow1 border">
        <Col sm={4} className="chat-inbox-container">
          <h4>Inbox</h4>
        </Col>
        <Col sm={8} className="chat-name-container">
          <h4>{currentUser && currentUser.name}</h4>
        </Col>
      </Row>
      <Row className="chat-mainRow2 border">
        <Col sm={4} className="myChats-container">
          <RecentChatList socket={socketRef.current} />
        </Col>
        <Col sm={8} className="chat-body-container">
          <ChatBody socket={socketRef.current} />
        </Col>
      </Row>
    </Container>
  );
};

export default ChatScreen;
