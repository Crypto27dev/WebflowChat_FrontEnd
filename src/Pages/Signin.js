import React, { useState, useEffect, useContext } from 'react'
import './Signin-up.css'
import { useMemberstack, useMemberstackModal } from "@memberstack/react";
import axios from 'axios'
import { AuthContext } from '../Context/AuthContext'

function Signin() {
    const { getCurrentMember } = useMemberstack();
    const { openModal, hideModal } = useMemberstackModal();
    const [member, setMember] = useState(null);
    const { dispatch } = useContext(AuthContext)
    const API_URL = process.env.REACT_APP_API_URL

    useEffect(() => {
        getCurrentMember().then(({ data: member }) => setMember(member));
    }, []);

    const signUpModal = () => {
        openModal({
            type: "SIGNUP",
            planId: "pln_test-memberstack-c7iw0rew"
        }).then(({ data, type }) => {
            console.log("data", data);
            console.log("type: ", type);
            if (type === "SIGNUP") {
                registerCall(data);
                const member = data.member.auth;
                loginCall({ email: member.email }, dispatch)
                hideModal();
            } else if (type === "LOGIN") {
                const member = data.member.auth;
                loginCall({ email: member.email }, dispatch)
                hideModal();
            }
        });
    }

    const logInModal = () => {
        openModal({
            type: "LOGIN"
        }).then(({ data, type }) => {
            console.log("data", data);
            console.log("type: ", type);
            if (type === "LOGIN") {
                const member = data.member.auth;
                loginCall({ email: member.email }, dispatch)
                hideModal();
            }
        });
    }

    const registerCall = async (data) => {
        try {
            const form = {
                email: data.member.auth.email
            }
            await axios.post(API_URL + "api/auth/signup", form);
        } catch (err) {
            console.log(err);
        }
    }

    const loginCall = async (userCredential, dispatch) => {
        dispatch({ type: "LOGIN_START" });
        try {
            const res = await axios.post(API_URL + "api/auth/signin", userCredential);
            dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
        }
        catch (err) {
            dispatch({ type: "LOGIN_FAILURE", payload: err })
        }
    }


    return (
        <div className='signin-container'>
            <div className='signin-content'>
                <h1>Welcome</h1>
                <div className='btn-group'>
                    <button className='btn btn-login' onClick={logInModal}>
                        Log In
                    </button>
                    <button className='btn btn-signup' onClick={signUpModal}>
                        Sign Up
                    </button>
                </div>
            </div>
            <footer>
                <span>@Copyright2023</span>
                <span>Vladimir</span>
            </footer>            
        </div>
    )
}

export default Signin