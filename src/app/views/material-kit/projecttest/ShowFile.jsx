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
let fileDetails;
let allHash = [];

export default function ShowFile(props) {
    const [lock, setLock] = useState(true)
    const [file, setFile] = useState(false)
    const [status, setStatus] = useState(false)
    const [url, setUrl] = useState("")
    const [error, setError] = useState(null)
    const [id, setId] = useState(null)
    const [originator, setOriginator] = useState(null)
    const [originatorAddress, setOriginatorAddress] = useState(null)
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
    function handleCancel() {
        history.push("/project/viewfile")
    }
    useEffect(() => {
        (async () => {
            try {
                if (localStorage.getItem("did_data") == null || localStorage.getItem("did_data") == "empty" || localStorage.getItem("did_data") == undefined) {
                    const data = await getAllDIDData();
                    if (data != "empty")
                        localStorage.setItem("did_data", data)
                } else {
                    const data = JSON.parse(localStorage.getItem("did_data"))
                    wallet = data.wallet;
                }
                const address = wallet.walletaddress;
                const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                    from: address,
                    gasLimit: "0x200b20",
                });
                contract.methods.getParticularFile(dechash).call({
                    from: address,
                })
                    .then((res) => {
                        rows.push(res)
                    })
                const id = contract.methods.getFileIdByShareHash(dechash).call({
                    from: address
                })
                    .then(async (res) => {
                        const data = atob(res);
                        setId(res)
                        setOriginator(data.split("_")[2])
                        setOriginatorAddress(data.split("_")[3])
                        //     contract.methods.getAllTracibilityLogs(res).call({
                        //         from: address
                        //     })
                        //         .then((res) => {
                        //             allHash = res;
                        //             console.log(res.length)
                        //             for (let i = 0; i < res.length; i++) {
                        //                 contract.methods.getFileDetails(res[i]).call({
                        //                     from: address
                        //                 })
                        //                     .then((data) => {
                        //                         fileDetails.push(data)
                        //                     })
                        //             }
                        //         })
                        const opts = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                "fileId": res
                            }),
                        }
                        const response = await fetch(`${API_URL}/getallsharedfiles`, opts);
                        await response.json()
                            .then((res) => {
                                fileDetails = res.data;
                                setStatus(true)
                            })
                        // console.log(fileDetails)
                    })
            } catch (e) {
                console.log(e);
            }
        })()
    }, [fileDetails])
    try {
        if (dechash != "") {
            (async () => {
                // await fetch(`${API_URL}/getwallet`, opts)
                //     .then((response) => {
                //         response.json().then((result) => {
                //             if (result == "createwallet") {
                //                 return;
                //             }
                //             else {
                //                 ipfs.files.get(result)
                //                     .then((files) => {
                //                         const data1 = files[0].content.toString("binary");
                //                         let ewallet = {};
                //                         ewallet = JSON.stringify(data1);
                //                         wallet = JSON.parse(data1)
                //                     })
                //             }
                //         })
                //     }
                //     )

            })()
        }
        else {
            console.log("sorry")
        }
    }
    catch (e) {
        console.log(e)
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
        const currtime = Math.floor(Date.now() / 1000);
        try {
            if (currtime < rows[0].date) {
                const privateKey = document.getElementById("password").value;
                // console.log("privateKey",privateKey)
                if (privateKey != "") {
                    try {
                        const decPrivateKey = crypt.AES.decrypt(wallet.privatekey, privateKey).toString(crypt.enc.Utf8)
                        if (decPrivateKey.length > 0) {
                            const encryptedObject = EthCrypto.cipher.parse(rows[0].password);
                            const decrypted = await EthCrypto.decryptWithPrivateKey(
                                decPrivateKey,
                                encryptedObject
                            );
                            const decryptedPayload = JSON.parse(decrypted);
                            EthCrypto.recover(
                                decryptedPayload.signature,
                                EthCrypto.hash.keccak256(decryptedPayload.message)
                            );
                            await ipfs.files.get(dechash, async function (err, files) {
                                let decryptedData = files[0].content.toString("binary");
                                if (rows[0].extension == "text/xml") {
                                    let cryptfile = files[0].content.toString("binary");
                                    const opts = {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            "file": decryptedData,
                                            "password": decryptedPayload.message
                                        }),
                                    }
                                    const data = await fetch(`${API_URL}/showshareedifile`, opts);
                                    await data.json()
                                        .then((res) => {
                                            setLock(false)
                                            document.getElementById("did_data").innerHTML = res.file;
                                            console.log(res)
                                        })
                                    // let decrypted = crypt.AES.decrypt(files[0].content.toString("binary"), decPrivate);
                                    // console.log(files[0].content.toString("binary"))
                                    // const edidata = files[0].content.toString("binary");
                                    // const test = decrypted.toString();
                                    // console.log(decrypted)
                                    // setLock(false)
                                } else {
                                    setFile(true)
                                    Array.from(files).forEach((file) => {

                                        let decryptedData = crypt.AES.decrypt(file.content.toString("binary"), decryptedPayload.message);
                                        var typedArray = convertWordArrayToUint8Array(decryptedData);
                                        if (rows[0].extension == "application/wps-office.pdf") {
                                            var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: "application/pdf" }))
                                        }
                                        else if (rows[0].extension == "application/wps-office.docx") {
                                            var url1 = window.URL.createObjectURL(new Blob([typedArray], { type:  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }))
                                        }
                                        else if (hash[5] == "wps-office.doc") {
                                            var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: "application/msword" }));
                                        }
                                        else {
                                            var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: rows[0].extension }));
                                        }
                                        setUrl(url1)
                                        setLock(false)
                                    })
                                }
                            })
                        } else {
                            setError("your password may be wrong")
                        }
                    } catch (e) {
                        setError("something went wrong")
                        console.log(e)
                    }
                } else {
                    setError("please enter password");
                }
            } else {
                // console.log("date",rows[0].date)
                // console.log("time",currtime)
                setError("file expired")
            }

        } catch (e) {
            setError("soemething went wrong")
            console.log(e)
        }
    }
    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Recieved Files' },
                    ]}
                />
            </div>
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
            {file &&
                <iframe src={url}
                    style={{
                        width: "800px",
                        height: "800px",
                        marginLeft: "auto",
                        marginRight: "auto",
                        display: "block"
                    }}></iframe>
            }
            <div id="did_data"></div>
            <br></br>
            <h5>Tracibility Logs ({id})</h5>
            <hr
                style={{
                    color: "red",
                    backgroundColor: "red",
                    height: 2
                }}
            />
            <h2>
                <ul>
                    <li><b>File Originator : </b>{originator}</li>
                    <li><b>Originator Wallet Address : </b>{originatorAddress}</li>
                </ul>
            </h2>
            <hr
                style={{
                    color: "red",
                    backgroundColor: "red",
                    height: 2
                }}
            />
            {status && fileDetails && fileDetails.map((row, i) => (
                <div>
                    <hr
                        style={{
                            color: "red",
                            backgroundColor: "red",
                            height: 2
                        }}
                    />
                    <h4>
                        <ul>
                            <li>
                                From : {fileDetails[i].from}
                            </li>
                            <li>
                                Shared To : {fileDetails[i].to}
                            </li>
                            <li>
                                Shared Date : {fileDetails[i].created_date}
                            </li>
                        </ul>
                    </h4>
                    <hr
                        style={{
                            color: "red",
                            backgroundColor: "red",
                            height: 2
                        }}
                    />
                </div>
            ))}
        </div>
    );
}