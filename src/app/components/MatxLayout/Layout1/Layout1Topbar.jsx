import React, { useState } from 'react'
import {
    Icon,
    IconButton,
    MenuItem,
    Avatar,
    useMediaQuery,
    Hidden,
} from '@material-ui/core'
import { MatxMenu } from 'app/components'
import NotificationBar from '../../NotificationBar/NotificationBar'
import { Link } from 'react-router-dom'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { Backdrop, CircularProgress } from '@material-ui/core'
import clsx from 'clsx'
import useSettings from 'app/hooks/useSettings'
import { NotificationProvider } from 'app/contexts/NotificationContext'
// import history from 'history.js';
import { useEffect } from 'react'
import { WEB3AUTH_CLIENTID, CLIENT_ID, API_URL, INFURA_URL } from 'ServerConfig';
import SharePopup from "./SharePopup";
import { gapi } from "gapi-script";
import PasswordPopup from "./PasswordPopup"
import RevokePopup from './RevokePopup'
import PrintPopup from "./PrintPopup";
import { getAllDIDData, getDID, storeDID, checkLoginStatus } from "../../../views/material-kit/projecttest/StoreDataDid";
import { ipfs } from '../../../views/material-kit/projecttest/filecomponents/DLTcomponents/Web3/ipfs';
import crypt from "crypto-js"
import ResponsiveDialog from 'app/views/material-kit/dialog/ResponsiveDialog'
import { SimpleCard } from 'app/components'
import Web3 from 'web3'
import WaitSnackbar from '../../../views/material-kit/projecttest/filecomponents/WaitSnackbar';
import Alert from "@material-ui/lab/Alert"
import { getUserRole } from 'app/views/material-kit/projecttest/roles/UserRoles'
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from "../SnackbarComponent";
import GoogleLogout from 'react-google-login';
import ForgotPassword from 'app/views/material-kit/projecttest/ForgotPassword'
import { Web3Auth } from "@web3auth/web3auth";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { useHistory } from 'react-router-dom'
const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));

const useStyles = makeStyles(({ palette, ...theme }) => ({
    topbar: {
        top: 0,
        zIndex: 96,
        transition: 'all 0.3s ease',
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 44%, rgba(247, 247, 247, 0.4) 50%, rgba(255, 255, 255, 0))',

        '& .topbar-hold': {
            backgroundColor: palette.primary.main,
            height: 80,
            paddingLeft: 18,
            paddingRight: 20,
            [theme.breakpoints.down('sm')]: {
                paddingLeft: 16,
                paddingRight: 16,
            },
            [theme.breakpoints.down('xs')]: {
                paddingLeft: 14,
                paddingRight: 16,
            },
        },
        '& .fixed': {
            boxShadow: theme.shadows[8],
            height: 64,
        },
    },
    userMenu: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: 24,
        padding: 4,
        '& span': {
            margin: '0 8px',
            // color: palette.text.secondary
        },
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        minWidth: 185,
    },
}))
let wrongCounter = 1;
const Layout1Topbar = () => {
    let history = useHistory()
    const theme = useTheme()
    const classes = useStyles()
    const [userName, setUserName] = useState("");
    const [userImg, setUserImg] = useState("");
    const [share, setShare] = useState(false);
    const [revoke, setRevoke] = useState(false);
    const [print, setPrint] = useState(false);
    const [progress, setProgress] = useState(false);
    const [syncProgress, setSyncProgress] = useState(false);
    const [open, setOpen] = useState(false);
    const [userHash, setUserHash] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [warning, setWarning] = useState(null);
    const [userDID, setUserDID] = useState(null);
    const [logout, setLogout] = useState(false);
    const [company, setCompany] = useState(false);
    const [profile, setProfile] = useState(false);
    const [allUser, setAllUser] = useState(false);
    const [sessionLogout, setSessionLogout] = useState(false);
    const [expired, setExpired] = useState(false);
    const [sync, setSync] = useState(false);
    const [syncStatus, setSyncStatus] = useState(false);
    const [secondLogout, setSecondLogout] = useState(false);
    const [forgot, setForgot] = useState(false);
    const [popupStatus, setPopupStatus] = useState(false);
    const { settings, updateSettings } = useSettings()
    const [web3auth, setWeb3auth] = useState(null);
    const [provider, setProvider] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState({
        allDisabled: false,
        shareDisabled: false,
        revokeDisabled: false,
        downloadDisabled: false
    });
    const [status, setStatus] = useState(false);

    const isMdScreen = useMediaQuery(theme.breakpoints.down('md'))
    const fixed = settings?.layout1Settings?.topbar?.fixed
    var API_KEY = 'AIzaSyBgmQ-VTtZq0Jvh78Z2NbTpDzbnu9SqdNg';
    var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/people/v1/rest"];
    var SCOPES = "https://www.googleapis.com/auth/contacts.readonly";

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
    const updateSidebarMode = (sidebarSettings) => {
        updateSettings({
            layout1Settings: {
                leftSidebar: {
                    ...sidebarSettings,
                },
            },
        })
    }
    // setInterval(async() => {
    //     if(localStorage.getItem("did_data")=="empty")
    //     await init()
    // },100)
    useEffect(() => {
        (async () => {
            try {
                localStorage.removeItem("forgotstatus")
                setTimeout(async () => {
                    await checkLoginStatus(function (response, page) {
                        if (response) {
                            setSessionLogout(!sessionLogout);
                            if (expired) {
                                localStorage.clear();
                                setTimeout(() => {
                                    if (!page) {
                                        window.location.href = '/home'
                                        // history.replace("/home")
                                    }
                                }, 2000)
                            }
                        }
                    });
                }, 2000)
                gapi.load('client:auth2', initClient);
                const localdata = await getDID();
                if (localdata && localdata != false) {
                    setUserHash(localdata.hash)
                    setUserDID(localdata.userDID)
                    if (localStorage.getItem("idx_id") == null && (localdata.hash != null)) {
                        localStorage.setItem("userData", localdata.hash)
                        setOpen(true)
                    }
                }
                await init()
                const data = JSON.parse(localStorage.getItem("did_data"));
                const hash = await getUserRole();
                if (hash == "") {
                    if (data && data.companyProfile == null || data.companyProfile == undefined) {
                        setPermissionStatus(permissionStatus)
                        setStatus(true)
                    } else {
                        setStatus(true)
                    }
                } else {
                    ipfs.files.get(hash, function (err, files) {
                        try {
                            const data = JSON.parse(files[0].content.toString("binary"));
                            const permissions = data[0].userRolePermission;
                            // console.log("inactive user",permissions)
                            if (permissions.Inactive) {
                                permissionStatus.shareDisabled = true;
                                permissionStatus.partnerDisabled = true;
                                permissionStatus.revokeDisabled = true;
                                permissionStatus.downloadDisabled = true;
                            }
                            else if (!permissions.Share) {
                                permissionStatus.shareDisabled = true;
                            }
                            else if (!permissions.Partner) {
                                permissionStatus.partnerDisabled = true;
                            }
                            else if (!permissions.Revokefile) {
                                permissionStatus.revokeDisabled = true;
                            }
                            else if (!permissions.Download) {
                                permissionStatus.downloadDisabled = true;
                            }
                            setStatus(true)
                        } catch (e) {
                            console.log(e)
                        }
                    })
                }
                if (data.wallet.walletaddress) {
                    const opts = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "email": localStorage.getItem("userEmail"),
                            "Wallet_address": data.wallet.walletaddress,
                        }),
                    }
                    const res = await fetch(`${API_URL}/walletAddress`, opts);
                    await res.json()
                        .then((res) => {
                            // console.log("sandeeep",res);
                        })
                }
            } catch (e) {
                console.log(e)
            }
        })();
        setInterval(async () => {
            await checkLoginStatus(function (response, page) {
                if (response) {
                    setSessionLogout(!sessionLogout);
                    if (expired) {
                        localStorage.clear();
                        setTimeout(() => {
                            if (!page) {
                                window.location.href = '/home'
                                // history.replace("/home")
                            }
                        }, 2000)
                    }
                }
            });
        }, 60000)
        const timer = setInterval(() => {
            const data = localStorage.getItem("userData");
            if (localStorage.getItem("idx_id") == null && !popupStatus && data != undefined && data != null && !open && !progress && localStorage.getItem("forgotstatus") != "true") {
                wrongCounter++;
                setPopupStatus(false)
                setProgress(false)
                setOpen(true);
            }
            // if (loader) clearInterval(timer);
        }, 3000)
    }, []);

    function handleSessionLogout(event, reason) {
        if (reason && reason == "backdropClick")
            return;
        setSessionLogout(!sessionLogout);
    }
    async function getUserData() {
        // setOpen(false)
        setProgress(true)
        setPopupStatus(true)
        const password = document.getElementById("file-password").value;
        // for await (const file of ipfs.cat(userHash)) {
        //     console.log(file.path)

        //     const content = new BufferList()
        //     for await (const chunk of file.content) {
        //         content.append(chunk)
        //     }

        //     console.log(content.toString())
        // }
        await ipfs.files.get(userHash.toString(), async function (err, files) {
            if (err) {
                setError("something went wrong")
                console.log(err)
            }
            else {
                Array.from(files).forEach(async (file) => {
                    try {
                        const data = JSON.parse(file.content.toString("binary"));
                        const decPrivateKey = crypt.AES.decrypt(data.phash, password).toString(crypt.enc.Utf8);
                        if (decPrivateKey.length > 0) {
                            const did = crypt.AES.decrypt(userDID, decPrivateKey).toString(crypt.enc.Utf8);
                            localStorage.setItem("idx_id", did || userDID)
                            await getAllDIDData();
                            window.location.reload()
                        } else {
                            setPopupStatus(false)
                            setOpen(!open)
                            setProgress(false)
                            setError("your password may be wrong")
                        }
                    }
                    catch (e) {
                        setPopupStatus(false)
                        setOpen(!open)
                        setProgress(false)
                        setError("your password may be wrong")
                        console.log(e)
                    }
                })
            }
        })
    }
    async function init() {
        try {
            if (localStorage.getItem("accessToken") !== null) {
                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "email": localStorage.getItem("userEmail"),
                    }),
                }
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
                    })
                    .catch((e) => {
                        console.log(e)
                    })

            } else {
                setSessionLogout(!sessionLogout);
                window.location.href = '/home'
                // history.replace("/home")
            }
        } catch (e) {
            console.log(e)
        }

    }
    async function onSuccess() {
        try {
            const auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(async () => {
                console.log("=====>logout")
                // if (!web3auth) {
                //     console.log("web3auth not initialized yet");
                //     return;
                //   }
                // const web3authProvider = await web3auth.logout();
                localStorage.clear();
                window.location.href = '/home'
                // history.replace("/home")
            });
            // await openlogin.logout()
            //     .then((res) => {
            //         // localStorage.removeItem("userName")
            //         // localStorage.removeItem("userEmail")
            //         // localStorage.removeItem("userImg")
            //         // localStorage.removeItem("privKey")
            //         // localStorage.removeItem("did_data")
            //         // localStorage.removeItem("idx_id")
            //         // localStorage.removeItem("userData")
            //         // localStorage.removeItem("userToken")
            //         // localStorage.removeItem("tokenHash")
            //         // localStorage.removeItem("walletAddress")
            //         localStorage.clear();
            //         history.push("/home")
            //         console.log('User signed out.');
            //     })
            //     .catch((e) => {
            //         localStorage.clear();
            //         console.log("error : ", e)
            //     })
        } catch (e) {
            setError(JSON.stringify(e))
            console.log(e)
        }
    }

    const handleSidebarToggle = () => {
        let { layout1Settings } = settings
        let mode
        if (isMdScreen) {
            mode =
                layout1Settings.leftSidebar.mode === 'close'
                    ? 'mobile'
                    : 'close'
        } else {
            mode =
                layout1Settings.leftSidebar.mode === 'full' ? 'close' : 'full'
        }

        updateSidebarMode({ mode })
    }
    function shareFile() {
        setShare(!share)
    }
    function revokeFile() {
        setRevoke(!revoke)
    }
    function printFile() {
        setPrint(!print)
    }
    function handleSecondLogout() {
        setLogout(false)
        setSecondLogout(!secondLogout)
    }
    const statusInterval = setInterval(() => {
        try {
            if (localStorage.getItem("sync") !== null) {
                setSyncStatus(true)
            } else setSyncStatus(false)
            if (userName == "" || userImg == "") {
                setUserName(localStorage.getItem("userName"))
                setUserImg(localStorage.getItem("userImg"))
            }
            if (localStorage.getItem("did_data") === null && localStorage.getItem("userToken") === null
            ) {
                setAllUser(true)
            }
            else if (localStorage.getItem("did_data") === null) {
                setProfile(true)
            }
            else {
                const data = JSON.parse(localStorage.getItem("did_data"));
                if (data.companyProfile)
                    setCompany(true);
                else if (data.profile || data.userToken)
                    setProfile(true)
                else {
                    setAllUser(true)
                }
            }
        } catch (e) { }
    }, 2000)
    function handleClose() {
        setOpen(!open)
        setPopupStatus(!popupStatus)
    }
    function handleSync() {
        setSync(!sync)
    }
    function handleLogout() {
        setLogout(!logout);
    }
    async function syncWithContract() {
        setSync(false)
        setSyncProgress(true)
        const password = document.getElementById("file-password").value;
        try {
            const data = JSON.parse(localStorage.getItem("did_data"));
            const decPrivateKey = crypt.AES.decrypt(data.wallet.privatekey, password).toString(crypt.enc.Utf8);
            if (decPrivateKey.length > 0) {
                await storeDID(localStorage.getItem("idx_id"), decPrivateKey, data.wallet.walletaddress)
                    .then((res) => {
                        localStorage.removeItem("sync");
                        setSyncProgress(false);
                    }).catch((e) => {
                        setSyncProgress(false)
                        console.log(e)
                        setError("insuffiecient fund!")
                    })
            } else {
                setSyncProgress(false)
                setError("your password may be wrong");
            }
        }
        catch (e) {
            setSyncProgress(false)
            console.log(e)
            setError("something went wrong")
        }
    }
    function handleErrorClose(event, reason) {
        setError(null)
        setSuccess(null)
    }
    function handleForgot() {
        setOpen(false)
        localStorage.setItem("forgotstatus", true)
        setForgot(!forgot)
    }
    function handleForgotClose() {
        localStorage.removeItem("forgotstatus")
        if (localStorage.getItem("idx_id") == null)
            setOpen(!open)
        setForgot(!forgot)
    }
    return (
        <div className={classes.topbar}>
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={error != null}
                autoHideDuration={3000}
                onClose={handleErrorClose}
            >
                <MySnackbarContentWrapper
                    onClose={handleErrorClose}
                    variant="error"
                    message={error}
                />
            </Snackbar>
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={warning != null}
                autoHideDuration={20000}
                onClose={handleErrorClose}
            >
                <MySnackbarContentWrapper
                    onClose={handleErrorClose}
                    variant="warning"
                    message={warning}
                />
            </Snackbar>
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={success != null}
                autoHideDuration={2000}
                onClose={handleErrorClose}
            >
                <MySnackbarContentWrapper
                    onClose={handleErrorClose}
                    variant="success"
                    message={success}
                />
            </Snackbar>
            <ResponsiveDialog status={logout} close={handleLogout} submit={handleSecondLogout}
                content={"please sync with blockchain otherwise you may lost your data."}
                header={"Are you sure to logout ?"}
                color={"red"}
            />
            <ResponsiveDialog status={secondLogout} close={handleSecondLogout} submit={onSuccess}
                header={"Are you sure to logout ?"}
            />
            <ResponsiveDialog status={sessionLogout} close={handleSessionLogout} submit={onSuccess}
                syncWithContract={handleSync}
                header={"Your Session has been expired!"}
                sync={syncStatus}
                synced={!syncStatus}
                warning={handleLogout}
                disableStatus={syncProgress}
            />
            {
                progress &&
                <WaitSnackbar
                    message={"please wait while data loading"}
                ></WaitSnackbar>
            }
            {
                syncProgress &&
                <WaitSnackbar
                    message={"please wait while sync with blockchain"}
                ></WaitSnackbar>
            }
            {
                open &&
                <PasswordPopup status={open} close={handleClose} submit={getUserData} forgot={true} forgotSubmit={handleForgot} popupStatus={popupStatus} />
            }
            {
                forgot &&
                <ForgotPassword
                    close={handleForgotClose}
                    status={forgot}
                    error={setError}
                    success={setSuccess}
                />
            }
            <PasswordPopup status={sync} close={handleSync} submit={syncWithContract} />
            {share && <SharePopup close={shareFile} />}
            {revoke && <RevokePopup close={revokeFile} />}
            {print && <PrintPopup close={printFile} />}
            <div className={clsx({ 'topbar-hold': true, fixed: fixed })}>
                <div className="flex justify-between items-center h-full">
                    <div className="flex">
                        <IconButton
                            onClick={handleSidebarToggle}
                        >
                            <Icon>menu</Icon>
                        </IconButton>

                        <div className="hide-on-mobile">
                            <IconButton>
                                <Icon style={{ cursor: "pointer" }}>
                                    <Link to="/sendmail">
                                        mail_outline
                                    </Link>
                                </Icon>
                            </IconButton>
                            <IconButton disabled={status && permissionStatus.shareDisabled} onClick={() => status && shareFile()}>
                                <Icon style={{ cursor: "pointer" }}>share</Icon>
                            </IconButton>
                            <IconButton disabled={status && permissionStatus.revokeDisabled} onClick={() => status && revokeFile()}>
                                <Icon style={{ cursor: "pointer" }}>restore</Icon>
                            </IconButton>
                            <IconButton disabled={status && permissionStatus.downloadDisabled} onClick={() => status && printFile()}>
                                <Icon style={{ cursor: "pointer" }}>
                                    print
                                </Icon>
                            </IconButton>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {
                            localStorage.getItem("walletSync") !== null ?
                                <Alert severity="warning" onClick={() => localStorage.getItem("walletSync") == "true" ? setError("Please sync wallet from e-Wallet page") : setSync(true)} style={{ cursor: "pointer" }}>Sync your wallet on wallet page</Alert>
                                :
                                syncStatus ?
                                    <Alert severity="warning" onClick={() => setSync(true)} style={{ cursor: "pointer" }}>Sync data with blockchain</Alert>
                                    :
                                    <Alert severity="success" style={{ cursor: "pointer" }}>Successfully synced with blockchain</Alert>
                        }
                        <NotificationProvider>
                            <NotificationBar />
                        </NotificationProvider>

                        {/* <NotificationBar2 /> */}

                        {/*<ShoppingCart />*/}

                        <MatxMenu
                            menuButton={
                                <div className={classes.userMenu}>
                                    <Hidden xsDown>
                                        <span>
                                            <strong>{userName}</strong>
                                        </span>
                                    </Hidden>
                                    <Avatar
                                        className="cursor-pointer"
                                        src={userImg}
                                    />

                                </div>
                            }
                        >
                            <MenuItem>
                                <Link className={classes.menuItem} to="/home">
                                    <Icon> home </Icon>
                                    <span className="pl-4"> Home </span>
                                </Link>
                            </MenuItem>

                            {
                                allUser &&
                                <>
                                    <MenuItem>
                                        <Link
                                            className={classes.menuItem}
                                            to="/profile"
                                        >
                                            <Icon> person </Icon>
                                            <span className="pl-4"> Profile </span>
                                        </Link>
                                    </MenuItem>
                                    <MenuItem>
                                        <Link
                                            className={classes.menuItem}
                                            to="/mycompany"
                                        >
                                            <Icon> business_center </Icon>
                                            <span className="pl-4"> My company </span>
                                        </Link>
                                    </MenuItem>
                                </>
                            }
                            {profile &&
                                <>
                                    <MenuItem>
                                        <Link
                                            className={classes.menuItem}
                                            to="/profile"
                                        >
                                            <Icon> person </Icon>
                                            <span className="pl-4"> Profile </span>
                                        </Link>
                                    </MenuItem>
                                </>
                            }
                            {company &&
                                <>
                                    <MenuItem>
                                        <Link
                                            className={classes.menuItem}
                                            to="/mycompany"
                                        >
                                            <Icon> business_center </Icon>
                                            <span className="pl-4"> My company </span>
                                        </Link>
                                    </MenuItem>
                                    <MenuItem>
                                        <Link
                                            className={classes.menuItem}
                                            to="/roles/manageroles"
                                        >
                                            <Icon> layers </Icon>
                                            <span className="pl-4"> Manage Roles </span>
                                        </Link>
                                    </MenuItem>
                                </>
                            }
                            {/* <MenuItem className={classes.menuItem}>
                                <Icon> settings </Icon>
                                <span className="pl-4"> Settings </span>
                            </MenuItem> */}
                            {/* <MenuItem className={classes.menuItem}>
                                <Icon> contacts </Icon>
                                <span className="pl-4" onClick={() => getContacts()}> Contacts </span>
                            </MenuItem> */}
                            <MenuItem
                                className={classes.menuItem}
                            >
                                <Icon> phonelink_lock </Icon>
                                <span className="pl-4" onClick={handleForgot}> Forgot Password? </span>
                            </MenuItem>
                            <MenuItem
                                className={classes.menuItem}
                            >
                                <Icon> lock </Icon>
                                <span className="pl-4" onClick={userHash != null && !syncStatus ? onSuccess : handleLogout}> Logout </span>
                            </MenuItem>

                        </MatxMenu>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default React.memo(Layout1Topbar)