import React, { useEffect, useRef, useState } from "react";
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, convertFromHTML, ContentState } from "draft-js";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Breadcrumb } from "app/components";
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import {
    Button
} from '@material-ui/core'
import { makeStyles } from "@material-ui/styles";
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from './SnackbarComponent';
import draftToHtml from 'draftjs-to-html';
import { API_URL } from "ServerConfig";
import { getAllDIDData } from "./StoreDataDid";
import ChipInput from 'material-ui-chip-input';
let wallet;
const useStyles = makeStyles(({ palette, ...theme }) => ({
    productTable: {
        '& small': {
            height: 15,
            borderRadius: 500,
            boxShadow:
                '0 0 2px 0 rgba(0, 0, 0, 0.12), 0 2px 2px 0 rgba(0, 0, 0, 0.24)',
        },
        '& td': {
            borderBottom: 'none',
        },
        '& td:first-child': {
            paddingLeft: '16px !important',
        },
    },
}))

export default function SendMail() {
    const [disable, setDisable] = useState(true)
    const [ccAddress, setCCAddress] = useState({ chips: [] });

    const form = useRef();
    (async () => {
        try {
            if (localStorage.getItem("did_data") == null || localStorage.getItem("did_data") == "undefined" || localStorage.getItem("did_data") == "empty" || localStorage.getItem("did_data") == undefined) {
                /**
                 * function to get user did
                 */
                const data = await getAllDIDData();
                if (data == "empty" || data == undefined) {
                    setDisable(true)
                } else {
                    localStorage.setItem("did_data", data)
                    window.location.reload();
                }
            } else {
                const data = JSON.parse(localStorage.getItem("did_data"));
                wallet = data.wallet;
            }
        } catch (e) { }
    })();
    const [state, setState] = React.useState({})
    const [message, setMessage] = useState(
        EditorState.createWithContent(
            ContentState.createFromBlockArray(
                convertFromHTML(`<b>Hello</b> ,
                 <br></br>Enter Mail here<br></br>
                 <b>Account Address</b> : ${wallet.walletaddress}<br></br>
                 <b>Public Key</b> : ${wallet.publicKey}<br></br>
                 <a href=https://www.nextfileshare.com/project/createproject>
                 <u style = "color:blue"}>Upload / Share File Here</u>
                 </a>`)
            )
        )
    )
    const [success, setSuccess] = useState(null)
    const [error, setError] = useState(null)
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
        e.preventDefault();
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
            }),
        }
        const response = await fetch(`${API_URL}/sendmail`, mail);
        const resData = await response.json();
        if (resData.status === 'success') {
            console.log("set")
            setSuccess("Email sent")
        } else if (resData.status === 'fail') {
            setError("Mail failed to send.")
        }
    }

    function handleSnackbarClose() {
        setError(null)
        setSuccess(null)
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
        alert(chip)
        alert(index)
        const chips = ccAddress.chips.slice();
        chips.splice(index, 1);
        setCCAddress({ chips });
    }
    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb
                    routeSegments={[
                        { name: 'SendMail' },
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
                    className="mb-6 w-full"
                    variant="outlined"
                    size="small"
                    onClose={handleSnackbarClose}
                    message={error}
                />
            </Snackbar>
            <ValidatorForm ref={form} onSubmit={handleFormSubmit}>
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
                    className="mb-6 w-full"
                    variant="outlined"
                    size="small"
                    placeholder="CC"
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
                    editorState={message}
                    initialEditorState={message}
                    wrapperClassName="wrapper-class"
                    editorClassName="editor-class"
                    toolbarClassName="toolbar-class"
                    wrapperStyle={{ border: "2px solid #34314C", borderRadius: "4px 4px 4px 4px", marginBottom: "20px" }}
                    editorStyle={{ height: "200px", padding: "10px" }}
                    onEditorStateChange={handleMessageChange}
                />
                <br></br>
                <center>
                    <Button
                        className="capitalize"
                        variant="contained"
                        color="primary"
                        type="submit"
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