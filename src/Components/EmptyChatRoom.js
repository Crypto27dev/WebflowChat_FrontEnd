import React from "react";
import "./EmptyChatRoom.css";

function EmptyChatRoom() {
  const API_URL = process.env.REACT_APP_API_URL

  return (
    <div className="EmptyChatroom">
      <img className="emptychatroom-img"
        src={"https://uploads-ssl.webflow.com/63356d61d9f41523dbc16a69/63b64b79b19e1177397bb5cd_637f19ace090ec6e19449f00_road1-svg.svg"}
        alt=""
      ></img>
      <p className="empty-chatroom-mainhead">Dine meldinger</p>
    </div>
  );
}

export default EmptyChatRoom;
