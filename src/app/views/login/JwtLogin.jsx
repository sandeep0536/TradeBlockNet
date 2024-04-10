import React, { useState } from 'react';
import {
    Button,
    Card,
    Grid
} from '@material-ui/core'
import { GoogleLogin } from 'react-google-login';
import { makeStyles } from '@material-ui/core/styles'
import history from 'history.js'
import clsx from 'clsx'
import { useEffect } from 'react'
import { CLIENT_ID, WEB3AUTH_CLIENTID, REDIRECT_URL, FB_ID } from 'ServerConfig';
import { API_URL } from 'ServerConfig';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import FacebookLogin from 'react-facebook-login';
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from "../material-kit/projecttest/SnackbarComponent";
import WaitSnackbar from "../material-kit/projecttest/filecomponents/WaitSnackbar";
import { checkLoginStatus } from '../material-kit/projecttest/StoreDataDid';
import { gapi } from "gapi-script";

const useStyles = makeStyles(({ palette, ...theme }) => ({
    cardHolder: {
        background: '#1A2038',
    },
    card: {
        maxWidth: 800,
        borderRadius: 12,
        margin: '1rem',
    },
    fbButton: {
        color: "#fff",
        width: "190px",
        marginTop: "10px",
        backgroundColor: "#4c69ba",
        height: "44px",
        fontSize: "16px",
        border: "none"
    }
}))

const JwtLogin = (props) => {
    const [email, setEmail] = useState('')
    const [token, setToken] = useState(null)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    //all google api/console credential
    useEffect(() => {
        (async () => {
            try {
                gapi.load('client:auth2', initClient);
                gapi.signin2.render('my-signin2', {
                    'scope': 'profile email',
                    'width': 190,
                    'height': 40,
                    'longtitle': true,
                    'theme': 'dark',
                    'onsuccess': onSuccess,
                    'onfailure': onFailure
                });
                // setToken(props.location.state.token);
                await checkLoginStatus(function (response) { }, true);
            } catch (e) { }
        })();
        //check if user already loggedin
        // if (localStorage.getItem("userName") != null) {
        //     history.push("/dashboard/myfiles")
        // }
    }, []);

    const handleChange = (event) => {
        setEmail(event.target.value)
    }
    const handleFormSubmit = async (event) => {
        try {
        } catch (e) {
        }
    }

    async function getSubscription(email, provider, response) {
        let date;
        if (provider == "fb") {
            date = new Date((response.data_access_expiration_time * 1000));
            date = Date.parse(date);
        }
        let opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": email,
                "accessToken": response.accessToken,
                "expiration": provider == "google" ? response.expires_at : date
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
                                "email": email,
                                "accessToken": response.accessToken,
                                "expiration": response.expires_at
                            })
                            const logsResponse = await fetch(`${API_URL}/userLogs`, opts)
                            await logsResponse.json().then((res) => {
                                if (res.status) {
                                    localStorage.setItem("userEmail", response.email)
                                    localStorage.setItem("userName", response.name)
                                    localStorage.setItem("userImg", response.imageUrl)
                                    localStorage.setItem("accessToken", response.accessToken)
                                    setSuccess("Log-in successf")
                                    history.push("/dashboard")
                                } else {
                                    setError("Something went wrong")
                                }
                            })
                        } else {
                            opts.body = JSON.stringify({
                                "email": response.email,
                                "accessToken": response.accessToken,
                                "expiration": date
                            })
                            const logsResponse = await fetch(`${API_URL}/userLogs`, opts)
                            await logsResponse.json().then((res) => {
                                if (res.status) {
                                    localStorage.setItem("userEmail", response.email)
                                    localStorage.setItem("userName", response.name)
                                    localStorage.setItem("userImg", response.picture.data.url)
                                    localStorage.setItem("accessToken", response.accessToken)
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
    /* 
       onSuccess will call when gapi return 
       success response and redirect to dashboard
    */
    const onSuccess = async (response) => {
        try {
            const data = response.getBasicProfile();
            const responseObj = {
                email: data.getEmail(),
                name: data.getName(),
                imageUrl: data.getImageUrl(),
                accessToken: response.xc.access_token,
                expires_at: response.xc.expires_at
            }
            if (data.getEmail())
                await getSubscription(responseObj.email, "google", responseObj)
        } catch (e) {
            console.log(e)
        }
    }

    async function fbResponse(response) {
        if (response) {
            await getSubscription(response.email, "fb", response)
        }
    }

    const onFailure = (err) => {
        setError(JSON.stringify(err))
    }

    const onLogoutSuccess = () => {
        alert('logout success')
    }
    async function twitterLogin() {
        const opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }
        await fetch(`${API_URL}/twitterlogin`, opts)
    }
    const classes = useStyles();
    function handleSnackbarClose(event, reason) {
        if (reason === 'clickaway') {
            return
        }
        setSuccess(null)
    }
    /**
     * function to handle error snackbar
     */
    function handleErrorClose(event, reason) {
        setError(null)
    }
    function initClient() {
        gapi.client.init({
            clientId: CLIENT_ID,
            scope: 'email',
            plugin_name: 'fileshare'
        }).then(async function () {
        }, function (error) {
            console.log(JSON.stringify(error, null, 2));
        });
        // gapi.auth2.init({
        //     clientId: CLIENT_ID,
        // }).then(function () {
        //     console.log("check")
        // }, function (error) {
        //     console.log(JSON.stringify(error, null, 2));
        // });
    }
    function renderButton() {

    }
    return (
        <div
            className={clsx(
                'flex justify-center items-center  min-h-full-screen',
                classes.cardHolder
            )}
        >
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={success != null}
                autoHideDuration={1000}
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
                autoHideDuration={10000}
                onClose={handleErrorClose}
            >
                <MySnackbarContentWrapper
                    onClose={handleErrorClose}
                    variant="error"
                    message={error}
                />
            </Snackbar>
            <Card className={classes.card}>
                {/**
                 * home redirection 
                 */}
                <a href="/home" style={{ color: "blue", marginLeft: "10px" }}> {"< Go to home"}</a>
                <Grid container>
                    <Grid item lg={5} md={5} sm={5} xs={12}>
                        <div className="p-8 flex justify-center items-center h-full">
                            <img
                                className="w-200"
                                src="/assets/images/illustrations/dreamer.svg"
                                alt=""
                            />
                        </div>
                    </Grid>
                    <Grid item lg={7} md={7} sm={7} xs={12}>
                        <div className="p-8 h-full bg-light-gray relative">
                            <div className="flex flex-wrap items-center mb-4">
                                <div className="relative mt-6">
                                    <center>
                                        <div id="my-signin2"></div>
                                        {/* <GoogleLogin
                                            clientId={CLIENT_ID}
                                            // autoLoad={isGoogle}
                                            buttonText="Login With Google"
                                            onSuccess={onSuccess}
                                            onFailure={onFailure}
                                            style={{ width: "100%" }}
                                            cookiePolicy={'single_host_origin'}
                                            theme="dark"
                                        // disabledStyle={{ width: "100%" }}
                                        /> */}
                                        <FacebookLogin
                                            appId={FB_ID}
                                            // autoLoad={isFacebook}
                                            cssClass={classes.fbButton}
                                            fields="name,email,picture"
                                            callback={fbResponse}
                                            onFailure={onFailure}
                                        >
                                        </FacebookLogin>
                                    </center>
                                    {/* <GoogleLoginButton onClick={() => login('google')} /> */}
                                    {/* <LoginSocialFacebook
                                        appId="352174810057496"
                                        fields="name,email,picture"
                                        onResolve={async ({ provider, data }) => {
                                            console.log(data)
                                            localStorage.setItem("userEmail", data.email)
                                            localStorage.setItem("userName", data.name)
                                            localStorage.setItem("userImg", data.picture.data.url)
                                            localStorage.setItem("accessToken", data.accessToken)
                                            await onLoginStart();
                                            history.push("/dashboard/myfiles")
                                        }}
                                        onReject={(err) => {
                                            console.log(err)
                                        }}
                                    >
                                        <FacebookLoginButton />
                                    </LoginSocialFacebook> */}
                                    {/* <FacebookLoginButton onClick={() => login('facebook')} /> */}
                                    {/* <LoginSocialTwitter
                                        client_id={"LP6EdLwfOpZ0LMNMvxvzI3eB4"}
                                        client_secret={"1DsW8GvD9eLOUH4lNTVVZuzBuOrl4ovy6QGbNERugalZyhbVDI"}
                                        redirect_uri={REDIRECT_URL}
                                        onResolve={({ provider, data }) => {
                                            console.log(provider)
                                            console.log(data)
                                        }}
                                        onReject={(err) => {
                                            console.log(err)
                                        }}
                                    > */}
                                    {/* <TwitterLoginButton onClick={twitterLogin} /> */}
                                    {/* </LoginSocialTwitter> */}
                                    {/* <TwitterLoginButton onClick={() => login('twitter')} /> */}
                                    {/* <LoginSocialLinkedin
                                        scope={"r_liteprofile"}
                                        client_id={LINKEDIN_CLIENT_ID}
                                        client_secret={LINKEDIN_CLIENT_SECRET}
                                        redirect_uri={REDIRECT_URL}
                                        onLoginStart={linkedinLoginStart}
                                        onLogoutSuccess={onLogoutSuccess}
                                        onResolve={async ({ provider, data }) => {
                                            console.log(provider)
                                            const opts = {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({
                                                    token: data.access_token
                                                })
                                            }
                                            // const res = await fetch("https://api.linkedin.com/v2/me",{});
                                            const res = await fetch(`${API_URL}/linkedinprofile`, opts);
                                            localStorage.setItem("accessToken", data.access_token)
                                            console.log(data)
                                            console.log(res)
                                            alert("check")
                                            localStorage.setItem("linkedinlogin", true)
                                            history.push("/dashboard/myfiles")
                                            localStorage.removeItem("linkedinlogin")
                                            // console.log(res)
                                        }}
                                        onReject={(err) => {
                                            console.log(err)
                                        }}
                                    > */}
                                    {/* <LinkedInLoginButton onClick={() => login('linkedin')} /> */}
                                    {/* <LinkedInLoginButton onClick={linkedInLogin} /> */}
                                    {/* </LoginSocialLinkedin> */}
                                    {/* <center>OR</center>
                                    <div className="pt-3">
                                        <ValidatorForm onSubmit={handleFormSubmit}>
                                            <TextValidator
                                                className="mb-6 w-full"
                                                variant="outlined"
                                                size="small"
                                                label="Email"
                                                onChange={handleChange}
                                                type="email"
                                                name="email"
                                                value={email}
                                                validators={['required', 'isEmail']}
                                                errorMessages={[
                                                    'this field is required',
                                                    'email is not valid',
                                                ]}
                                            />
                                            <center>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    type="submit"
                                                >
                                                    Sign in
                                                </Button>
                                            </center>
                                        </ValidatorForm>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </Card>
        </div >
    )
}

export default JwtLogin
