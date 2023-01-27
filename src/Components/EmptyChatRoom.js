import React from "react";
import "./EmptyChatRoom.css";

function EmptyChatRoom() {
  const API_URL = process.env.REACT_APP_API_URL

  return (
    <div>
      <div className="EmptyChatroom">
        <img className="emptychatroom-img"
          src={API_URL + "api/images/home.png"}
          alt=""
        ></img>
        <p className="empty-chatroom-mainhead">Welcome To Our Upit Chat!</p>
      </div>
    </div>
  );
}

export default EmptyChatRoom;
