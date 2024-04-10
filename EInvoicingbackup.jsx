import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles'
import { Breadcrumb } from 'app/components';
import { DropzoneArea } from 'material-ui-dropzone';
import { API_URL, INFURA_URL } from 'ServerConfig';
import { Button } from '@material-ui/core';
import GridItem from './filecomponents/DLTcomponents/Grid/GridItem';
import { CircularProgress } from '@material-ui/core';
import { new_ipfs, ipfs } from "./filecomponents/DLTcomponents/Web3/ipfs";
import GridContainer from "./filecomponents/DLTcomponents/Grid/GridContainer";
import CustomInput from './filecomponents/DLTcomponents/CustomInput/CustomInput';
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { KeyboardDateTimePicker } from "@material-ui/pickers";
import EthCrypto from 'eth-crypto'
import Snackbar from '@material-ui/core/Snackbar'
import WaitSnackbar from "./filecomponents/WaitSnackbar";
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Web3 from "web3";
import MySnackbarContentWrapper from './SnackbarComponent';
import crypt from "crypto-js";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from 'ServerConfig';
import Common from 'ethereumjs-common';
import {
    Checkbox,
    InputLabel,
    ListItemIcon,
    ListItemText,
    FormControl,
    Select
} from "@material-ui/core";
import Menu from '@material-ui/core/Menu'
import { MenuItem } from '@material-ui/core'
import {
    Grid
} from '@material-ui/core';
import { Icon } from "@material-ui/core";
import { Link } from "@material-ui/core";
import { Code } from '@material-ui/icons';
import { LibraryBooks, Photo, PictureAsPdf } from "@material-ui/icons";
import { MenuProps } from './filecomponents/utils';
import { StoreFiles, getFileMetadata } from './StoreDataDid';
import CreateProject from "./CreateProject"
import { getNonce } from 'app/views/material-kit/projecttest/web3Functions/Web3Functions';
const Tx = require("ethereumjs-tx").Transaction;

var globalNonce = 0;
var count = 0;
var sharecount = 0;
var contacts;
let rows = [];
let ediData = [];
let publicKey = [];
let username = [];
let recieverAddress = [];
let wallet;
const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));
const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1),
    },
    input: {
        display: 'none',
    },
    progress: {
        margin: theme.spacing(2),
    },
    thumb: {
        width: "150px",
        height: "150px"
    },
    innerthumb: {
        position: "absolute",
        marginTop: "105px",
        width: "150px",
        height: "44px"
    },
    folder: {
        marginTop: "-30px"
    },
    file: {
        width: "70px",
        fontSize: "12px",
        marginLeft: "10px",
        marginTop: "1px"
    },
    formControl: {
        width: 300
    },
    indeterminateColor: {
        color: "#f50057"
    },
    selectAllText: {
        fontWeight: 500
    },
    selectedAll: {
        backgroundColor: "rgba(0, 0, 0, 0.08)",
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.08)"
        }
    },
    productTable: {
        '& small': {
            height: 15,
            width: 600,
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

export default function EInvoicing(props) {
    const classes = useStyles()
    const propdata = props.location.pathname.split("/");
    const projectname = propdata[2];
    const [status, setStatus] = useState(true);
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [currentHash, setCurrentHash] = useState(null)
    const [currentExt, setCurrentExt] = useState(null)
    const [dateTime, setDateTime] = useState(null);
    const [hash, setHash] = useState(null);
    const [ext, setExt] = useState(null);
    const [filename, setFilename] = useState(null);
    const [share, setShare] = useState(false);
    const [grid, setGrid] = useState(true);
    const [file, setFile] = useState({ files: [] });
    const [upload, setUpload] = useState(true);
    const [open, setOpen] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [selectedDate, setSelectedDate] = React.useState(Date.now());
    const [selected, setSelected] = useState([]);
    const [shareStatus, setShareStatus] = useState(false);

    const selectView = (value) => {
        if (value === "grid")
            setGrid(true);
        else setGrid(false);
    }

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
    function handleShareOpen(hash, ext, file) {
        setShare(true)
    }
    const handleMenuClick = (event, hash, ext, file) => {
        setCurrentHash(hash)
        setCurrentExt(ext)
        setFilename(file)
        setHash(hash)
        setExt(ext)
        setAnchorEl(event.currentTarget)
    }
    function handleMenuClose() {
        setAnchorEl(null)
    }

    function handleClose() {
        setOpen(false)
    }
    function handleShareClose() {
        setShare(false)
    }
    const handleCheckChange = (event) => {
        try {
            const value = event.target.value;
            setSelected(value);
            publicKey.push(contacts.contacts[value].publicKey)
            username.push(contacts.contacts[value].username)
            recieverAddress.push(contacts.contacts[value].address)
        } catch (e) {
            setError("something went wrong")
        }
    };
    const handleDateChange = (date) => {
        const timestamp = new Date(Date.parse(date)).getTime() / 1000;
        setDateTime(timestamp)
        setSelectedDate(date);
    };

    useEffect(() => {
        (async () => {
            // fetch(`${API_URL}/getwallet`, opts)
            //     .then((response) => {
            //         console.log(response)
            //         response.json().then(async (result) => {
            //             if (result === "createwallet") {
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
            //                     .catch((e) => {
            //                         console.log(e)
            //                     })
            //             }
            try {
                // const storedWallet = await getStoredWallet(localStorage.getItem("wallet_did"));
                // const userWallet = JSON.parse(storedWallet)
                // console.log(storedWallet)
                // wallet = userWallet;
                // getFilehash();
                if (localStorage.getItem("did_data") === null || localStorage.getItem("did_data") === "empty" || localStorage.getItem("did_data") === undefined) {
                    setError("please create wallet first !")
                } else {
                    const data = JSON.parse(localStorage.getItem("did_data"));
                    if (data.wallet === null || data.wallet === undefined || data === "empty") {
                        setError("please create wallet first !")
                    } else {
                        wallet = data.wallet;
                        getFilehash();
                    }
                }
            } catch (e) {
                console.log(e)
            }
            //     const response = await fetch(`${API_URL}/contactlist`, opts)
            //     await response.json()
            //         .then((response) => {
            //             contacts = response
            //             console.log(response)
            //         })
            //         .catch((e) => {
            //             console.log(e)
            //         })
            //     try {
            //         getFilehash()
            //     } catch (e) {

            //     }
            // })
            //     .catch((e) => {
            //         console.log(e)
            //     })
        })()
    }, [rows])
    const sendTransaction = async (serializedTx, length) => {
        return web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    }

    const shareFile = async () => {
        setAnchorEl(null)
        globalNonce = await getNonce(wallet.walletaddress)
        const randompassword = Math.random().toString(36).substring(2, 7);
        const walletpassword = document.getElementById("walletpassword").value;
        const comment = document.getElementById("comment").value;
        if (walletpassword === "" || comment === "" || dateTime === null) {
            setError("please fill all details");
        }
        else {
            setShareStatus(true);
            setShare(false)
            try {
                const decPrivate = crypt.AES.decrypt(wallet.privatekey, walletpassword).toString(crypt.enc.Utf8);
                if (decPrivate.length > 0) {
                    const privateKey = Buffer.from(decPrivate.slice(2), 'hex');
                    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                        from: wallet.walletaddress,
                        gasLimit: "0x200b20",
                    });

                    for (let i = 0; i < recieverAddress.length; i++) {
                        new_ipfs.files.get(hash, (err, files) => {
                            Array.from(files).forEach((file) => {
                                let decryptedData = crypt.AES.decrypt(file.content.toString("binary"), decPrivate);
                                var encrypted = crypt.AES.encrypt(decryptedData, "" + randompassword).toString();
                                const bufferData = Buffer.from("" + encrypted);
                                new_ipfs.add(bufferData, async (err, ipfshash) => {
                                    const signature = EthCrypto.sign(
                                        decPrivate,
                                        EthCrypto.hash.keccak256("" + randompassword)
                                    );
                                    const payload = {
                                        message: randompassword,
                                        signature
                                    };
                                    const res = await EthCrypto.encryptWithPublicKey(
                                        publicKey[i],
                                        JSON.stringify(payload)
                                    )
                                    const encryptedPass = EthCrypto.cipher.stringify(res);
                                    const currtime = Math.round(new Date().getTime() / 1000);
                                    console.log("currtime", currtime)
                                    const common = Common.forCustomChain(1, {
                                        name: 'bnb',
                                        networkId: 97,
                                        chainId: 97
                                    }, 'petersburg');

                                    const contractFunction = contract.methods.shareFile(
                                        recieverAddress[i],
                                        ipfshash[0].hash
                                        , encryptedPass,
                                        "" + dateTime,
                                        "" + currtime,
                                        selected[i],
                                        localStorage.getItem("userEmail"),
                                        filename,
                                        wallet.walletaddress
                                        , comment,
                                        ext);
                                    const functionAbi = contractFunction.encodeABI();
                                    const txParams = {
                                        nonce: globalNonce++,
                                        gasPrice: "0x4a817c800",
                                        gasLimit: "0x200b20",//2100000, //50000,
                                        to: CONTRACT_ADDRESS,
                                        data: functionAbi,
                                        value: "0x00",
                                        from: wallet.walletaddress
                                    };
                                    const tx = new Tx(txParams, { common });
                                    tx.sign(privateKey); // Transaction Signing here
                                    const serializedTx = tx.serialize();
                                    await sendTransaction(serializedTx, recieverAddress.length)
                                        .then((res) => {
                                            console.log(res)
                                            console.log(recieverAddress[i])
                                            console.log(selected[i])
                                            sharecount++;
                                            const data = {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({
                                                    "from": localStorage.getItem("userEmail"),
                                                    "username": username[i],
                                                    "to": selected[i],
                                                }),
                                            }
                                            if (sharecount === recieverAddress.length) {
                                                setSuccess("File Shared Successfully!!")
                                                setShareStatus(false)
                                                sharecount = 0;
                                            }
                                            fetch(`${API_URL}/setShare`, data)
                                                .then((res) => {
                                                    console.log(res)
                                                })
                                                .catch((e) => {
                                                    console.log(e)
                                                })

                                        })
                                        .catch((err) => {
                                            setError("Insuffient funds")
                                            setShareStatus(false)
                                            console.log(err)
                                        })
                                });

                            })
                        })

                    }
                } else {
                    setShareStatus(false)
                    setError("your password may be wrong")
                }
            } catch (e) {
                setShareStatus(false)
                setError("something went wrong")

            }
        }

    }

    const getFilehash = async (hash, i) => {
        // const response = await fetch(`${API_URL}/getfilehash`, opts)
        const filehash = JSON.parse(await getFileMetadata());
        setTimeout(function () {
            try {
                if (filehash && filehash.business[projectname]) {
                    Object.keys(filehash.business[projectname]).map((key, i) => {
                        const hash = filehash.business[projectname][key];
                        (async function () {
                            try {
                                const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                                    from: wallet.walletaddress,
                                    gasLimit: "0x200b20",
                                });
                                await contract.methods.getFileMetaData(hash).call({
                                    from: wallet.walletaddress,
                                })
                                    .then((res) => {
                                        rows.push(res);
                                        console.log(rows)
                                    })
                                    .catch((err) => {
                                        console.log(err)
                                    })
                            } catch (e) {
                                console.log(e)
                            }
                        })()
                    })
                }
            } catch (e) {
                console.log(e)
            }
            setTimeout(function () {
                setStatus(false)
            }, 1000)
        }, 2000)
    }

    const setMetaData = async (decPrivate, name, type, address, hash) => {
        try {
            console.log("_glononce", globalNonce);
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                from: address,
                gasLimit: "0x200b20",
            });
            const common = Common.forCustomChain(1, {
                name: 'bnb',
                networkId: 97,
                chainId: 97
            }, 'petersburg');
            const currtime = Math.round(new Date().getTime() / 1000);
            console.log(currtime)
            const privateKey = Buffer.from(decPrivate.slice(2), 'hex');
            console.log(name)
            console.log(type)
            const contractFunction = contract.methods.addFileMetaData(name
                , type, address,
                projectname + currtime,
                hash, "", localStorage.getItem("userName"));
            console.log("checkmethods")

            const functionAbi = await contractFunction.encodeABI();
            const txParams = {
                nonce: globalNonce,
                gasPrice: "0x4a817c800",
                gasLimit: "0x67c280",//0x200b20, //50000,
                to: CONTRACT_ADDRESS,
                data: functionAbi,
                value: "0x00",
                from: address
            };
            console.log("checktx")
            const tx = new Tx(txParams, { common });
            console.log("tx", tx)
            tx.sign(privateKey); // Transaction Signing here
            const serializedTx = tx.serialize();
            console.log("serializedTx", serializedTx)
            return web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', receipt => {
                count++;
                console.log(receipt)
                StoreFiles(hash, projectname)
                if (count === Object.keys(file.files).length) {
                    setUpload(false)
                    count = 0;
                    setOpen(false)
                    document.getElementById("progress").style.display = "none";
                    setSuccess("File uploaded successfully")
                }
            })
        } catch (e) {
            console.log(e)
            setError("something went wrong")
            setUpload(true)

        }
    }
    const uploadToIpfs = async (password) => {
        const decPrivate = crypt.AES.decrypt(wallet.privatekey, password).toString(crypt.enc.Utf8);
        if (decPrivate.length <= 0) {
            setError("your password may be wrong")
        } else {
            setOpen(false);
            for (let i = 0; i < ediData.length; i++) {
                try {
                    const opts = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "data": ediData[i],
                            "password": decPrivate
                        }),
                    }
                    alert("check")
                    const res = await fetch(`${API_URL}/encedidata`, opts)
                    const resData = await res.json();
                    if (resData.status === "OK") {

                    } else {

                    }
                    // console.log(ediData[i])
                    // var wordArray = crypt.lib.WordArray.create(ediData[i]);
                    // var encrypted = crypt.AES.encrypt(wordArray, "" + decPrivate).toString();
                    // console.log(i)
                    // convertToBuffer(encrypted, decPrivate, file.files[i].name, file.files[i].type);
                } catch (err) {
                    setUpload(true)
                    console.log(err)
                    setError("something went wrong")
                    return;
                }
            }
        }
    }
    const convertToBuffer = async (data, decPrivate, name, type) => {
        console.log("data", data)
        const bufferData = await Buffer.from("" + data);
        // const opts = {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         "data": data,
        //     }),
        // }
        // const res = await fetch(`${API_URL}/storeedifile`, opts)
        // const resData = await res.json();
        // if (resData.status === "OK") {

        // } else {

        // }
        await ipfs.add(bufferData, (err, ipfshash) => {
            if (err) {
                setUpload(true)
                console.log(err)
                //alert("please select valid file")
                setError("something went wrong")
                return;
            }
            else {
                console.log(ipfshash[0].hash)
                const data = setMetaData(decPrivate, name, type, wallet.walletaddress,
                    ipfshash[0].hash
                )
                    .then((res) => {
                        (async () => {
                            const opts = {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    "hash": ipfshash[0].hash,
                                    "username": localStorage.getItem("userName"),
                                    "email": localStorage.getItem("userEmail"),
                                    "project": projectname,
                                    "file": ipfshash[0].hash,
                                    "B2B": "business",
                                }),
                            }
                            await fetch(`${API_URL}/setfilehash`, opts);
                        })()
                    })
                    .catch((e) => {
                        console.log(e)
                        setUpload(true)
                        setError("something went wrong")

                    })

                // console.log("calling setmetadata for i =" + (count++))
            }

        })
    }

    function handleClose() {
        setOpen(false)
    }
    function handleSnackbarClose(event, reason) {
        if (reason === 'clickaway') {
            return
        }
        setSuccess(null)
    }
    function handleErrorClose(event, reason) {
        setError(null)
    }

    const uploadAction = async () => {
        const filepassword = document.getElementById("password").value;
        if (Object.keys(file.files).length <= 0 || filepassword === "") {
            setError("please enter password")
        } else {
            setUpload(false)
            globalNonce = await getNonce(wallet.walletaddress)
            uploadToIpfs(filepassword);
        }
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


    const convertXmlToEdi = async () => {
        setOpen(true)
        for (let i = 0; i < Object.keys(file.files).length; i++) {
            (function (file) {
                console.log(file)
                var reader = new FileReader();
                console.log(reader)
                reader.onload = async () => {
                    try {
                        const data = reader.result;
                        const opts = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                "data": data
                            }),
                        }
                        const response = await fetch(`${API_URL}/convertxmltoedi`, opts);
                        const resData = await response.json();
                        console.log(resData)
                        if (resData) {
                            ediData.push(resData.edidata)
                            console.log(resData.edidata)
                        }
                        // let header = new Headers();
                        // header.append("Origin", "*")
                        // var urlencoded = new URLSearchParams();
                        // urlencoded.append("method", "POST")
                        // urlencoded.append("origin", "http://localhost:3001")
                        // urlencoded.append("appname", "IFSedi2xml_api")
                        // urlencoded.append("prgname", "HTTP")
                        // urlencoded.append("arguments", "-AHTTPService#X12")
                        // urlencoded.append("api_key", "020000004B818EAD85B67E5288BFCDD0E1AE22B38BD5019896A30BBBC8C3D3B934EACDC79EF924269ADC1CE30E73D031A15C6D466113EF023773E5D79CE3F2DFE08227FA")
                        // urlencoded.append("api_pswd", "616156")
                        // urlencoded.append("api_request", reader.result)
                        // var requestOptions = {
                        //     method: 'POST',
                        //     headers: header,
                        //     body: urlencoded,
                        //     redirect: 'follow'
                        // };

                        // var options = {
                        //     form: {
                        //         'appname': 'IFSedi2xml_api',
                        //         'prgname': 'HTTP',
                        //         'arguments': '-AHTTPService#X12',
                        //         'api_key': '020000004B818EAD85B67E5288BFCDD0E1AE22B38BD5019896A30BBBC8C3D3B934EACDC79EF924269ADC1CE30E73D031A15C6D466113EF023773E5D79CE3F2DFE08227FA',
                        //         'api_pswd': '616156',
                        //         'api_request': reader.result
                        //     }
                        // }
                        // await fetch("https://api.edi2xml.com/iBolt32/MGrqispi.dll", {
                        //     method: 'POST', // *GET, POST, PUT, DELETE, etc.
                        //     mode: 'cors', // no-cors, *cors, same-origin
                        //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        //     credentials: 'same-origin', // include, *same-origin, omit
                        //     headers: {
                        //         'Content-Type': 'application/x-www-form-urlencoded',
                        //         'Access-Control-Allow-Origin': '*'
                        //     },
                        //     redirect: 'follow', // manual, *follow, error
                        //     referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                        //     body: JSON.stringify(options) // body data type must match "Content-Type" header
                        // })
                        //     .then((res) => {
                        //         console.log(res)
                        //     })
                        //     .catch((e) => {
                        //         console.log(e)
                        //     })

                    } catch (err) {
                        console.log(err)
                        return;
                    }
                }
                reader.readAsText(file);
            })(file.files[i]);
        }
    }

    function handleFileChange(files) {
        setFile({
            files: files
        });
    }
    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb
                    routeSegments={[
                        { name: 'E invoicing' },
                    ]}
                />
            </div>
            <CreateProject
                data="B2B"
            ></CreateProject>
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
                onClose={handleErrorClose}
            >
                <MySnackbarContentWrapper
                    onClose={handleErrorClose}
                    variant="error"
                    message={error}
                />
            </Snackbar>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Wallet Password</DialogTitle>
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
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => uploadAction()} color="primary"
                    >
                        Submit
                    </Button>

                </DialogActions>
            </Dialog>
            <Dialog
                open={share}
                onClose={handleShareClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Share File</DialogTitle>
                <DialogContent>
                    <FormControl className={classes.formControl}>
                        <InputLabel id="mutiple-select-label">Choose contacts</InputLabel>
                        <Select
                            labelId="mutiple-select-label"
                            multiple
                            value={selected}
                            onChange={handleCheckChange}
                            renderValue={(selected) => selected.join(", ")}
                            MenuProps={MenuProps}
                        >
                            {contacts && Object.keys(contacts.contacts).map((row, i) => (
                                contacts.contacts[row]["email"] != localStorage.getItem("userEmail") &&
                                <MenuItem key={row} value={contacts.contacts[row]["email"]}>
                                    <ListItemIcon>
                                        <Checkbox checked={selected.indexOf(contacts.contacts[row]["email"]) > -1} />
                                    </ListItemIcon>
                                    <ListItemText primary={contacts.contacts[row]["email"]} />
                                </MenuItem>
                            ))}

                        </Select>
                    </FormControl>
                    <br></br>
                    <br></br>
                    <GridContainer>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <GridItem>
                                <KeyboardDateTimePicker
                                    key={selectedDate}
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    label="Date Time picker"
                                    minDate={new Date("2018-01-01T00:00")}
                                    format="yyyy/MM/dd hh:mm a"
                                />
                            </GridItem>
                        </MuiPickersUtilsProvider>
                        <GridItem>
                            <CustomInput
                                labelText="wallet password"
                                id="walletpassword"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    type: "password",
                                }}
                            />
                        </GridItem>
                        <GridItem>
                            <CustomInput
                                labelText="comment"
                                id="comment"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    type: "text",
                                }}
                            />
                        </GridItem>
                    </GridContainer>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleShareClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => shareFile()} color="primary"
                    >
                        Share
                    </Button>
                </DialogActions>
            </Dialog>

            <DropzoneArea
                onChange={handleFileChange}
            />
            <GridItem>
                {!upload && count != Object.keys(file.files).length &&
                    <div id="progress">
                        <center>
                            <CircularProgress />
                        </center>
                        <WaitSnackbar
                            message={"please wait while file not upload"}
                        ></WaitSnackbar>
                    </div>
                }
            </GridItem>
            <br /><br /><br />
            <center>
                <Button
                    className="capitalize"
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={!upload || Object.keys(file.files).length <= 0}
                    onClick={() => convertXmlToEdi()}
                >
                    Upload file
                </Button>
            </center>
            {status ?
                <div>
                    <center>
                        <CircularProgress className={classes.progress} />
                    </center>
                </div>
                :
                <div>
                    <br /><br /><br />
                    <div>
                        <h3>Files</h3>
                        <Select size="small" defaultValue="grid" disableUnderline
                            style={{ float: "right", border: "1px solid" }}
                        >
                            <MenuItem value="grid" onClick={() => selectView("grid")}>Grid view</MenuItem>
                            <MenuItem value="list" onClick={() => selectView("list")}>List view</MenuItem>
                        </Select>
                    </div>
                    <br />
                    <Grid container spacing={2}>
                        {
                            rows && rows.map((key, i) => (
                                <Grid item md={2} key={i}>
                                    <Button
                                        className={classes.thumb}
                                        variant="outlined"
                                        color="primary"
                                    //onClick={}
                                    >
                                        <div>
                                            {
                                                (rows[i].fileExt === "image/jpg" || rows[i].fileExt === "image/png"
                                                    || rows[i].fileExt === "image/jpeg" ||
                                                    rows[i].fileExt === "image/gif")
                                                    ?
                                                    <Photo></Photo>
                                                    :
                                                    (rows[i].fileExt === "text/plain")
                                                        ?
                                                        <LibraryBooks></LibraryBooks>
                                                        :
                                                        (rows[i].fileExt === "application/pdf")
                                                            ?
                                                            <PictureAsPdf></PictureAsPdf>
                                                            :
                                                            (rows[i].fileExt === "text/xml")
                                                                ?
                                                                <Code></Code>
                                                                :
                                                                "other"
                                            }
                                        </div>
                                        <Button
                                            className={classes.innerthumb}
                                            variant="outlined"
                                            color="primary"
                                        >
                                            {rows[i].fileName.length > 10 ?
                                                <span className={classes.file}>{`${rows[i].fileName.substring(0, 9)}...`}</span>
                                                :
                                                <span className={classes.file}>{rows[i].fileName}</span>
                                            }
                                        </Button>
                                        <>
                                            <Icon style={{
                                                position: "absolute",
                                                marginLeft: "110px",
                                                marginTop: "-100px"
                                            }}
                                                variant="outlined"
                                                aria-owns={anchorEl ? 'simple-menu' : undefined}
                                                aria-haspopup="true"
                                                onClick={(e) => handleMenuClick(e, rows[i].hash, rows[i].fileExt, rows[i].fileName)}
                                            >more_vert</Icon>
                                            <Menu
                                                id="simple-menu"
                                                anchorEl={anchorEl}
                                                open={Boolean(anchorEl)}
                                                onClose={handleMenuClose}
                                                style={{ marginLeft: "-60px", marginTop: "16px" }}
                                            >
                                                <Link
                                                    href={`/project/showowner/${Buffer.from("" + currentHash).toString('base64')}/${currentExt}`}
                                                    target="_"
                                                    style={{ textDecoration: "initial", color: "inherit" }}

                                                >
                                                    <MenuItem>Open</MenuItem>
                                                </Link>
                                                <MenuItem onClick={() => handleShareOpen(hash, ext, filename)}>Share</MenuItem>
                                                <MenuItem onClick={() => handleClose()}>Delete</MenuItem>
                                            </Menu>
                                        </>
                                    </Button>
                                </Grid>

                            ))
                        }
                    </Grid>
                </div>
            }
        </div>
    );
}