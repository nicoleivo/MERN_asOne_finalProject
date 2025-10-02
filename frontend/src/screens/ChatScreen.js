import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container } from "react-bootstrap";
import { io } from "socket.io-client";

import ChatBody from "../components/chatComponents/ChatBody";
import RecentChatList from "../components/chatComponents/RecentChatList";

import { getRecentChats, fetchCurrentMessages } from "../actions/chatActions";

// import { addUnseenMsg } from '../actions/notificationActions';

const SERVER = process.env.REACT_APP_SOCKET_URL;
const socket = io(SERVER, {
  transports: ["websocket", "polling"],
});

const ChatScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const selectedChat = useSelector((state) => state.selectedChat);
  const { currentUser, currentChat } = selectedChat;

  const { recent_chat } = useSelector((state) => state.recentChat);

  useEffect(() => {
    if (!userInfo) {
      return navigate("/login");
    }

    socket.emit("setup", userInfo);
    socket.on("connected", () => {
      console.log(`My Socket Id is: ${socket.id}`);
    });

    // Add socket event listeners
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
      socket.off("connected");
      socket.off("message received", handleMessageReceived);
      socket.off("confirmation required", handleConfirmationRequired);
      socket.disconnect();
    };
  }, []);

  // Add handler functions
  const handleMessageReceived = (receivedMessage) => {
    // Your message handling logic
  };

  const handleConfirmationRequired = (renterInfo) => {
    // Your confirmation handling logic
  };

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
          <RecentChatList socket={socket} />
        </Col>
        <Col sm={8} className="chat-body-container">
          <ChatBody socket={socket} />
        </Col>
      </Row>
    </Container>
  );
};

export default ChatScreen;
