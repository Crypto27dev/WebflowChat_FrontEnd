import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import { useMemberstack, useMemberstackModal } from "@memberstack/react";
import "./Signin-up.css";
import { CircularProgress } from "@material-ui/core";

function Signup() {
  const { getCurrentMember } = useMemberstack();
  const { openModal, hideModal } = useMemberstackModal();
  const [member, setMember] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL

  useEffect(() => {
    getCurrentMember().then(({ data: member }) => setMember(member));
  }, []);

  useEffect(() => {
    openModal("LOGIN", {
      signup: {
        planId: "pln_test-memberstack-c7iw0rew"
      }
    })
    // openModal({
    //     type: "LOGIN",
    //     planId: "pln_test-memberstack-c7iw0rew"
    // }).then(({ data, type }) => {
    //     console.log("data", data);
    //     console.log("type: ", type);
    //     hideModal();
    // });
}, []);

  return (
    <div className="signup-container">
    </div>
  );
}

export default Signup;
