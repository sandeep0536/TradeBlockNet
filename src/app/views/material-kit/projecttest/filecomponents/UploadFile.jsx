import React, { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'
import { Breadcrumb } from 'app/components'
import GridItem from './DLTcomponents/Grid/GridItem'
import { DropzoneArea } from 'material-ui-dropzone';
import { API_URL, PINATA_API_KEY, PINATA_SECRET_KEY, COMMON } from "ServerConfig";
import { ipfs } from "./DLTcomponents/Web3/ipfs";
import crypt from "crypto-js";
import Web3 from "web3";
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS, UPLOAD_WARNING } from "ServerConfig";
import { CircularProgress } from '@material-ui/core'
import { LibraryBooks, Photo, PictureAsPdf } from "@material-ui/icons";
import {
    Grid
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Menu from '@material-ui/core/Menu'
import { MenuItem } from '@material-ui/core'
import { Icon } from "@material-ui/core";
import { Link } from "@material-ui/core";
import {
    Select
} from "@material-ui/core";
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from "../SnackbarComponent";
import WaitSnackbar from "./WaitSnackbar";
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@material-ui/core'
import clsx from 'clsx'
import history from 'history.js'
import { getFileMetadata, StoreFiles, getAllDIDData, removeTransferHash, storeDID } from "../StoreDataDid";
import pinataSDK from '@pinata/sdk';
import TransferPopup from "../TransferPopup"
import ShareFilePopup from "../ShareFilePopup"
import CircularStatic from "./CircularStatic"
import { getNonce } from "../web3Functions/Web3Functions";
import { getUserRole } from "../roles/UserRoles";
import RoleWarningPopup from "../RoleWarningPopup";

const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY);

const Tx = require("ethereumjs-tx").Transaction;
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

let globalNonce = 0;
let count = 0;
let rows = [];
let allHash = [];
let storeHash = [];
let wallet;
let contacts;
let progressPercentage = 0;
/**
 * instantiate web3 object
 */
const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));
let filePercentage = 0;
export default function UploadFile(props) {
    const classes = useStyles()
    /**
     * read the projectname from url
     */
    const propdata = props.location.pathname.split("/");
    const projectname = propdata[2];
    const [success, setSuccess] = useState(null)
    const [uploadFileId, setUploadFileId] = useState(null)
    const [currentHash, setCurrentHash] = useState(null)
    const [currentExt, setCurrentExt] = useState(null)
    const [hash, setHash] = useState(null);
    const [error, setError] = useState(null);
    const [ext, setExt] = useState(null);
    const [filename, setFilename] = useState(null);
    const [upload, setUpload] = useState(true);
    const [share, setShare] = useState(false);
    const [status, setStatus] = useState(true);
    const [shareStatus, setShareStatus] = useState(false);
    const [open, setOpen] = useState(false)
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [expire, setExpire] = useState(false)
    const [file, setFile] = useState({ files: [] });
    const [grid, setGrid] = useState(true);
    const [uploadStatus, setUploadStatus] = useState(false);
    const [transfer, setTransfer] = useState(false);
    const [transferProgress, setTransferProgress] = useState(false);
    const [warning, setWarning] = useState(null);
    const [logs, setLogs] = useState(false);
    const [showPassword, setShowPassword] = useState(null);
    const [filePercent, setFilePercent] = useState(0);
    const [fileStatus, setFileStatus] = useState("Ready to upload...");
    const [restrictUser, setRestrictUser] = useState(false);
    const [shareRestrictUser, setShareRestrictUser] = useState(false);
    const [transferRestricUser, setTransferRestricUser] = useState(false);
    const [nxftBalance, setNxftBalance] = useState(0);
    const [tokenPrice, setTokenPrice] = useState(0);

    async function setProgress(pro) {
        setFilePercent(Number(filePercent) + 20);
        if (pro == 20)
            setFileStatus("File has been encrypted and ready to upload on ipfs....")
        else if (pro == 40)
            setFileStatus("File successfully uploaded on ipfs and ready to set metadata on blockchain")
        else if (pro == 60)
            setFileStatus("File metadata successfully write on blockchain now ready to store data on DID....")
        else if (pro == 80)
            setFileStatus("Data successfully store on DID now DID will be store on blockchain....")
        else if (pro == 100)
            setFileStatus("File metadata successfully store on DID....")
    }


    function handleTransfer() {
        setTransfer(!transfer)
    }

    function handleWarning() {
        setWarning(null);
    }
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
        // console.log(files)
        setFile({
            files: files
        });
    }

    /**
     * handle share menu
     */
    function handleShareOpen() {
        setShare(true)
    }

    /**
     * when user click on file menu
     */
    const handleMenuClick = async (event, hash, ext, file, id) => {
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

    /**
     * function to open password popup at the time of 
     * file uploading
     */
    function handleUploadOpen() {
        setShowPassword(true)
        setOpen(true)
    }

    function handleClose() {
        setOpen(false)
    }
    function handleShareClose() {
        setShare(false)
    }
    /**
     * function to handle when user change
     * File view or Grid view
     */
    const selectView = (value) => {
        if (value === "grid")
            setGrid(true);
        else setGrid(false);
    }

    useEffect(() => {
        rows = [];
        (async () => {
            /**
             * function to get walletData from curent user DID
             */
            getWalletData();
            try {
                /**
                 * getFileMetaData() will get all files metadata,
                 * from user DID
                 */
                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "email": localStorage.getItem("userEmail"),
                        "action": 1
                    }),
                }
                const restoken = await fetch(`${API_URL}/getNXFTBalance`, opts);
                await restoken.json().then((response) => {
                    // console.log("response", response)
                    if (response.status === true) {
                        setTokenPrice(response.tokenPrice);
                        setNxftBalance(response.result[0].NXFT_balance);
                        // console.log("response.tokenPrice", response.tokenPrice)
                        // console.log("response.result[0].NXFT_balance", response.result[0].NXFT_balance)
                    } else {
                        setError("please Top up your TBN Tokens")
                    }
                })
                const metadata = await getFileMetadata();
                if (metadata === "empty" || metadata === undefined)
                    setStatus(false)
                // console.log("metadata", metadata)
                const files = metadata ? JSON.parse(metadata) : {}



                /**
                 * check user subscription status
                 */
                const res = await fetch(`${API_URL}/getsubscriptionstatus`, opts);
                await res.json()
                    .then(async (res) => {
                        var date_ob = new Date();
                        var day = ("0" + date_ob.getDate()).slice(-2);
                        var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                        var year = date_ob.getFullYear();
                        var hours = date_ob.getHours();
                        var minutes = date_ob.getMinutes();
                        var seconds = date_ob.getSeconds();
                        var startDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                        const data = JSON.parse(res.result)
                        // console.log(data)
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
                        } else {

                        }
                    })
            } catch (e) {
                console.log(e)
            }
        })()
    }, [])

    const getWalletData = async () => {
        if (localStorage.getItem("did_data") == null || localStorage.getItem("did_data") === undefined) {
            // const data = await getAllDIDData();
            // localStorage.setItem("did_data", data)
            if (projectname == "" || projectname == null || projectname == undefined)
                history.push("/dashboard/myfiles")
            setStatus(false)
        } else {
            const data = JSON.parse(localStorage.getItem("did_data"));
            let isProjectAvailable = false;
            Object.keys(data.project).map((k, i) => {
                if (k == projectname)
                    isProjectAvailable = true;
            })
            if (projectname == "" || projectname == null || projectname == undefined || !isProjectAvailable)
                history.push("/dashboard/myfiles")
            wallet = data.wallet;
            contacts = data.contact;
            const hash = await getUserRole(wallet.walletaddress);
            if (hash == "") {
                if (data.userToken == null)
                    setRestrictUser(false);
                else if (data.companyProfile == null || data.companyProfile == undefined) {
                    setRestrictUser(true)
                    setWarning(UPLOAD_WARNING)
                }
            } else {
                ipfs.files.get(hash, function (err, files) {
                    try {
                        const data = JSON.parse(files[0].content.toString("binary"));
                        const permissions = data[0].userRolePermission;
                        // console.log(permissions)
                        if(permissions.Inactive){
                            setRestrictUser(true)
                            setWarning("you have an Inactive user")
                        }
                        else if(!permissions.Upload) {
                            setRestrictUser(true)
                            setWarning("you don't have permission to upload file")
                        }
                        if (!permissions.Share) {
                            setShareRestrictUser(true);
                        }
                        if (!permissions.Transfer) {
                            setTransferRestricUser(true);
                        }
                    } catch (e) {
                        console.log(e)
                    }
                })
            }
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
     * function to get all FileHash from blockchain,
     * which is uploaded by user
     */
    const getFilehash = async () => {
        try {
            const filehash = JSON.parse(localStorage.getItem("did_data"))
            try {
                const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                    from: wallet.walletaddress,
                    gasLimit: "0x200b20",
                });

                if (filehash && filehash.files[projectname]) {
                    Object.keys(filehash.files[projectname]).map((key, i) => {
                        const hash = filehash.files[projectname][key];
                        (async function () {
                            try {

                                const metaData = await contract.methods.getFileMetaData(hash).call({
                                    from: wallet.walletaddress,
                                })
                                    .then((res) => {
                                        rows.push(res);
                                    })
                                    .catch((err) => {
                                        console.log(err)
                                        setStatus(false)
                                    })
                            } catch (e) {
                                console.log(e)
                                setStatus(false)
                            }
                        })()
                    })

                }
                setTimeout(function () {
                    setStatus(false)
                }, 6000)
            } catch (e) {
                setStatus(false)
                console.log(e)
            }

        } catch (e) {
            setStatus(false)
            console.log(e)
        }
    }

    /**
   * after file upload on ipfs it will call,
   * for write file metadata in blockchain
   */
    const setMetaData = async (decPrivate, file1, address, hash, loopIndex) => {
        try {
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                from: address,
                gasLimit: "0x200b20",
            });
            const common = COMMON;
            const currtime = Math.round(new Date().getTime() / 1000);
            const privateKey = Buffer.from(decPrivate.slice(2), 'hex');
            const fileId = btoa(loopIndex + "_" + currtime + "_" + localStorage.getItem("userEmail") + "_" + wallet.walletaddress+"_"+hash);
            const contractFunction = contract.methods.addFileMetaData(
                fileId,
                file1.name,
                file1.type,
                address,
                "" + currtime,
                hash,
                projectname,
                "" + file1.size
            );
            const functionAbi = await contractFunction.encodeABI();
            const txParams = {
                nonce: globalNonce++,
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
            await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', async (receipt) => {
                storeHash.push(hash)
                setCurrentHash(hash)
            }).catch((e) => {
                setError("insuffient fund or something went wrong")
            })
            await StoreFiles(storeHash, projectname, address);
            const opts = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "email": localStorage.getItem("userEmail"),
                    "files": storeHash.length,
                    "action": 1
                }),
            }
            const res = await fetch(`${API_URL}/deducttokens`, opts);
            res.json().then((response) => {
                if (response.status === true) {
                    setUpload(true)
                    setUploadStatus(true)
                    allHash.push(hash)
                    setShowPassword(false)
                    setSuccess("File uploaded successfully")
                }
            })
            // .then(async (res) => {
            //     const response = await storeDID(localStorage.getItem("idx_id"), decPrivate, address)
            //         .then((res) => {

            //         })
            // })
            // .catch((e) => {
            //     console.log(e)
            //     setUpload(true)
            //     setUploadStatus(true)
            //     setError("Something went wrong")
            // })
            // filePercentage += 20;
            // await setProgress(60);
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
    const uploadFileIpfs = async (file, password) => {
        try {
            if (restrictUser) { }
            else {
                const fileLength = Object.keys(file.files).length;
                const cost = Number(fileLength) * Number(tokenPrice)
                if (cost > nxftBalance || isNaN(cost) || cost <= 0) {
                    setUpload(true)
                    setOpen(false);
                    setError("insufficient TBN Token balance")
                }
                else {
                    setFileStatus("File is encrypting....")
                    globalNonce = await getNonce(wallet.walletaddress)
                        .catch((e) => {
                            setOpen(false);
                            setError("Something went wrong")
                            console.log(e)
                        })
                    const decPrivate = crypt.AES.decrypt(wallet.privatekey, password).toString(crypt.enc.Utf8);
                    if (decPrivate.length < 1) {
                        setError("your password may be wrong")
                        setUpload(true)
                    } else {
                        setOpen(false);
                        for (let i = 0; i < Object.keys(file.files).length; i++) {
                            (function (file) {
                                var reader = new FileReader();
                                reader.onload = async () => {
                                    try {
                                        var wordArray = crypt.lib.WordArray.create(reader.result);
                                        var encrypted = crypt.AES.encrypt(wordArray, "" + decPrivate).toString();
                                        await convertToBuffer(encrypted);
                                        filePercentage += 20;
                                        await setProgress(20);
                                    } catch (err) {
                                        setUpload(true)
                                        console.log(err)
                                        setError("something went wrong")
                                        return;
                                    }
                                }
                                const convertToBuffer = async (data) => {

                                    const bufferData = await Buffer.from("" + data);
                                    await ipfs.add(bufferData, async (err, ipfshash) => {
                                        if (err) {
                                            setUpload(true)
                                            console.log(err)
                                            setError("something went wrong")
                                            return;
                                        }
                                        else {
                                            await pinata.pinByHash(ipfshash[0].hash)
                                                .then(async (res) => {
                                                    filePercentage += 20;
                                                    await setProgress(40)
                                                    const data = await setMetaData(decPrivate, file, wallet.walletaddress,
                                                        ipfshash[0].hash, i
                                                    )
                                                        .catch((e) => {
                                                            console.log(e)
                                                            setUpload(true)
                                                            setError("something went wrong")
                                                        })
                                                })
                                                .catch((e) => {
                                                    console.log(e);
                                                })
                                        }
                                    })
                                };
                                reader.readAsArrayBuffer(file);
                            })(file.files[i]);
                        }
                    }
                }
            }
        } catch (e) {
            setOpen(false)
            setUpload(true)
            console.log(e)
            setError("something went wrong")
        }
    }

    /**
     * initially,when user click on upload button
     * then it will call
     */
    const uploadAction = async () => {
        const filepassword = document.getElementById("password").value;
        try {
            if (Object.keys(file.files).length <= 0 || filepassword === "") {
                setError("please enter password")
            } else {
                setUpload(false)
                uploadFileIpfs(file, filepassword);
            }
        } catch (e) {
            setUpload(true);
            setError("Something went wrong")
            console.log(e)
        }
    }


    function handleLogs() {
        // console.log("logs",logs)
        setLogs(!logs)
    }
    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb
                    routeSegments={[
                        { name: <div id="upload-crumb">{projectname}</div>, path: '/project/createproject', pathname: projectname },
                        { name: 'Upload Documents' },
                    ]}
                />
            </div>
            {/* <CircularStatic percent={filePercent} filestatus={fileStatus} /> */}
            {/* <LogPopup status={logs} close={handleLogs} /> */}
            <TransferPopup status={transfer} close={handleTransfer}
                error={setError} anchor={setAnchorEl} success={setSuccess}
                project={projectname}
                hash={hash}
            />
            {expire ?
                <div>
                    <center>
                        <h3>Your free plan has been expired please subscribe with any plan</h3>
                    </center>
                </div>
                :
                <div>
                    <div>
                        <div>
                            <RoleWarningPopup status={warning != null} close={handleWarning}
                                content={warning} title={"Upload file warning"} />
                            <Snackbar
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                open={success != null}
                                autoHideDuration={3000}
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
                            {upload}
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
                            <ShareFilePopup
                                status={share} close={handleShareClose} fileId={uploadFileId}
                                error={setError} anchor={setAnchorEl} success={setSuccess}
                                shareStatus={setShareStatus} share={setShare}
                                hash={hash} ext={ext} fileName={filename}
                            />

                        </div>
                        <DropzoneArea
                            onChange={handleFileChange}

                        />
                        <GridItem>
                            {!upload &&
                                <div>
                                    <center>
                                        {/* <CircularProgress variant="determinate" value={filePercentage} style={{ width: "52px", marginTop: "20px" }} /> */}
                                        <CircularProgress className={classes.formControl} />
                                        {/* <div style={{ marginTop: "20px", marginLeft: "10px" }} id="file-status">{`${fileStatus}`}</div> */}
                                        {/* <div style={{ marginTop: "-33px", marginLeft: "10px" }} id="file-percent">{`${filePercentage}%`}</div> */}
                                    </center>
                                    <WaitSnackbar
                                        message={"please wait while file upload"}
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
                                disabled={!upload || Object.keys(file.files).length <= 0 || restrictUser}
                                onClick={handleUploadOpen}
                            >
                                Upload file
                            </Button>
                        </center>

                    </div>
                    {
                        shareStatus ?
                            <div>
                                <center>
                                    <CircularProgress className={classes.progress} />
                                </center>
                                <WaitSnackbar
                                    message={"please wait while file share"}
                                ></WaitSnackbar>
                            </div>
                            :
                            ""
                    }
                    <div>
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
                                    <h3>Documents</h3>
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
                                                                rows[i].fileExt === "image/gif" || rows[i].fileExt === "image/svg")
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
                                                                        (
                                                                            (() => {
                                                                                if (rows[i].fileName) {
                                                                                    var ext = /^.+\.([^.]+)$/.exec(rows[i].fileName);
                                                                                    return ext == null ? "" : ext[1];

                                                                                }
                                                                            })()
                                                                        )

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
                                                                href={`/project/showowner/${currentHash != null && Buffer.from("" + currentHash).toString('base64')}/${currentExt}`}
                                                                // target="_"
                                                                target=""
                                                                style={{ textDecoration: "initial", color: "inherit" }}

                                                            >
                                                                <MenuItem>Open</MenuItem>
                                                            </Link>
                                                            {!shareRestrictUser &&
                                                                <MenuItem onClick={() => handleShareOpen(hash, ext, filename, uploadFileId)}>Share</MenuItem>
                                                            }
                                                            {!transferRestricUser &&
                                                                <MenuItem onClick={handleTransfer}>Transfer</MenuItem>
                                                            }

                                                            <MenuItem onClick={handleLogs}>Logs</MenuItem>
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
                                                        Documents Name
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
                                                                            (
                                                                                (() => {
                                                                                    if (rows[i].fileName) {
                                                                                        var ext = /^.+\.([^.]+)$/.exec(rows[i].fileName);
                                                                                        return ext == null ? "" : ext[1];
    
                                                                                    }
                                                                                })()
                                                                            )
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
                                                                    // target="_"
                                                                    target=""
                                                                    style={{ textDecoration: "initial", color: "inherit" }}
                                                                >
                                                                    <MenuItem>Open</MenuItem>
                                                                </Link>
                                                                {!shareRestrictUser &&
                                                                    <MenuItem onClick={() => handleShareOpen(hash, ext, filename, uploadFileId)}>Share</MenuItem>
                                                                }
                                                                {!transferRestricUser &&
                                                                    <MenuItem onClick={handleTransfer}>Transfer</MenuItem>
                                                                }
                                                                <MenuItem onClick={handleLogs}>Logs</MenuItem>
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
                                                            (file.files[i].type == "application/pdf")
                                                                ?
                                                                <PictureAsPdf></PictureAsPdf>
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
                                                        href={`/project/showowner/${currentHash != null && Buffer.from("" + currentHash).toString('base64')}/${currentExt}`}
                                                        // target="_"
                                                        target=""
                                                        style={{ textDecoration: "initial", color: "inherit" }}

                                                    >
                                                        <MenuItem>Open</MenuItem>
                                                    </Link>
                                                    {!shareRestrictUser &&
                                                        <MenuItem onClick={() => handleShareOpen(hash, ext, filename)}>Share</MenuItem>
                                                    }
                                                    {!transferRestricUser &&
                                                        <MenuItem onClick={handleTransfer}>Transfer</MenuItem>
                                                    }

                                                    <MenuItem onClick={handleLogs}>Logs</MenuItem>
                                                </Menu>
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>
                            </div>
                        }
                    </div>
                </div >
            }
        </div>
    )
}


