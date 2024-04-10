import React, { useState, useEffect } from "react";
import { Breadcrumb } from 'app/components'
import { Box, InputLabel, MenuItem, FormControl, Select, Button } from "@material-ui/core";
import TextField from '@material-ui/core/TextField'
import { Row, Container, Col } from "react-bootstrap";
import { Avatar } from "@material-ui/core";
import { storeProfile } from "./StoreDataDid";
import { CircularProgress } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from './SnackbarComponent';
import { confirmAlert } from 'react-confirm-alert';
import history from "history.js"
import { getUserRole } from "./roles/UserRoles";
import { ipfs } from "./filecomponents/DLTcomponents/Web3/ipfs";
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS } from "ServerConfig";
import pinataSDK from '@pinata/sdk';
import Web3 from "web3";
import { API_URL, PINATA_API_KEY, PINATA_SECRET_KEY, COMMON } from "ServerConfig";
const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY);
const Tx = require("ethereumjs-tx").Transaction;
const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));
let wallet;
let profile;
let profileData = {};
let newValues = {};
export default function Profile(props) {
    const [role, setRole] = useState("user");
    const [plan, setPlan] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [status, setStatus] = useState("");
    const [planStatus, setPlanStatus] = useState("");
    const [progress, setProgress] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [token, setToken] = useState(null);
    const [userInfo, setUserInfo] = useState({
        fname: "",
        lname: "",
        localaddress: ""
    })
    
    const handleChange = ({ target: { name, value } }) => {
        // let temp = { ...userInfo }
        // temp[name] = value
        // setUserInfo(temp)
        // profileData[name] = temp;
        // newValues = profileData[name]
    }
    useEffect(() => {
        try {
            const data = JSON.parse(localStorage.getItem("did_data"));
            const companyProfile = data.companyProfile;
            if (companyProfile)
                history.push("/mycompany")
            wallet = data.wallet;
            profile = data.profile;
            profileData = profile;
            // console.log("profileData",profileData)
            if (data.userToken != null) {
                setToken(data.userToken)
            }
            (async () => {
                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "email": localStorage.getItem("userEmail"),
                    }),
                }
                const hash = await getUserRole();
                if (hash == "") {
                } else {
                    ipfs.files.get(hash, function (err, files) {
                        try {
                            const data = JSON.parse(files[0].content.toString("binary"));
                            const permissions = data[0].userRolePermission;
                            setRole(permissions.Role)
                            setStatus(true)
                        } catch (e) {
                            console.log(e)
                        }
                    })
                }
                // const roleRes = await fetch(`${API_URL}/getuserrole`, opts);
                // await roleRes.json()
                //     .then((res) => {
                //         const response = res.result;
                //         if (response.status) {
                //             if (response.data[0].role_id == 1) {
                //                 history.push("/comapnyprofile")
                //             }
                //             if (response.data[0].role_id == 2) {
                //                 setRole(2)
                //             }
                //             else {
                //                 setRole(3)
                //             }
                //         } else {
                //             setRole(3)
                //         }
                //     })
                // const userhash = await getUserRole(wallet.walletaddress);
                // if (userhash == "") {
                //     if (data.companyProfile == null || data.companyProfile == undefined) {
                //         setRestrictUser(true)
                //         setWarning(true)
                //     }
                // }
                const res = await fetch(`${API_URL}/getsubscriptionstatus`, opts);
                await res.json()
                    .then((res) => {
                        const data = JSON.parse(res.result);
                        var date_ob = new Date();
                        var day = ("0" + date_ob.getDate()).slice(-2);
                        var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                        var year = date_ob.getFullYear();
                        var hours = date_ob.getHours();
                        var minutes = date_ob.getMinutes();
                        var seconds = date_ob.getSeconds();
                        setExpiryDate(data[0].sub_end_date)
                        setPlan(data[0].plan)
                        const startDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                        if (Object.keys(data).length < 1) {
                            localStorage.setItem("subscription", "sandbox");
                            // localStorage.setItem("idx_id", "empty")
                        }
                        else if (new Date(startDate).getTime() > new Date(data[0].sub_end_date).getTime()) {
                            localStorage.setItem("subscription", "notsubscribed");
                            // localStorage.setItem("idx_id", "empty");
                        }
                        else {
                            localStorage.setItem("subscription", data[0].plan_type)
                            // localStorage.setItem("idx_id", data[0].user_did);
                        }
                        setPlanStatus(true)
                    })
                    .catch((e) => {
                        console.log(e)
                    })
            })()
        } catch (e) {
            console.log(e)
        }
    },[profileData])
    async function setUserHash(token) {
        try {
            const bufferData = await Buffer.from("" + token);
            await ipfs.add(bufferData, async (err, ipfshash) => {
                if (err) {
                    console.log(err)
                    setError("something went wrong")
                    return;
                }
                else {
                    await pinata.pinByHash(ipfshash[0].hash)
                }
            })
        } catch (e) {
            setError("something went wrong")
        }
    }
    async function updateProfile(){
        let profileData = {};

        const fname=document.getElementById("firstname").value;
        const lname=document.getElementById("lastname").value;
        const localadd=document.getElementById("localaddress").value;
        if(!fname||!lname||!localadd){
            setError("Please fill all fields!")
        }else{
            profileData["fname"]=fname;
            profileData["lname"]=lname;
            profileData["localaddress"]=localadd;
            setProgress(true)
            await storeProfile(profileData)
                .catch((e) => {
                    console.log(e)
                    setProgress(false)
                    setError("Something went wrong")
                })
            setProgress(false)
            setSuccess("Profile updated successfully")
        }
    }
    async function saveProfile() {
        let profileData = {};
        const fname=document.getElementById("firstname").value;
        const lname=document.getElementById("lastname").value;
        const localadd=document.getElementById("localaddress").value;
        console.log("hshsh",fname,lname,localadd)
        if(!fname||!lname||!localadd){
            setError("Please fill all fields!")
        }else{
            // let profileData={};
            profileData["fname"]=fname;
            profileData["lname"]=lname;
            profileData["localaddress"]=localadd;
            profileData["role"]=role;
            profileData["email"]=wallet.useremail;
            profileData["walletaddress"]=wallet.walletaddress;
            profileData["chain"]="Binance testnet";
            profileData["subscription"]=plan;
            profileData["subexp"]=expiryDate;
            // console.log(profileData)
                   setProgress(true)
            await storeProfile(profileData)
                .catch((e) => {
                    console.log(e)
                    setProgress(false)
                    setError("Something went wrong")
                })
            setProgress(false)
            setSuccess("Profile saved successfully")
        }
        // console.log(profileData)
        // if ((!userInfo.fname && !profileData.fname) || (!userInfo.lname && !profileData.lname) || (!userInfo.localaddress && !profileData.localaddress))
        //     setError("please fill all fields")
        // else if (!wallet)
        //     setError("please create wallet")
        // else {
        //     if (newValues.fname)
        //         profileData.fname = newValues.fname
        //     if (newValues.lname)
        //         profileData.lname = newValues.lname
        //     if (newValues.localaddress)
        //         profileData.localaddress = newValues.localaddress
        //     console.log(profileData)
        //     setProgress(true)
        //     await storeProfile(profileData)
        //         .catch((e) => {
        //             setProgress(false)
        //             setError("Something went wrong")
        //         })
        //     setProgress(false)
        //     setSuccess("Profile saved successfully")
        // }
    }
    function handleSnackbarClose() {
        setError(null)
        setSuccess(null)
    }
    const submit = () => {
        confirmAlert({
            title: 'Confirm to update',
            message: 'Are you sure to do update profile',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => updateProfile()
                },
                {
                    label: 'No',
                    onClick: () => ""
                }
            ]
        });
    };

    setTimeout(() => {
        setStatus(true)
    }, 3000)
    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb
                    routeSegments={[
                        { name: 'User Profile' },
                    ]}
                />
            </div>
            <center>
                <h2>
                    <b>
                        Profile Details
                    </b>
                </h2>
            </center>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={success != null}
                autoHideDuration={5000}
                onClose={handleSnackbarClose}
            >
                <MySnackbarContentWrapper
                    onClose={handleSnackbarClose}
                    variant="success"
                    message={success}
                />
            </Snackbar>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={error != null}
                autoHideDuration={5000}
                onClose={handleSnackbarClose}
            >
                <MySnackbarContentWrapper
                    onClose={handleSnackbarClose}
                    variant="error"
                    message={error}
                />
            </Snackbar>

            <Container className="justify-content-center">
                <Row>
                    <Col md={5}>
                        <TextField
                            margin="dense"
                            id="firstname"
                            label="Firstname"
                            type="text"
                            name="fname"
                            fullWidth
                            variant="outlined"
                            // value={userInfo.fname || profile && profile.fname}
                            // onChange={handleChange}
                            key={status && profile && profile.fname}
                            defaultValue={status && profile && profile.fname}
                        />
                    </Col>
                    <Col md={5}>
                        <TextField
                            margin="dense"
                            id="lastname"
                            label="Lastname"
                            type="text"
                            name="lname"
                            fullWidth
                            variant="outlined"
                            // onChange={handleChange}
                            // value={userInfo.lname || profile && profile.lname}
                            defaultValue={status && profile && profile.lname}
                            key={status && profile && profile.lname}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={10}>
                        <TextField
                            margin="dense"
                            id="localaddress"
                            label="Local address organization"
                            type="text"
                            name="localaddress"
                            fullWidth
                            variant="outlined"
                            // value={userInfo.localaddress || profile && profile.localaddress}
                            // onChange={handleChange}
                            defaultValue={status && profile && profile.localaddress}
                            key={status && profile && profile.localaddress}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={5}>
                        <TextField
                            margin="dense"
                            id="role"
                            label="User Role"
                            type="text"
                            value={role}
                            fullWidth
                            variant="outlined"
                            aria-readonly="true"
                        />
                    </Col>
                    <Col md={5}>
                        <TextField
                            margin="dense"
                            id="email"
                            label="Email address"
                            type="text"
                            value={status && wallet && wallet.useremail}
                            fullWidth
                            variant="outlined"
                            aria-readonly="true"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={5}>
                        <TextField
                            margin="dense"
                            id="walletaddress"
                            label="Wallet address"
                            type="text"
                            value={status && wallet && wallet.walletaddress}
                            fullWidth
                            variant="outlined"
                            aria-readonly="true"
                        />
                    </Col>
                    <Col md={5}>
                        <TextField
                            margin="dense"
                            id="chainanme"
                            label="Chain name"
                            type="text"
                            value={"Binance testnet"}
                            fullWidth
                            variant="outlined"
                            aria-readonly="true"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={5}>
                        <TextField
                            margin="dense"
                            id="subplan"
                            label="Subscription plan"
                            type="text"
                            value={planStatus && plan}
                            fullWidth
                            variant="outlined"
                            aria-readonly="true"
                        />
                    </Col>
                    <Col md={5}>
                        <TextField
                            margin="dense"
                            id="subplanexp"
                            label="Subscription plan expiry"
                            type="text"
                            value={planStatus && new Date(expiryDate).toISOString().slice(0, 19).replace('T', ' ')}
                            fullWidth
                            variant="outlined"
                            aria-readonly="true"
                        />
                    </Col>
                </Row>
                {token != null &&
                    <Row>
                        <Col>
                            <TextField
                                margin="dense"
                                id="token"
                                label="Organization Token"
                                type="text"
                                value={token}
                                fullWidth
                                variant="outlined"
                                aria-readonly="true"
                            />
                        </Col>
                    </Row>
                }
                <Row className="pt-4">
                    <Col md={10}>
                        <center>
                            <Button
                                className="capitalize"
                                variant="contained"
                                color="primary"
                                type="submit"
                                onClick={() => profile ? submit() : saveProfile()}
                                disabled={progress || !wallet}
                            >
                                {
                                    profile ?
                                        "Update"
                                        :
                                        "Save"
                                }
                            </Button>
                            {
                                progress &&
                                <div>
                                    <CircularProgress />
                                </div>
                            }
                        </center>
                    </Col>
                </Row>

            </Container>

        </div>
    );
}