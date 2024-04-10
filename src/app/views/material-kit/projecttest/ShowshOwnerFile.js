import React, { useEffect, useState } from 'react'
import {
    Button,
} from '@material-ui/core'
import { Breadcrumb, SimpleCard } from 'app/components';
import EthCrypto from "eth-crypto";
import crypt from "crypto-js";
import { makeStyles } from "@material-ui/core/styles";
import { API_URL } from "ServerConfig";
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS } from "ServerConfig";
import Web3 from "web3";
import { ipfs } from "./filecomponents/DLTcomponents/Web3/ipfs";
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from './SnackbarComponent';
import { getStoredWallet, getAllDIDData } from './StoreDataDid';
import history from 'history.js'
const useStyles = makeStyles((theme) => ({
    progress: {
        margin: theme.spacing(2),
    },
}))
const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));
let wallet;
let rows = [];
export default function ShowFile(props) {
    const [lock, setLock] = useState(true)
    const [url, setUrl] = useState("")
    const [error, setError] = useState(null)
    const hash = props.location.pathname.split("/");
    const dechash = Buffer.from(hash[3], 'base64').toString('ascii')
    const opts = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "email": localStorage.getItem("userEmail"),
            "username": localStorage.getItem("userName"),
        }),
    }
    function handleSnackbarClose(event, reason) {
        if (reason === 'clickaway') {
            return
        }
        setError(null)
    }
    try {
        if (dechash != "") {
            (async () => {
                if (localStorage.getItem("did_data") == null || localStorage.getItem("did_data") == "empty" || localStorage.getItem("did_data") == undefined) {
                    const data = await getAllDIDData();
                    if (data != "empty")
                        localStorage.setItem("did_data", data)
                } else {
                    const data = JSON.parse(localStorage.getItem("did_data"))
                    wallet = data.wallet;
                }
            })()
        }
        else {
            console.log("sorry")
        }
    }
    catch (e) {
        console.log(e)
    }
    function handleCancel() {
        history.push("/dashboard")
    }
    function convertWordArrayToUint8Array(wordArray) {
        var arrayOfWords = wordArray.hasOwnProperty("words") ? wordArray.words : [];
        var length = wordArray.hasOwnProperty("sigBytes")
            ? wordArray.sigBytes
            : arrayOfWords.length * 4;
        var uInt8Array = new Uint8Array(length),
            index = 0,
            word,
            i;
        for (i = 0; i < length; i++) {
            word = arrayOfWords[i];
            uInt8Array[index++] = word >> 24;
            uInt8Array[index++] = (word >> 16) & 0xff;
            uInt8Array[index++] = (word >> 8) & 0xff;
            uInt8Array[index++] = word & 0xff;
        }
        return uInt8Array;
    }
    const checkPassword = async () => {
        try {
            if (hash[6] == "transfer") {
                const privateKey = document.getElementById("password").value;
                if (privateKey != "") {
                    const decPrivateKey = crypt.AES.decrypt(wallet.privatekey, privateKey).toString(crypt.enc.Utf8)
                    if (decPrivateKey.length > 0) {
                        ipfs.files.get(dechash, async (err, files) => {
                            let data = files[0].content.toString("binary");
                            const encryptedObject = EthCrypto.cipher.parse(data);
                            const dec = await EthCrypto.decryptWithPrivateKey(
                                decPrivateKey,
                                encryptedObject
                            )
                            const decryptedPayload = JSON.parse(dec);
                            EthCrypto.recover(
                                decryptedPayload.signature,
                                EthCrypto.hash.keccak256(decryptedPayload.message)
                            );
                            var typedArray = convertWordArrayToUint8Array(decryptedPayload.message);
                            if (hash[5] == "wps-office.docx") {
                                var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
                            }
                            else if (hash[5] == "wps-office.pdf") {
                                var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: hash[4] + "/" + "pdf" }));
                            }
                            else if (hash[5] == "wps-office.doc"){
                                var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: hash[4] + "/" + "msword" }));
                            }
                            else if (hash[5] == "csv") {
                                var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: 'text/plain' }))
                            }
                            else {
                                var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: hash[4] + "/" + hash[5] }));

                            }
                            // var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: hash[4] + "/" + hash[5] }));


                            setLock(false)
                            setUrl(url1)
                        })
                    } else {
                        setError("your password may be wrong")
                    }
                } else {
                    setError("please enter password")
                }
            } else {
                const password = document.getElementById("password").value;
                if (password != "") {
                    try {
                        const decPrivate = crypt.AES.decrypt(wallet.privatekey, password).toString(crypt.enc.Utf8);
                        if (decPrivate.length > 0) {
                            ipfs.files.get(dechash, async function (err, files) {
                                if (hash[5] == "xml") {
                                    let cryptfile = files[0].content.toString("binary");
                                    const opts = {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            "file": cryptfile,
                                            "password": decPrivate
                                        }),
                                    }
                                    const data = await fetch(`${API_URL}/showedifile`, opts);
                                    await data.json()
                                        .then((res) => {
                                            setLock(false)
                                            document.getElementById("did_data").innerHTML = res.file;
                                        })
                                    // let decrypted = crypt.AES.decrypt(files[0].content.toString("binary"), decPrivate);
                                    // console.log(files[0].content.toString("binary"))
                                    // const edidata = files[0].content.toString("binary");
                                    // const test = decrypted.toString();
                                    // console.log(decrypted)
                                    // setLock(false)
                                } else {
                                    Array.from(files).forEach((file) => {
                                        let decryptedData = crypt.AES.decrypt(file.content.toString("binary"), decPrivate);
                                        var typedArray = convertWordArrayToUint8Array(decryptedData);
                                        if (hash[5] == "wps-office.docx") {
                                            var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: hash[4] + "/" + "vnd.openxmlformats-officedocument.wordprocessingml.document" }));
                                        }
                                        else if (hash[5] == "wps-office.pdf") {
                                            var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: hash[4] + "/" + "pdf" }));
                                        }
                                        else if (hash[5] == "wps-office.doc"){
                                            var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: hash[4] + "/" + "msword" }));
                                        }
                                        else if (hash[5] == "wps-office.pptx") {
                                            var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: hash[4] + "/" + 'vnd.openxmlformats-officedocument.presentationml.presentation' }))
                                        }
                                        else if (hash[5] == "csv") {
                                            var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: 'text/plain' }))
                                        }
                                        else {
                                            var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: hash[4] + "/" + hash[5] }));
                                        }
                                        // var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: hash[4] + "/" + hash[5] }));
                                        // window.open(url1)
                                        setUrl(url1);
                                        setLock(false)
                                    })
                                }
                            })
                        } else {
                            setError("your password may be wrong")
                        }
                        // console.log(decrypted)
                        // console.log(decrypted.toString(crypt.enc.Utf8))
                    } catch (e) {
                        setError("something went wrong")
                        console.log(e)
                    }
                } else {
                    setError("please enter password");
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Uploaded Files' },
                    ]}
                />
            </div>
            <div id="did_data"></div>
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
            <Dialog
                open={lock}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">This File is locked please
                    enter wallet password</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="password"
                        label="file password"
                        type="password"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>

                    <Button
                        color="primary"
                        onClick={() => checkPassword()}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
            {/* <DocViewer pluginRenderers={DocViewerRenderers} documents={docs} /> */}
            {/* 
            <div className="App">
      <div className="header">React sample</div>
      <div className="webviewer" ref={viewer}></div>
    </div> */}

            <iframe src={url}
                style={{
                    width: "800px",
                    height: "800px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    display: "block"
                }}></iframe>
        </div>
    );
}