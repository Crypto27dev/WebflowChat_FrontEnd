import React, { useContext, useEffect, useRef, useState } from "react";
import { Scrollbar } from "react-scrollbars-custom";
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
import moment from "moment";

import { IoSend } from "react-icons/io5";
import { AiFillSafetyCertificate } from "react-icons/ai";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";
import SearchIcon from "@material-ui/icons/Search";
import { Button, IconButton } from "@material-ui/core";
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
  const [online, setOnline] = useState(false);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [amigo, setAmigo] = useState();
  const [amigoDetail, setAmigoDetail] = useState();
  const [open, setOpen] = useState(false);
  const { user, currentMem } = useContext(AuthContext);
  const API_KEY = process.env.REACT_APP_MEMBERSTACK_KEY;
  const BASE_URL = 'https://admin.memberstack.com/members';
  const headers = { "X-API-KEY": API_KEY };
  const roomRef = useRef();
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
    socket.current.on("getUsers", (users) => {
      setOnline(users.find((user) => user.userId === amigoId));
    })
    const getUserInfo = async (mem_id) => {
      try {
        const resp = await axios.get(`${BASE_URL}/${mem_id}`, { headers });
        return resp.data.data;
      } catch (err) {
        console.log(err);
      }
      return null;
    }
    const getAmigodetails = async () => {
      try {
        const response = await axios.get(API_URL + "api/users/" + amigoId);
        const amigoData = response.data;
        setAmigo(amigoData);
        const response2 = await getUserInfo(amigoData.mem_id);
        setAmigoDetail(response2);
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
    if (!newMessage) return;
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
            <MenuIcon style={{ fontSize: 30, color: "#333" }} />
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
          <div className="sidebar-top-header">
            <div className="sidebar-mobile-header">
              <div></div>
              <div className="menu-close" onClick={() => { setOpen(false); }} >
                <IconButton sx={{ width: '50px', height: '50px' }}>
                  <CloseIcon style={{ fontSize: 30, color: "#333" }} />
                </IconButton>
              </div>
            </div>
            <div className="sidebar-header">
              <IconButton className="user-profile" onClick={() => { profiletoggler(); }} >
                <img className="user-profile-image" src={user?.avatar ? user.avatar : API_URL + "api/images/noavatar.png"} alt='' />
              </IconButton>
              <span className="sidebar-mobile-profile-name">{user?.firstname + " " + user?.lastname}</span>
              <div className="logout-option">
                <IconButton onClick={logout}>
                  <ExitToAppIcon />
                </IconButton>
              </div>
            </div>
            <div className="sidebar-search">
              <div className="sidebar-search-container">
                <SearchIcon className="sidebar-searchicon" />
                <input type="text" name="chat-search" placeholder="Søk etter brukernavnet..." onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="logout-mobile-option">
                <IconButton onClick={logout}>
                  <ExitToAppIcon />
                </IconButton>
              </div>
            </div>
          </div>

          {/* Chatroom tiles */}

          <Scrollbar className="sidebar-members" noScrollX={true}>
            <div className="sidebar-chatoptions">
              {chatroomtiles.filter(opt => {
                if (search) {
                  for (let i = 0; i < opt.usernames.length; i++) {
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
                    setCurrentchat(chatroomtile);
                    setOpen(false);
                  }}
                >
                  <SidebarChat chatroomtile={chatroomtile} currentChat={currentchat} currentUser={user} />
                </div>
              ))}
            </div>
          </Scrollbar>
        </div>

        {/* Chatroom */}
        <div className="chatroom">
          {currentchat ? (
            <>
              <div className="chatroom-header">
                <div className="chatroom-chatinfo">
                  <img className='chatroom-profilepic' src={amigo?.avatar ? amigo.avatar : API_URL + "api/images/noavatar.png"} alt='' />
                  <div className="chatroom-chatinfo-right">
                    <div className="chatroom-chatinfo-name">
                      <a href={'https://upit.no/profil/' + amigo?.mem_id} name="chat-info-name" className="chatroom-chatinfo-name">{amigo ? amigo?.firstname + " " + amigo?.lastname : ""}</a>
                    </div>
                    <span className='chatroom-plans'>
                      {amigo?.plans.map((plan, index) => (
                        <span className="chatroom-plan" key={index}>
                          {plan.planName}{index < amigo?.plans.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </span>
                    <div className="chatroom-top-header">
                      <span>Sist sett: 2 timer siden</span>
                      <span> | </span>
                      <span>Lokal tid: Jan 30, 2023, 05:10</span>
                    </div>
                  </div>
                </div>
                <div className="chatroom-search">
                  <div className="chatroom-search-container">
                    <SearchIcon className="chatroom-searchicon" />
                    <input type="text" name="chat-search" placeholder="søk melding..." />
                  </div>
                </div>
              </div>
              <div className="chatroom-container">
                <div className="flex flex-col w-100 h-100">
                  <div className="chatroom-messages-container" ref={roomRef} onClick={() => { setPick(false) }}>
                    <div className="chatroom-safety">
                      <div className="flex flex-row w-100 align-items-center gap-10">
                        <div className="safety-line"></div>
                        <div className="chatroom-safety-header">
                          <AiFillSafetyCertificate />
                          <span>
                            Du er i trygge hender
                          </span>
                        </div>
                        <div className="safety-line"></div>
                      </div>
                      <span className="chatroom-safety-text">
                        For økt sikkerhet, hold betalinger og kommunikasjon innenfor Upit. Lær mer
                      </span>
                    </div>
                    {messages.map((message, index) => (
                      <div key={index}>
                        <Message message={message} amigo={amigo} own={message?.senderId === user._id} />
                      </div>
                    ))}
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
                        placeholder="Skriv melding"
                        maxRows={5}
                        onKeyDown={handleMessageKey}
                        onChange={handleMessage}
                        value={newMessage}
                        required
                      />
                      <button className="input-button" onClick={newMessage ? handleSubmit : null} > Send a Message </button>
                    </form>
                    <div className="chatroom-footer-righticon" onClick={newMessage ? handleSubmit : null} >
                      <Button className="btn-send">
                        <span className="send-text">SEND</span>
                        <IoSend className="ml-5" color="white" size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="chatroom-profile">
                  <div className="flex flex-col gap-5">
                    <img className="profile-photo" src={amigo?.avatar ? amigo.avatar : API_URL + "api/images/noavatar.png"} alt='' />
                    <div className={online ? "profile-online" : "profile-offline"}><span /> <p className="m-0">{online ? "Aktiv" : "Inaktiv"}</p></div>
                  </div>
                  <span className="desc-title">Om &nbsp;
                    <a href={'https://upit.no/profil/' + amigo?.mem_id} className="desc-profile-name text-underline">{amigo ? amigo?.firstname + " " + amigo?.lastname : ""}</a>
                  </span>
                  <div className="profile-description">
                    <div className="desc-text flex-row-between gap-10">
                      <span className="gray-primary">Lokasjon</span>
                      <span className="desc-text-value">{amigoDetail?.customFields?.lokasjon}</span>
                    </div>
                    <div className="desc-text flex-row-between">
                      <span className="gray-primary">Spesialist</span>
                      <span className="desc-text-value">{amigoDetail?.customFields?.jobbkategori}</span>
                    </div>
                    <div className="desc-text flex-row-between">
                      <span className="gray-primary">Telefon</span>
                      <span className="desc-text-value">{amigoDetail?.customFields?.telefonnummer}</span>
                    </div>
                    <div className="desc-text flex-row-between">
                      <span className="gray-primary">Medlem siden</span>
                      <span className="desc-text-value">{moment(amigoDetail?.createdAt).format("MMM YYYY")}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={pick ? "emoji-picker-open" : "emoji-picker-close"} >
                <Picker onSelect={addEmoji} emojiSize={25} />
              </div>
            </>
          ) : (
            <EmptyChatRoom />
          )}
        </div>
      </div>
    </div >
  );
}

export default Home;
