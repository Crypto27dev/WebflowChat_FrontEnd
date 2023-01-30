import React, { useContext, useEffect, useRef, useState } from "react";
import "./HomeCSS/Home.css";
import "./HomeCSS/Sidebar.css";
import "./HomeCSS/ChatRoom.css";
import Message from "../Components/Message.js";
import AddAmigo from "../Components/AddAmigo.js";
import ProfilePage from "../Components/ProfilePage";
import SidebarChat from "../Components/SidebarChat.js";
import EmptyChatRoom from "../Components/EmptyChatRoom";
import { AuthContext } from "../Context/AuthContext";

import axios from "axios";
import { io } from "socket.io-client";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";

import SendIcon from "@material-ui/icons/Send";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";
import SearchIcon from "@material-ui/icons/Search";
import { IconButton } from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";

function Home() {
  const [chatroomtiles, setChatroomtiles] = useState([]);
  const [currentchat, setCurrentchat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [amigo, setAmigo] = useState();
  const [open, setOpen] = useState(false);
  const { user, currentMem } = useContext(AuthContext);
  const roomRef = useRef();
  const formRef = useRef();
  const socket = useRef();

  const API_URL = process.env.REACT_APP_API_URL

  useEffect(() => {
    socket.current = io(API_URL);
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, [API_URL]);

  useEffect(() => {
    arrivalMessage &&
      currentchat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentchat]);

  useEffect(() => {
    socket.current.emit("addUser", user?._id);
  }, [user, chatroomtiles, currentchat, socket]);

  /* Fetching the Chat Tiles */

  useEffect(() => {
    const getChatroomtiles = async (searchText) => {
      try {
        let data = null;
        if (currentMem) {
          const response = await axios.get(`${API_URL}api/users/?member=${currentMem}`)
          data = {
            senderId: user._id,
            receiverId: response.data._id
          }
          await axios.post(API_URL + 'api/chatrooms', data)
        }

        const res = await axios.get(API_URL + "api/chatrooms", {
          params: {
            user_id: user._id
          }
        });
        setChatroomtiles(res.data);

        if (data) {
          const resp = await axios.post(API_URL + 'api/chatrooms/get', data);
          setCurrentchat(resp.data[0]);
        }
      } catch (err) {
        console.log(err);
      }
    };
    (async () => {
      await getChatroomtiles();
    })();
  }, [user?._id, currentMem, API_URL]);

  /* Fetching the Chat Tile user details */

  useEffect(() => {
    const amigoId = currentchat?.members.find((m) => m !== user._id);
    const getAmigodetails = async () => {
      try {
        const response = await axios.get(API_URL + "api/users/" + amigoId);
        setAmigo(response.data);
      } catch (err) { }
    };
    if (currentchat) {
      getAmigodetails();
    }
  }, [user, currentchat, API_URL]);

  /* Fetching ChatRoom Messages */

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await axios.get(API_URL + "api/messages/" + currentchat?._id);
        setMessages(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    if (currentchat) {
      getMessages();
    }
  }, [currentchat, API_URL]);

  /* Scroll to the recent message */

  useEffect(() => {
    scrollItThere();
  }, [messages]);

  const scrollItThere = () => {
    roomRef.current?.scroll({
      top: roomRef.current?.scrollHeight,
      behavior: 'smooth'
    });
  }

  /* Emoji Picker */

  const addEmoji = (e) => {
    let emoji = e.native;
    setNewMessage(newMessage + emoji);
  };
  const [pick, setPick] = useState(false);
  const openPicker = () => {
    setPick(!pick);
  };

  /* Posting a Message */

  const handleMessageKey = (e) => {
    if (e.keyCode == 13 && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
      return false;
    }
  }

  const handleMessage = (e) => {
    setNewMessage(e.target.value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sendingMessage = {
      chatroomId: currentchat._id,
      senderId: user._id,
      text: newMessage,
    };

    const receiverId = currentchat.members.find(
      (member) => member !== user._id
    );

    socket.current.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: newMessage,
    });

    try {
      const response = await axios.post(API_URL + "api/messages/", sendingMessage);
      setMessages([...messages, response.data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
    setPick(false)
  };

  /* Logout */

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  /* AddChat Toggle Setup */

  const [addtoggle, setAddtoggle] = useState(false);
  const addchatToggler = () => {
    addtoggle === false ? setAddtoggle(true) : setAddtoggle(false);
    console.log(addtoggle);
  };

  /* Profile Page Toggle Setup */

  const [profiletoggle, setProfiletoggle] = useState(false);
  const profiletoggler = () => {
    profiletoggle === false ? setProfiletoggle(true) : setProfiletoggle(false);
  };

  return (
    <div className="home">
      {/* Chat Adding Card */}
      <AddAmigo addchattoggler={() => { addchatToggler(); }} addchattoggle={addtoggle} />

      {/* Profile Page Card - Update */}
      <ProfilePage toggler={() => { profiletoggler(); }} togglestate={profiletoggle} />

      {/* Sidebar Open Menu */}
      {open
        ? ""
        : <div className="menu-open" onClick={() => { setOpen(true); }} >
          <IconButton>
            <MenuIcon style={{ fontSize: 35, color: "#0e1012" }} />
          </IconButton>
        </div>
      }

      {/* Add Chat Icon */}
      {/* <div className="add-chatroom-icon" onClick={addchatToggler}>
        <IconButton>
          <PersonAddIcon />
        </IconButton>
      </div> */}

      {/* Sidebar, ChatRoom */}
      <div className="home-components">

        {/* Sidebar */}
        <div className={open ? "sidebar active" : "sidebar"}>
          <div className="sidebar-header">
            <div className="menu-close" onClick={() => { setOpen(false); }} >
              <IconButton sx={{ width: '50px', height: '50px' }}>
                <CloseIcon style={{ fontSize: 35, color: "white" }} />
              </IconButton>
            </div>
            <IconButton className="user-profile" onClick={() => { profiletoggler(); }} >
              <img className="user-profile-image" src={user?.avatar ? user.avatar : API_URL + "api/images/noavatar.png"} alt='' />
            </IconButton>
            <div className="logout-option">
              <IconButton onClick={logout}>
                <ExitToAppIcon />
              </IconButton>
            </div>
          </div>
          <div className="sidebar-search">
            <div className="sidebar-search-container">
              <SearchIcon className="sidebar-searchicon" />
              <input type="text" name="chat-search" placeholder="Søk i en chat" onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Chatroom tiles */}

          <div className="sidebar-chatoptions">
            {chatroomtiles.filter(opt => {
              if (search) {
                for (let i = 0; i < opt.usernames.length; i ++) {
                  const item = opt.usernames[i];
                  const fullname = user.firstname + " " + user.lastname;
                  if (item !== fullname && item.toLowerCase().includes(search.toLowerCase())) {
                    return true;
                  }
                }
                return false;
              } else {
                return true;
              }
            }).map((chatroomtile, index) => (
              <div
                key={index}
                onClick={(e) => {
                  if (e.target.name === 'chat-info-name') {
                    return;
                  }
                  setCurrentchat(chatroomtile);
                  setOpen(false);
                }}
              >
                <SidebarChat chatroomtile={chatroomtile} currentChat={currentchat} currentUser={user} />
              </div>
            ))}
          </div>
        </div>

        {/* Chatroom */}
        <div className="chatroom">
          {currentchat ? (
            <>
              <div className="chatroom-header">
                <div className="chatroom-chatinfo">
                  <img className='amigo-profilepic' src={amigo?.avatar ? amigo.avatar : API_URL + "api/images/noavatar.png"} alt='' />
                  <div className="chatroom-chatinfo-right">
                    <div className="chatroom-chatinfo-name">
                      <p>{amigo ? amigo.firstname + " " + amigo.lastname : ""}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="chatroom-messages-container" ref={roomRef} onClick={() => { setPick(false) }}>
                {messages.map((message, index) => (
                  <div key={index}>
                    <Message message={message} amigo={amigo} own={message?.senderId === user._id} />
                  </div>
                ))}
              </div>
              <div className={pick ? "emoji-picker-open" : "emoji-picker-close"} >
                <Picker onSelect={addEmoji} emojiSize={25} />
              </div>
              <div className="chatroom-footer">
                <div className="chatroom-footer-lefticons">
                  <IconButton onClick={openPicker}>
                    <InsertEmoticonIcon />
                  </IconButton>
                  <IconButton>
                    <AttachFileIcon />
                  </IconButton>
                </div>
                <form>
                  <TextareaAutosize
                    className="message-input"
                    name="message-input"
                    placeholder="Type a message"
                    maxRows={5}
                    onKeyDown={handleMessageKey}
                    onChange={handleMessage}
                    value={newMessage}
                    required
                  />
                  <button className="input-button" onClick={newMessage ? handleSubmit : null} > Send a Message </button>
                </form>
                <div className="chatroom-footer-righticon" onClick={newMessage ? handleSubmit : null} >
                  <IconButton>
                    <SendIcon className="send-icon" />
                  </IconButton>
                </div>
              </div>
            </>
          ) : (
            <EmptyChatRoom />
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
