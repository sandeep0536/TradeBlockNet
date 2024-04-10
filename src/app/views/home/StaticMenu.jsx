import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form } from 'react-bootstrap';
import {
    Button,
    Icon,
    TextField
} from '@material-ui/core';
import {
    ScrollingProvider,
    useScrollSection,
    Section,
} from 'react-scroll-section';
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from "../material-kit/projecttest/SnackbarComponent";
import { API_URL } from 'ServerConfig';
import history from 'history.js'
import jwt_decode from "jwt-decode";
import { Web3Auth } from "@web3auth/web3auth";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { Link } from 'react-router-dom';
import { checkLoginStatus } from '../material-kit/projecttest/StoreDataDid';

// import RPC from "../../../web3RPC"
import RPC from "../../../web3RPC";

const clientId =
    "BMdE_1k7n4clG6im_-Rt-uzcqh8u887oIjITJOqqRdWVYg9rTCQRmAAsM9vPmzv9Hc-pu86LxD2-9dh8j69JfqY";
const StaticMenu = (props) => {
    const homeSection = useScrollSection('home');
    const pricingSection = useScrollSection('pricingTable');
    const helpSection = useScrollSection('help');
    const [web3auth, setWeb3auth] = useState(null);
    const [provider, setProvider] = useState(null);
    const [email, setEmail] = useState('')
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null);
    const [address, setAddress] = useState("");
    const [balance, setBalance] = useState("");
    const [chainId, setChainId] = useState("");
    const [userData, setUserData] = useState({});
    useEffect(() => {
        const init = async () => {
            try {
                const web3auth = new Web3Auth({
                    clientId,
                    web3AuthNetwork: "cyan",
                    chainConfig: {
                        chainNamespace: "eip155",
                        chainId: "0x38", // hex of 56
                        rpcTarget: "https://rpc.ankr.com/bsc",
                    },
                    uiConfig: {
                        theme: "dark",
                        loginMethodsOrder: ["google"],
                        appLogo: "https://www.tradeblocknet.com/static/media/Tradeblocknet.89a714a3.svg", // Your App Logo Here
                    },
                });

                setWeb3auth(web3auth);
                await web3auth.initModal({
                    modalConfig: {
                        [WALLET_ADAPTERS.OPENLOGIN]: {
                            label: "openlogin",
                            loginMethods: {
                                facebook: {
                                    name: "facebook login",
                                    showOnModal: false,
                                },
                                twitter: {
                                    name: "twitter login",
                                    showOnModal: false,
                                },
                                reddit: {
                                    name: "reddit login",
                                    showOnModal: false,
                                },
                                discord: {
                                    name: "discord login",
                                    showOnModal: false,
                                },
                                twitch: {
                                    name: "twitch login",
                                    showOnModal: false,
                                },
                                apple: {
                                    name: "apple login",
                                    showOnModal: false,
                                },
                                line: {
                                    name: "line login",
                                    showOnModal: false,
                                },
                                github: {
                                    name: "github login",
                                    showOnModal: false,
                                },
                                linkedin: {
                                    name: "linkedin login",
                                    showOnModal: false,
                                },
                                kakao: {
                                    name: "kakao login",
                                    showOnModal: false,
                                },
                                weibo: {
                                    name: "weibo login",
                                    showOnModal: false
                                },
                                wechat: {
                                    name: "wechat login",
                                    showOnModal: false
                                },
                                sms_passwordless: {
                                    name: "sms_passwordless login",
                                    showOnModal: false
                                },
                            },
                            // setting it to false will hide all social login methods from modal.
                            showOnModal: true,
                        },
                    },
                }); setProvider(web3auth.provider);
                await checkLoginStatus(function (response) { }, true);
            } catch (error) {
                console.error(error);
            }
        };

        init();
    }, []);
    const login = async () => {
        try {
          if (!web3auth) {
            console.log("web3auth not initialized yet");
            return;
          }
      
          const web3authProvider = await web3auth.connect();
          setProvider(web3authProvider);
          const user = await web3auth.getUserInfo();
      
          if (user.email) {
            const expiry_time = new Date().getTime() + 1 * 60 * 60 * 1000;
            await getSubscription(expiry_time, "google", user);
          } else {
            const rpc = new RPC(web3authProvider);
            const address = await rpc.getAccounts();
            const expiry_time = new Date().getTime() + 1 * 60 * 60 * 1000;
            const forwalletgenerate = Math.random().toString(36).substring(2, 7);
      
            const opts = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                "Wallet_address": address,
              }),
            };
      
            try {
              const res = await fetch(`${API_URL}/userEmail`, opts);
              const data = await res.json();
              await getSubscriptionWalletAddress(data, forwalletgenerate, "wallet", expiry_time);
            } catch (error) {
              localStorage.clear();
              const web3authProvider = await web3auth.logout();
              setError("Something went wrong");
            }
          }
      
          // localStorage.setItem("userEmail", user.email);
          // localStorage.setItem("userName", user.name);
          // localStorage.setItem("userImg", user.profileImage);
          // localStorage.setItem("accessToken", user.idToken);
          // setSuccess("Log-in success");
          // history.push("/dashboard");
        } catch (error) {
          console.log("error", error);
        }
      };
      

    async function getSubscription(expiration, provider, response) {
        let date;
        let opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": response.email,
                "accessToken": response.idToken,
                "expiration": expiration
            }),
        }
        try {
            const res = await fetch(`${API_URL}/getsubscriptionstatus`, opts);
            await res.json()
                .then(async (res) => {
                    if (res.status) {
                        const data = JSON.parse(res.result);
                        var date_ob = new Date();
                        var day = ("0" + date_ob.getDate()).slice(-2);
                        var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                        var year = date_ob.getFullYear();
                        var hours = date_ob.getHours();
                        var minutes = date_ob.getMinutes();
                        var seconds = date_ob.getSeconds();
                        const startDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                        if (Object.keys(data).length < 1) {
                            localStorage.setItem("subscription", "sandbox");
                        }
                        else if (new Date(startDate).getTime() > new Date(data[0].sub_end_date).getTime()) {
                            localStorage.setItem("subscription", "notsubscribed");
                        }
                        else {
                            localStorage.setItem("subscription", data[0].plan_type)
                        }

                        if (provider === "google") {
                            opts.body = JSON.stringify({
                                "email": response.email,
                                "accessToken": response.idToken,
                                "expiration": expiration
                            })
                            const logsResponse = await fetch(`${API_URL}/userLogs`, opts)
                            await logsResponse.json().then((res) => {
                                if (res.status) {
                                    localStorage.setItem("userEmail", response.email)
                                    localStorage.setItem("userName", response.name)
                                    localStorage.setItem("userImg", response.profileImage)
                                    localStorage.setItem("accessToken", response.idToken)
                                    setSuccess("Log-in successf")
                                    history.push("/dashboard")
                                } else {
                                    setError("Something went wrong")
                                }
                            })
                        }
                    } else {
                        setError("Something went wrong")
                        localStorage.setItem("subscription", "notsubscribed");
                    }
                })
                .catch((e) => {
                    setError("Something went wrong")
                    console.log(e)
                })

        }
        catch (e) {
            console.log(e);
            setError("Something went wrong")
        }
    }

    async function getSubscriptionWalletAddress(response, accessToken, provider, expiry_time) {
        let date;
        let opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": response.result[0].email,
                "accessToken": accessToken,
                "expiration": expiry_time
            }),
        }
        try {
            const res = await fetch(`${API_URL}/getsubscriptionstatus`, opts);
            await res.json()
                .then(async (res) => {
                    if (res.status) {
                        const data = JSON.parse(res.result);
                        var date_ob = new Date();
                        var day = ("0" + date_ob.getDate()).slice(-2);
                        var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                        var year = date_ob.getFullYear();
                        var hours = date_ob.getHours();
                        var minutes = date_ob.getMinutes();
                        var seconds = date_ob.getSeconds();
                        const startDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                        if (Object.keys(data).length < 1) {
                            localStorage.setItem("subscription", "sandbox");
                        }
                        else if (new Date(startDate).getTime() > new Date(data[0].sub_end_date).getTime()) {
                            localStorage.setItem("subscription", "notsubscribed");
                        }
                        else {
                            localStorage.setItem("subscription", data[0].plan_type)
                        }

                        if (provider === "wallet") {
                            opts.body = JSON.stringify({
                                "email": response.result[0].email,
                                "accessToken": accessToken,
                                "expiration": expiry_time
                            })
                            const logsResponse = await fetch(`${API_URL}/userLogs`, opts)
                            await logsResponse.json().then((res) => {
                                if (res.status) {
                                    localStorage.setItem("userEmail", response.result[0].email)
                                    localStorage.setItem("userName", response.result[0].email)
                                    // localStorage.setItem("userImg", response.profileImage)
                                    localStorage.setItem("accessToken", accessToken)
                                    setSuccess("Log-in successf")
                                    history.push("/dashboard")
                                } else {
                                    setError("Something went wrong")
                                }
                            })
                        }
                    } else {
                        setError("Something went wrong")
                        localStorage.setItem("subscription", "notsubscribed");
                    }
                })
                .catch((e) => {
                    setError("Something went wrong")
                    console.log(e)
                })

        }
        catch (e) {
            console.log(e);
            setError("Something went wrong")
        }
    }
    function handleErrorClose(event, reason) {
        setError(null)
    }


    const logout = async () => {
        if (!web3auth) {
            console.log("web3auth not initialized yet");
            return;
        }
        const web3authProvider = await web3auth.logout();
        setProvider(web3authProvider);
        setBalance("");
        setAddress("");
        setUserData({});
        setChainId("");
    };
    // const loggedInView = (
    //     <>
    //         <button onClick={logout} className="card">
    //             Logout
    //         </button>

    //         <div id="console" style={{ whiteSpace: "pre-line" }}>
    //             <p style={{ whiteSpace: "pre-line" }}></p>
    //         </div>
    //     </>
    // );

    const unloggedInView = (
        <button onClick={login} className="card" >
            Login
        </button>
    );

    return (
        <nav className="navbar navbar-expand-lg navbar-light fixed-top py-4 d-block" data-navbar-on-scroll="data-navbar-on-scroll">
            <div className="container">
                <img src={require('./Tradeblocknet.svg')} style={{ width: "62px", height: "62px" }}></img>
                <a className="navbar-brand" href="#"><span style={{ color: "white", marginLeft: "17px" }}>Tradeblocknet.com</span></a>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon"> </span></button>
                <div className="collapse navbar-collapse border-top border-lg-0 mt-4 mt-lg-0" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto pt-2 pt-lg-0 font-base">
                        <li className="nav-item px-2" data-anchor="data-anchor" style={{ cursor: "pointer" }} onClick={homeSection.onClick} selected={homeSection.selected}>
                            <a className="nav-link fw-medium active" aria-current="page" style={{ fontWeight: "600", fontSize: "22px" }}>Home</a></li>
                        <li className="nav-item px-2" data-anchor="data-anchor" style={{ cursor: "pointer" }} onClick={helpSection.onClick} selected={helpSection.selected}>
                            <a className="nav-link" style={{ fontWeight: "600", fontSize: "22px" }}>Help</a></li>
                    </ul>
                    {localStorage.getItem("accessToken") != null
                        ?
                        <Link
                            to="/dashboard"
                        >
                            <form className="ps-lg-5">
                                <span style={{ color: "white", fontSize: "20px", cursor: "pointer" }}>
                                    {localStorage.getItem("userEmail")}
                                </span>
                            </form>
                        </Link>
                        :
                        // <Link
                        //     to={{
                        //         pathname: "/signin",
                        //         state: { token: props.token }
                        //     }}
                        // >

                        <button onClick={login} className="ps-lg-5"><div className="btn btn-light order-1 order-lg-0">login
                            <svg className="bi bi-person-fill" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
                            </svg></div></button>
                        // </Link>

                        //     <Link
                        //     to="/dashboard"
                        // >
                        //     <form className="ps-lg-5">
                        //         <span style={{ color: "white", fontSize: "20px", cursor: "pointer" }}>
                        //             {localStorage.getItem("userEmail")}
                        //         </span>
                        //     </form>
                        // </Link>
                        // :
                        // <Link
                        //     to={{
                        //         pathname: "/signin",
                        //         state: { token: props.token }
                        //     }}
                        // >
                        //     <form className="ps-lg-5"><div className="btn btn-light order-1 order-lg-0">login
                        //         <svg className="bi bi-person-fill" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        //             <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
                        //         </svg></div></form>
                        // </Link>
                    }
                </div>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={error != null}
                    autoHideDuration={10000}
                    onClose={handleErrorClose}
                >
                    <MySnackbarContentWrapper
                        onClose={handleErrorClose}
                        variant="error"
                        message={error}
                    />
                </Snackbar>
            </div>
        </nav>
    );
};
export default StaticMenu;