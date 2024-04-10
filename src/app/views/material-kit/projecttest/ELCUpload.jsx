import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles'
import { Breadcrumb } from 'app/components';
import { DropzoneArea } from 'material-ui-dropzone';
import { API_URL, INFURA_URL } from 'ServerConfig';
import { Button } from '@material-ui/core';
import GridItem from './filecomponents/DLTcomponents/Grid/GridItem';
import { CircularProgress } from '@material-ui/core';
import { ipfs } from "./filecomponents/DLTcomponents/Web3/ipfs";
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
import { CONTRACT_ADDRESS, CONTRACT_ABI, PINATA_API_KEY, PINATA_SECRET_KEY, COMMON } from 'ServerConfig';
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
import { StoreFiles, getFileMetadata, getAllDIDData } from './StoreDataDid';
import history from 'history.js'
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@material-ui/core'
import clsx from 'clsx'
import pinataSDK from '@pinata/sdk';
import { getNonce } from './web3Functions/Web3Functions';
const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY);

const Tx = require("ethereumjs-tx").Transaction;

let globalNonce = 0;
let count = 0;
let sharecount = 0;
let contacts;
let rows = [];
let ediData = [];
let allHash = [];
let storeHash = [];
let wallet;

/**
 * instantiate web3 object
 */
const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));
const common = COMMON;
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

export default function ELCUpload(props) {
    const classes = useStyles()
    /**
     * read the projectname from url
     */
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
    const [uploadFileId, setUploadFileId] = useState(null)
    const [selectedDate, setSelectedDate] = React.useState(Date.now());
    const [selected, setSelected] = useState([]);
    const [shareStatus, setShareStatus] = useState(false);
    const [expire, setExpire] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(false);

    /**
     * function to handle success snackbar actions
     */
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
    /**
     * function to handle when user,
     * add or remove file from drag n drop
     */
    function handleFileChange(files) {
        setFile({
            files: files
        });
    }
    /**
    * handle share menu
    */
    function handleShareOpen(hash, ext, file) {
        setShare(true)
    }
    /**
     * when user click on file menu
     */
    const handleMenuClick = (event, hash, ext, file) => {
        getFileId(hash)
        setCurrentHash(hash)
        setCurrentExt(ext)
        setFilename(file)
        setHash(hash)
        setExt(ext)
        setAnchorEl(event.currentTarget)
    }
    /**
    * function to close the file menu
    */
    function handleMenuClose() {
        setAnchorEl(null)
    }
    function handleClose() {
        setOpen(false)
    }
    function handleShareClose() {
        setShare(false)
    }
    /**
     * function to handle all reciever contact at the 
     * time of File share
     */
    const handleCheckChange = (event) => {
        try {
            const value = event.target.value;
            setSelected(value);
        } catch (e) {
            setError("something went wrong")
        }
    };
    /**
     * function to handle when user change
     * File view or Grid view
     */
    const selectView = (value) => {
        if (value === "grid")
            setGrid(true);
        else setGrid(false);
    }
    /**
     * function to handle the date when user,
     * change the date
     */
    const handleDateChange = (date) => {
        const timestamp = new Date(Date.parse(date)).getTime() / 1000;
        setDateTime(timestamp)
        setSelectedDate(date);
    };

    useEffect(() => {
        (async () => {
            try {
                /**
                 * function to get walletData from curent user DID
                 */
                getWalletData();
                const metadata = await getFileMetadata();
                if (metadata === "empty")
                    setStatus(false)
                const files = JSON.parse(metadata)
                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "email": localStorage.getItem("userEmail"),
                    }),
                }

                /**
                 * check user subscription status
                 */
                const res = await fetch(`${API_URL}/getsubscriptionstatus`, opts);
                await res.json()
                    .then((res) => {
                        var date_ob = new Date();
                        var day = ("0" + date_ob.getDate()).slice(-2);
                        var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                        var year = date_ob.getFullYear();
                        var hours = date_ob.getHours();
                        var minutes = date_ob.getMinutes();
                        var seconds = date_ob.getSeconds();
                        var startDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                        const data = JSON.parse(res.result)
                        if (Object.keys(data).length < 1) {
                            history.push("/subscription")
                        } else if ((data[0].plan === "sandbox" && Object.keys(files).length >= 10) ||
                            new Date(startDate).getTime() > new Date(data[0].sub_end_date).getTime()) {
                            setError("Your free subscription plan has been expired")
                            setExpire(true)
                        } else if ((data[0].plan === "bronze" && Object.keys(files).length >= 100) ||
                            new Date(startDate).getTime() > new Date(data[0].sub_end_date).getTime()) {
                            setError("Your bronze subscription plan has been expired")
                            setExpire(true)
                        }
                        else if ((data[0].plan === "silver" && Object.keys(files).length >= 200) ||
                            new Date(startDate).getTime() > new Date(data[0].sub_end_date).getTime()) {
                            setError("Your silver subscription plan has been expired")
                            setExpire(true)
                        }
                        else if ((data[0].plan === "gold" && Object.keys(files).length >= 500) ||
                            new Date(startDate).getTime() > new Date(data[0].sub_end_date).getTime()) {
                            setError("Your gold subscription plan has been expired")
                            setExpire(true)
                        }
                    })
            } catch (e) {
                console.log(e)
            }
        })()
    }, [rows])

    const getWalletData = async () => {
        if (localStorage.getItem("did_data") === null || localStorage.getItem("did_data") === undefined) {
            const data = await getAllDIDData();
            localStorage.setItem("did_data", data)
            setStatus(false)
        } else {
            const data = JSON.parse(localStorage.getItem("did_data"));
            wallet = data.wallet;
            contacts = data.contact;
            getFilehash()
            await getAllDIDData();
        }
    }
    /**
     * function to get user fileId from blockchain,
     * when user click on file menu
     */
    const getFileId = async (hash) => {
        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
            from: wallet.walletaddress,
            gasLimit: "0x200b20",
        });
        const id = await contract.methods.getFileIdByUploadHash(hash).call({
            from: wallet.walletaddress,
        })
        setUploadFileId(id)
    }

    /**
     * this function will call from shareFile(),
     * for send Transaction on blockchain
     */
    const sendTransaction = async (serializedTx, length) => {
        return web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    }
    /**
     * shareFile() will be call when user click on
     * share menu
     */
    const shareFile = async () => {
        setAnchorEl(null)
        globalNonce = await getNonce(wallet.walletaddress)
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
                    for (let i = 0; i < selected.length; i++) {
                        const randompassword = Math.random().toString(36).substring(2, 7);
                        ipfs.files.get(hash, async (err, files) => {
                            let cryptfile = files[0].content.toString("binary");
                            console.log(cryptfile)
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
                                .then(async (res) => {
                                    console.log(res)
                                    const encryptopts = {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            "file": res.file,
                                            "password": randompassword
                                        }),
                                    }
                                    const response = await fetch(`${API_URL}/encryptshareedidata`, encryptopts);
                                    await response.json()
                                        .then((res) => {
                                            const bufferData = Buffer.from("" + res.file);
                                            ipfs.add(bufferData, async (err, ipfshash) => {
                                                await pinata.pinByHash(ipfshash[0].hash)
                                                    .then(async (result) => {
                                                        const signature = EthCrypto.sign(
                                                            decPrivate,
                                                            EthCrypto.hash.keccak256("" + randompassword)
                                                        );
                                                        const payload = {
                                                            message: randompassword,
                                                            signature
                                                        };
                                                        const res = await EthCrypto.encryptWithPublicKey(
                                                            contacts[selected[i]].publickey,
                                                            JSON.stringify(payload)
                                                        )
                                                        const encryptedPass = EthCrypto.cipher.stringify(res);
                                                        const currtime = Math.round(new Date().getTime() / 1000);
                                                        console.log("currtime", currtime)

                                                        const contractFunction = contract.methods.shareFile(
                                                            uploadFileId,
                                                            contacts[selected[i]].address,
                                                            ipfshash[0].hash
                                                            , encryptedPass,
                                                            "" + dateTime,
                                                            "" + currtime,
                                                            selected[i],
                                                            localStorage.getItem("userEmail"),
                                                            filename
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
                                                        await sendTransaction(serializedTx, selected.length)
                                                            .then((res) => {
                                                                sharecount++;
                                                                if (sharecount === selected.length) {
                                                                    setSuccess("File Shared Successfully!!")
                                                                    setShareStatus(false)
                                                                    sharecount = 0;
                                                                }
                                                            })
                                                            .catch((err) => {
                                                                setError("Insuffient funds")
                                                                setShareStatus(false)
                                                                console.log(err)
                                                            })
                                                    });
                                            })

                                        })
                                })
                        })
                    }
                } else {
                    setShareStatus(false)
                    setError("your password may be wrong")
                }
            } catch (e) {
                console.log(e)
                setShareStatus(false)
                setError("something went wrong")
            }
        }
    }
    /**
     * function to get all FileHash from blockchain,
     * which is uploaded by user
     */
    const getFilehash = async (hash, i) => {
        const filehash = JSON.parse(localStorage.getItem("did_data"))
        try {
            if (filehash.files && filehash.files[projectname]) {
                Object.keys(filehash.files[projectname]).map((key, i) => {
                    const hash = filehash.files[projectname][key];
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
            setTimeout(function () {
                setStatus(false)
            }, 4000)
        } catch (e) {
            console.log(e)
        }
    }
    /**
     * after file upload on ipfs it will call,
     * for write file metadata in blockchain
     */
    const setMetaData = async (decPrivate, name, type, address, hash, loopIndex) => {
        try {
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                from: address,
                gasLimit: "0x200b20",
            });

            const currtime = Math.round(new Date().getTime() / 1000);
            const privateKey = Buffer.from(decPrivate.slice(2), 'hex');
            const fileId = btoa(loopIndex + "_" + currtime + "_" + localStorage.getItem("userEmail") + "_" + wallet.walletaddress);
            const contractFunction = contract.methods.addFileMetaData(
                fileId,
                name,
                type,
                address,
                currtime,
                hash,
                projectname,
                localStorage.getItem("userName")
            );
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
            const tx = new Tx(txParams, { common });
            tx.sign(privateKey); // Transaction Signing here
            const serializedTx = tx.serialize();
            return web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', async (receipt) => {
                count++;
                storeHash.push(hash)
                /**
                 * StoreFiles will be call after file metadata,
                 * successfully wirt in blockchain and it will store
                 * hash and projectname in DID
                 */
                for (let i = 0; i < storeHash.length; i++) {
                    await StoreFiles(storeHash[i], projectname, address)
                }
                if (count === Object.keys(file.files).length) {
                    setUpload(true)
                    count = 0;
                    setUploadStatus(true)
                    allHash.push(hash)
                    setOpen(false)
                    setSuccess("File uploaded successfully")
                }
            })
        } catch (e) {
            console.log(e)
            setError("something went wrong")
            setUpload(true)
        }
    }

    /**
     * function to read file data by filereader
     * and encrypted file data and store on ipfs
     */
    const uploadToIpfs = async (password) => {
        globalNonce = await getNonce(wallet.walletaddress)
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
                    const res = await fetch(`${API_URL}/encedidata`, opts)
                    const resData = await res.json();
                    if (resData) {
                        convertToBuffer(i, resData.file, decPrivate, file.files[i].name, file.files[i].type);
                    }
                } catch (err) {
                    setUpload(true)
                    console.log(err)
                    setError("something went wrong")
                    return;
                }
            }
        }
    }

    const convertToBuffer = async (i, data, decPrivate, name, type) => {
        const bufferData = Buffer.from("" + data);
        await ipfs.add(bufferData, async (err, ipfshash) => {
            if (err) {
                setUpload(true)
                setError("something went wrong")
                return;
            }
            else {
                await pinata.pinByHash(ipfshash[0].hash)
                    .then((res) => {
                        setMetaData(decPrivate, name, type, wallet.walletaddress,
                            ipfshash[0].hash, i
                        )
                            .then((res) => {
                            })
                            .catch((e) => {
                                console.log(e)
                                setUpload(true)
                                setError("something went wrong")

                            })
                    })
            }

        })
    }

    /**
     * initially,when user click on upload button
     * then it will call
     */
    const uploadAction = async () => {
        const filepassword = document.getElementById("password").value;
        if (Object.keys(file.files).length <= 0 || filepassword === "") {
            setError("please enter password")
        } else {
            setUpload(false)
            uploadToIpfs(filepassword);
        }
    }

    /**
     * function to call api for convert XML
     * data into EDI format
     */
    const convertXmlToEdi = async () => {
        setOpen(true)
        for (let i = 0; i < Object.keys(file.files).length; i++) {
            (function (file) {
                var reader = new FileReader();
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
                        if (resData) {
                            ediData.push(resData.edidata)
                        }
                    } catch (err) {
                        console.log(err)
                        return;
                    }
                }
                reader.readAsText(file);
            })(file.files[i]);
        }
    }


    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb
                    routeSegments={[
                        { name: <div id="upload-crumb">{projectname}</div>, path: '/e-LC', pathname: projectname },
                        { name: 'ELC Doc upload' },
                    ]}
                />
            </div>
            {expire ?
                <div>
                    <center>
                        <h3>Your free plan has been expired please subscribe with any plan</h3>
                    </center>
                </div>
                :
                <div>
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
                            <Grid item>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="id"
                                    label="File Id"
                                    type="text"
                                    value={uploadFileId}
                                    fullWidth
                                    aria-readonly="true"
                                    color="primary"
                                />
                            </Grid>
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
                                    {contacts && Object.keys(contacts).map((row, i) => (
                                        <MenuItem key={row} value={row}>
                                            <ListItemIcon>
                                                <Checkbox checked={selected.indexOf(row) > -1}></Checkbox>
                                            </ListItemIcon>
                                            <ListItemText primary={row} />
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
                            <div>
                                <center>
                                    <CircularProgress />
                                </center>
                                <WaitSnackbar
                                    message={"please wait while file not upload"}
                                ></WaitSnackbar>
                            </div>
                        }
                        {
                            shareStatus ?
                                <div>
                                    <center>
                                        <CircularProgress className={classes.progress} />
                                    </center>
                                    <WaitSnackbar
                                        message={"please wait while file not share"}
                                    ></WaitSnackbar>
                                </div>
                                :
                                ""
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
                                {grid ?
                                    rows && rows.map((key, i) => (
                                        <Grid item md={2} key={i}>
                                            <Button
                                                className={classes.thumb}
                                                variant="outlined"
                                                color="primary"
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
                                    :
                                    <Table
                                        className={clsx(
                                            'whitespace-pre min-w-800',
                                            classes.productTable
                                        )}
                                    >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell className="px-6" colSpan={2}>
                                                    SNo.
                                                </TableCell>
                                                <TableCell className="px-0" colSpan={2}>
                                                    Type
                                                </TableCell>
                                                <TableCell className="px-0" colSpan={2}>
                                                    File Name
                                                </TableCell>
                                                <TableCell className="px-0" colSpan={2}>
                                                    Action
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows && rows.map((row, i) =>
                                                <TableRow key={i} hover>
                                                    <TableCell
                                                        className="px-0 capitalize"
                                                        align="left"
                                                        colSpan={2}
                                                        index={i}
                                                    >
                                                        <div className="flex items-center">
                                                            <p className="m-0 ml-4">
                                                                {i + 1}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell
                                                        className="px-0 capitalize"
                                                        align="left"
                                                        colSpan={2}
                                                    >
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
                                                                        "other"
                                                        }
                                                    </TableCell>
                                                    <TableCell
                                                        className="px-0 capitalize"
                                                        align="left"
                                                        colSpan={2}
                                                    >
                                                        <span>{rows[i].fileName}</span>
                                                    </TableCell>
                                                    <TableCell
                                                        className="px-0 capitalize"
                                                        align="left"
                                                        colSpan={2}
                                                    >
                                                        <Icon
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
                                                            style={{ marginLeft: "-60px", marginTop: "30px" }}
                                                        >
                                                            <Link
                                                                href={`/project/showowner/${currentHash != null && Buffer.from("" + currentHash).toString('base64')}/${currentExt}`}
                                                                target="_"
                                                                style={{ textDecoration: "initial", color: "inherit" }}
                                                            >
                                                                <MenuItem>Open</MenuItem>
                                                            </Link>
                                                            <MenuItem onClick={() => handleShareOpen(hash, ext, filename)}>Share</MenuItem>
                                                            <MenuItem onClick={handleClose}>Delete</MenuItem>
                                                        </Menu>
                                                    </TableCell>

                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>

                                }
                                {grid && uploadStatus && file.files.map((rows, i) => (
                                    <Grid item md={2} key={i}>
                                        <Button
                                            className={classes.thumb}
                                            variant="outlined"
                                            color="primary"
                                        >
                                            {
                                                (file.files[i].type === "image/jpg" || file.files[i].type === "image/png"
                                                    || file.files[i].type === "image/jpeg" ||
                                                    file.files[i].type === "image/gif")
                                                    ?
                                                    <Photo></Photo>
                                                    :
                                                    (file.files[i].type === "text/plain")
                                                        ?
                                                        <LibraryBooks></LibraryBooks>
                                                        :
                                                        (file.files[i].type === "application/pdf")
                                                            ?
                                                            <PictureAsPdf></PictureAsPdf>
                                                            :
                                                            (file.files[i].type === "text/xml")
                                                                ?
                                                                <Code></Code>
                                                                :
                                                                "other"
                                            }
                                            <Button
                                                className={classes.innerthumb}
                                                variant="outlined"
                                                color="primary"
                                            >
                                                {file.files[i].name.length > 10 ?
                                                    <span className={classes.file}>{`${file.files[i].name.substring(0, 9)}...`}</span>
                                                    :
                                                    <span className={classes.file}>{file.files[i].name}</span>
                                                }
                                            </Button>
                                            <Icon style={{
                                                position: "absolute",
                                                marginLeft: "110px",
                                                marginTop: "-100px"
                                            }}
                                                variant="outlined"
                                                aria-owns={anchorEl ? 'simple-menu' : undefined}
                                                aria-haspopup="true"
                                                onClick={(e) => handleMenuClick(e, storeHash[i], file.files[i].type, file.files[i].fileName)}
                                            >more_vert</Icon>
                                            <Menu
                                                id="simple-menu"
                                                anchorEl={anchorEl}
                                                open={Boolean(anchorEl)}
                                                onClose={handleMenuClose}
                                                style={{ marginLeft: "-60px", marginTop: "35px" }}
                                            >
                                                <Link
                                                    href={`/project/showowner/${currentHash != null && Buffer.from(currentHash).toString('base64')}/${currentExt}`}
                                                    target="_"
                                                    style={{ textDecoration: "initial", color: "inherit" }}

                                                >
                                                    <MenuItem>Open</MenuItem>
                                                </Link>
                                                <MenuItem onClick={() => handleShareOpen(hash, ext, filename)}>Share</MenuItem>
                                                <MenuItem onClick={handleClose}>Delete</MenuItem>
                                            </Menu>
                                        </Button>
                                    </Grid>
                                ))}

                            </Grid>
                        </div>
                    }
                </div>
            }
        </div>
    );
}