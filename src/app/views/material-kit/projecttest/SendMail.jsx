import React, { useEffect, useRef, useState } from "react";
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, convertFromHTML, ContentState } from "draft-js";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Breadcrumb } from "app/components";
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import {
    Button
} from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from './SnackbarComponent';
import draftToHtml from 'draftjs-to-html';
import { API_URL, PARTNER_WARNING } from "ServerConfig";
import { storeMailRecord } from "./StoreDataDid";
import ChipInput from 'material-ui-chip-input';
import { getAllDIDData } from "./StoreDataDid"
import { makeStyles } from "@material-ui/styles";
import PasswordPopup from "../../../components/MatxLayout/Layout1/PasswordPopup";
import crypt from "crypto-js";
import { getUserRole } from "./roles/UserRoles";
import { ipfs } from "../projecttest/filecomponents/DLTcomponents/Web3/ipfs"
import RoleWarningPopup from "./RoleWarningPopup"
import { CircularProgress } from '@material-ui/core';

let wallet;
let companyData;
const useStyles = makeStyles(({ palette, ...theme }) => ({
    chipContainer: {
        height: 5
    },
    ".WAMuiChipInput-inputRoot-434.WAMuiChipInput-outlined-437": {
        height: "5px !important"
    }
}))
export default function SendMail() {
    const classes = useStyles()
    const form = useRef();
    const [state, setState] = React.useState({})
    const [success, setSuccess] = useState(null)
    const [error, setError] = useState(null)
    const [info, setInfo] = useState(null)
    const [companyToken, setCompanyToken] = useState(null)
    const [open, setOpen] = useState(false)
    const [progress, setProgress] = useState(false)
    const [ccAddress, setCCAddress] = useState({ chips: [] });
    useEffect(() => {
        (async () => {
            try {
                if (localStorage.getItem("did_data") == null || localStorage.getItem("did_data") == "undefined" || localStorage.getItem("did_data") == "empty" || localStorage.getItem("did_data") == undefined) {
                    /**
                     * function to get user did
                     */
                    const data = await getAllDIDData();
                    if (data == "empty" || data == undefined) {
                    } else {
                        localStorage.setItem("did_data", data)
                        window.location.reload();
                    }
                } else {
                    const data = JSON.parse(localStorage.getItem("did_data"));
                    wallet = data.wallet;
                    if (data.companyProfile) {
                        companyData = JSON.parse(data.companyProfile[localStorage.getItem("userEmail")]);
                        // token = companyData.companyToken;
                        // setCompanyToken(token)
                    }
                }
            } catch (e) { }
        })();
    }, [])
    const [message, setMessage] = useState(null);
    const time = setTimeout(() => {
        try {
            // console.log("This is try block...")
            if (message == null) {
                setMessage(EditorState.createWithContent(
                    ContentState.createFromBlockArray(
                        convertFromHTML(`<b>Hi there</b> ,
                 <br></br>Pls type the content of your message here<br></br>
                 <u style = "color:blue;cursor:pointer"}><a href=https://www.tradeblocknet.com/home/${companyData?companyData.companyToken:""}>Upload / Share File Here</a></u><br></br>
                 <b>Title</b> - Sending Contact details<br></br>
                 <b>Account Address</b> : ${wallet && wallet.walletaddress}<br></br>
                 <b>Public Key</b> : ${wallet && wallet.publicKey}<br></br>
                 `)
                    )
                )
                )
            }
            clearTimeout(time)
        } catch (e) { console.log(e)}
    }, 2000)

    const handleChange = ({ target: { name, value } }) => {
        setState({
            ...state,
            [name]: value,
        })
    }
    const handleMessageChange = (e) => {
        setMessage(e);
    }
    let { email, subject } = state
    const handleFormSubmit = async (e) => {
        if (wallet != null) {
            // const password = document.getElementById("file-password").value;
            // const decPrivate = crypt.AES.decrypt(wallet.privatekey, password).toString(crypt.enc.Utf8);
            // if (decPrivate.length <= 0)
            //     setError("your password may be wrong");
            // else {
            setProgress(true)
            setOpen(false)
            setInfo("please wait while mail sent")
            let data = draftToHtml(convertToRaw(message.getCurrentContent()));
            const mail = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "email": data,
                    "subject": subject,
                    "to": email,
                    "ccaddress": ccAddress.chips,
                    "from": localStorage.getItem("userEmail")
                }),
            }
            const response = await fetch(`${API_URL}/sendmail`, mail);
            const resData = await response.json();
            const date = Date.now();
            if (resData.status) {
                try {
                    const allEmail = ccAddress.chips;
                    allEmail.push(email)
                    await storeMailRecord(localStorage.getItem("userEmail"), allEmail, subject, date, wallet.walletaddress);
                    setInfo(null)
                    setProgress(false)
                    setState({})
                    setCCAddress({ chips: [] })
                    setSuccess("Email sent")
                } catch (e) {
                    setProgress(false)
                    setError("something went wrong")
                    setInfo(null)
                    console.log(e)
                }
            } else {
                setProgress(false)
                setInfo(null)
                setError("Mail failed to send.")
            }
            // }
            //  else {
            //     setError("please create wallet")
            // }
        }
    }

    function handleSnackbarClose() {
        setError(null)
        setSuccess(null)
        setInfo(null)
    }
    const options = {
        replace: (domNode) => {
            if (domNode.attribs && domNode.attribs.class === "remove") {
                return <></>;
            }
        }
    };
    function addChip(value) {
        const chips = ccAddress.chips.slice();
        chips.push(value);
        setCCAddress({ chips });
    }
    function removeChip(chip, index) {
        const chips = ccAddress.chips.slice();
        chips.splice(index, 1);
        setCCAddress({ chips });
    }
    function handleOpen() {
        // setOpen(!open)
        let data24 = localStorage.getItem("did_data")
        let data23 = JSON.parse(data24)
        // console.log("sfdsd",data23.wallet.useremail)
        // console.log(email)
        if(data23.wallet.useremail === email){
            setError("You cannot send mail to yourself!")
        }
        else{
        handleFormSubmit()
        }
    }

    return (
        <div className="m-sm-30">
            {/* <PasswordPopup status={open} close={handleOpen} submit={handleFormSubmit} /> */}
            <div className="mb-sm-30">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Send Trade mail' },
                    ]}
                />
            </div>
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
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={info != null}
                autoHideDuration={5000}
                onClose={handleSnackbarClose}
            >
                <MySnackbarContentWrapper
                    onClose={handleSnackbarClose}
                    variant="info"
                    message={info}
                />
            </Snackbar>
            <ValidatorForm ref={form} onSubmit={handleOpen}>
                <TextValidator
                    className="mb-6 w-full"
                    variant="outlined"
                    size="small"
                    label="To"
                    onChange={handleChange}
                    type="email"
                    name="email"
                    value={email || ''}
                    validators={['required', 'isEmail']}
                    errorMessages={[
                        'this field is required',
                        'email is not valid',
                    ]}
                />
                <ChipInput
                    className={`mb-6 w-full`}
                    variant="outlined"
                    size="small"
                    label={"CC address"}
                    placeholder={"CC"}
                    value={ccAddress.chips}
                    onAdd={(chip) => addChip(chip)}
                    onDelete={(chip, index) => removeChip(chip, index)}
                />

                <TextValidator
                    className="mb-6 w-full"
                    variant="outlined"
                    size="small"
                    label="Subject"
                    onChange={handleChange}
                    type="text"
                    name="subject"
                    value={subject || ''}
                    validators={['required']}
                    errorMessages={[
                        'this field is required',
                    ]}
                />
                <Editor
                    id="editor"
                    initialEditorState={message}
                    editorState={message}
                    wrapperClassName="wrapper-class"
                    editorClassName="editor-class"
                    toolbarClassName="toolbar-class"
                    wrapperStyle={{ border: "2px solid #34314C", borderRadius: "4px 4px 4px 4px", marginBottom: "20px" }}
                    editorStyle={{ height: "200px", padding: "10px" }}
                    onEditorStateChange={handleMessageChange}
                />
                <br></br>
                <center>
                    {
                        progress &&
                        <div>
                            <CircularProgress />
                        </div>
                    }
                    <Button
                        className="capitalize"
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={!wallet || progress}
                    >
                        Send
                    </Button>
                </center>
            </ValidatorForm>
            {/* <div className="App">
                <input placeholder="Name" onChange={e => setName(e.target.value)} />
                <input placeholder="Profile Image" onChange={e => setImage(e.target.value)} />
                <button onClick={updateProfile}>Set Profile</button>
                <button onClick={readProfile}>Read Profile</button>

                {name && <h3>{name}</h3>}
                {image && <img style={{ width: '400px' }} src={image} />}
                {(!image && !name && loaded) && <h4>No profile, please create one...</h4>} 
            </div>
            */}
        </div>
    );
}