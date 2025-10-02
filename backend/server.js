import path from "path";
import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import colors from "colors";
import morgan from "morgan";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import mostSearchRoutes from "./routes/mostSearchRoutes.js";
dotenv.config();

connectDB();

const app = express();

const PORT = process.env.PORT || 5001;

const server = http.Server(app);

const STATIC_CHANNELS = ["global_notifications", "global_chat"];

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// needed to make json data in request body accessible (used in userController to access email and password)
app.use(express.json());

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://asone.netlify.app", "https://www.asone.netlify.app"]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

// ADD ROUTES
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use("/api/faqs", faqRoutes);
app.use("/api/search", mostSearchRoutes);

// makes image upload folder static
// __dirname >> point to current directory
// __dirname is not directly available with ES MODULES (import syntax), only available with common js require syntax >> add path.resolve()
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

//if (process.env.NODE_ENV === "development") {
//  app.use(express.static(path.join(__dirname, "../frontend/public")));
//}

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running....");
  });
}

// Simple route for root
app.get("/", (req, res) => {
  res.send("API is running...");
});

// CUSTOM ERROR HANDLING
app.use(notFound);
app.use(errorHandler);

server.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//const io = new Server(server, {
//  pingTimeout: 6000,
//  cors: {
//    origin:
//      process.env.FRONTEND_URL ||
//      "http://localhost:3000" ||
//      "asone.netlify.app",
//    methods: ["GET", "POST"],
//  },
//});

const io = new Server(server, {
  pingTimeout: 6000,
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://asone.netlify.app", "https://www.asone.netlify.app"]
        : ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//const io = new Server(server, {
//  pingTimeout: 6000,
//  cors: {
//    origin: true, // Allow all origins
//    methods: ["GET", "POST"],
//  },
//});

io.on("connection", (socket) => {
  console.log(`${socket.id} is connected`);

  socket.on("setup", (userData) => {
    socket.userData = userData; // Store userData in the socket object
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    console.log(`User Joined to room : ${room}`);
    socket.join(room);
  });

  socket.on("new message", (receivedMessage) => {
    console.log("new message");
    console.log(receivedMessage);
    socket
      .to(receivedMessage.chat._id)
      .to(receivedMessage.chat.users[0]._id)
      .to(receivedMessage.chat.users[1]._id)
      .emit("message received", receivedMessage);
  });

  socket.on("marked as rented", (chat, renterInfo) => {
    socket.to(chat._id).emit("confirmation required", renterInfo);
  });

  socket.on("confirmation approved", (owner) => {
    socket.to(owner).emit("rented");
  });

  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  // socket.on('typing', (data) => {
  //   socket.to(data.room).emit('typingResponse', data);
  // });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
    if (socket.userData) {
      socket.leave(socket.userData._id);
    }
  });
  // after check jwt
  //
  // socket.on('disconnect', (reason) => {
  //   console_log('disconnect due to ' + reason);
  //   if (reason === 'io server disconnect') {
  //     // disconnect initiated by server. Manually reconnect
  //     socket.connect();
  //   }
  // });
});
