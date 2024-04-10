import React, { useEffect, useState } from 'react'
import {
    Grid,
    Button,
} from '@material-ui/core'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components';
import EthCrypto from "eth-crypto";
import { generateMnemonic, EthHdWallet } from "eth-hd-wallet"
import crypt from "crypto-js";
import { makeStyles } from "@material-ui/core/styles";
import Web3 from "web3";
import { INFURA_URL, API_URL } from 'ServerConfig';
import { CircularProgress } from '@material-ui/core';
import QRCode from 'qrcode.react';
import { Icon } from '@material-ui/core';
import { CONTRACT_ABI, CONTRACT_ADDRESS, COMMON } from 'ServerConfig';
import {
    Table,
    TableHead,
    TableCell,
    TableBody,
    TableRow,
} from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from './SnackbarComponent';
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import WaitSnackbar from './filecomponents/WaitSnackbar';
import Common from 'ethereumjs-common';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@material-ui/core';
import { AppBar } from '@material-ui/core';
import { Tabs } from '@material-ui/core';
import { Tab } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { Box } from '@material-ui/core';
import download from 'downloadjs';
import ForgotPassword from "./ForgotPassword";
import { StoreWallet, getAllDIDData, storePaymentTransferRecord } from './StoreDataDid';
const common = COMMON;
const Tx = require("ethereumjs-tx").Transaction;

let globalNonce;
const useStyles = makeStyles((theme) => ({
    progress: {
        margin: theme.spacing(2),
    },
    MuiTabsflexContainer: {
        marginLeft: "auto",
        marginRight: "auto",
        display: "block"
    }
}))
let ethwallet;
const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));
let rows = [];


function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}
export default function CreateWallet() {
    const classes = useStyles()
    const [state, setState] = useState({});
    const [balance, setBalance] = useState(null);
    const [plan, setPlan] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [address, setAddress] = useState(false);
    const [copied, setCopied] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [createWallet, setCreateWallet] = useState(null);
    const [status, setStatus] = useState(false);
    const [open, setOpen] = useState(false);
    const [progress, setProgress] = useState(false);
    const [walletCreation, setWalletCreation] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [forgotStatus, setForgotStatus] = useState(false);

    const theme = useTheme();
    const [value, setValue] = React.useState(0);
    const handleChange = ({ target: { name, value } }) => {
        setState({
            ...state,
            [name]: value,
        })
    }
    const handleValueChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };
    const handleRefresh = async () => {
        rows = [];
        await getData(wallet.walletaddress)
        setRefresh(true)
        setTimeout(function () {
            setRefresh(false)
        }, 3000)
    }
    setInterval(function () {
        if (localStorage.getItem("did_data") == "empty") {
            setCreateWallet("createwallet")
        }
    }, 100)
    useEffect(() => {
        try {
            (async function () {
                if (localStorage.getItem("walletprogress") == "true") {
                    setWalletCreation(true)
                }
                if (localStorage.getItem("forgotstatus") == "true") {
                    setForgotStatus(true)
                }
                await getWalletData();
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
                        setPlan(data[0].plan)
                    })
                    .catch((e) => {
                        setProgress(false)
                        console.log(e)
                    })
            })();
        }
        catch (e) {
            setProgress(false)
            console.log(e)
        }
    }, [rows])
    const refreshBalance = () => {
        if (ethwallet != undefined) {
            web3.eth.getBalance(ethwallet.walletaddress.toString().toLowerCase(), function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    setBalance(web3.utils.fromWei(result, "ether") + " BNB")
                    getData(ethwallet.walletaddress)
                }
            })
        }
    }
    const getWalletData = async () => {
        if (localStorage.getItem("did_data") == null || localStorage.getItem("did_data") == "undefined" || localStorage.getItem("did_data") == undefined) {
            await getAllDIDData()
                .then((res) => {
                    setProgress(true)
                    localStorage.setItem("did_data", res)
                    if (res != null || res != undefined || res != "empty") {
                        alert("check")
                        const walletData = JSON.parse(localStorage.getItem("did_data"))
                        ethwallet = walletData.wallet;
                        setWallet(ethwallet)
                        refreshBalance();
                        setProgress(false)
                        setStatus(true)
                    }
                    else {
                        setProgress(false)
                        setCreateWallet("createwallet")
                    }
                })
                .catch((e) => {
                    console.log(e)
                    localStorage.setItem("did_data", "empty")
                })

        } else {
            console.log(JSON.parse(localStorage.getItem("did_data")).length)
            if (localStorage.getItem("did_data") == "empty" ||
                JSON.parse(localStorage.getItem("did_data")).length == 0)
                setCreateWallet("createwallet")
            else {
                const data = JSON.parse(localStorage.getItem("did_data"))
                ethwallet = data.wallet;
                setWallet(ethwallet)
                refreshBalance();
            }
        }
    }
    const getData = async (address) => {
        try {
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                from: address,
                gasLimit: "0x200b20",
            });
            const allhash = await contract.methods.getAllFilesUploadedByUser(address).call({
                from: address,
            })
            for (let i = 0; i < allhash.length; i++) {
                rows.push(await contract.methods.getFileMetaData(allhash[i]).call({
                    from: address,
                }))
            }
            setAddress(true)
        } catch (e) {
            console.log(e)
        }
    }

    const storeWallet = async (publicKey, address, privatekey) => {
        await StoreWallet(localStorage.getItem("userEmail"), localStorage.getItem("userName"),
            publicKey, address, privatekey)
            .then((res) => {
                window.location.reload()
            })
            .catch((e) => {
                setWalletCreation(false)
                setError("Something went wrong")
                console.log(e)
            })
    }
    const downloadSeed = async (seed) => {
        // Create a new PDFDocument
        const pdfDoc = await PDFDocument.create()
        // Embed the Times Roman font
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
        // Add a blank page to the document
        const page = pdfDoc.addPage()
        // Get the width and height of the page
        const { width, height } = page.getSize()
        // Draw a string of text toward the top of the page
        const fontSize = 20
        const seedData = seed.split(" ");
        const firstLine = [seedData[0], seedData[1], seedData[2], seedData[3]];
        const secondLine = [seedData[4], seedData[5], seedData[6], seedData[7]];
        const thirdLine = [seedData[8], seedData[9], seedData[10], seedData[11]];
        for (let i = 0; i < seedData.length; i++) {
            page.drawText(`${i + 1}. ${seedData[i]}`, {
                x: 50,
                y: height - (i + 3) * fontSize,
                size: fontSize,
                color: rgb(0, 0, 0),
            })
        }
        const pdfBytes = await pdfDoc.save()
        download(pdfBytes, "Nextfileshare-seed.pdf")
        // page.drawText(`${seedData[0]}\t\t${seedData[1]}\t\t${seedData[2]}\t\t${seedData[3]}`, {
        //     x: 50,
        //     y: height - 4 * fontSize,
        //     size: fontSize,
        //     color: rgb(0, 0, 0),
        // })
        // page.drawText(`${seedData[4]}\t\t${seedData[5]}\t\t${seedData[6]}\t\t${seedData[7]}`, {
        //     x: 50,
        //     y: (height - 4 * fontSize) - 30,
        //     size: fontSize,
        //     color: rgb(0, 0, 0),
        // })
        // page.drawText(`${seedData[8]}\t\t${seedData[9]}\t\t${seedData[10]}\t\t${seedData[11]}`, {
        //     x: 50,
        //     y: (height - 4 * fontSize) - 60,
        //     size: fontSize,
        //     color: rgb(0, 0, 0),
        // })

        // Serialize the PDFDocument to bytes (a Uint8Array)
    }
    const handleFormSubmit = async (event) => {
        if (password == "" || username == "" || email == "") { setError("please enter details") }
        else {
            try {
                localStorage.setItem("walletprogress", true)
                setWalletCreation(true)
                const mnemonic = generateMnemonic();
                const wallet = EthHdWallet.fromMnemonic(mnemonic)
                const [address] = wallet.generateAddresses(1)
                const privateKey = "0x" + (wallet.getPrivateKey(address).toString('hex'))
                const publicKey = EthCrypto.publicKeyByPrivateKey(
                    privateKey
                );
                const encPrivate = crypt.AES.encrypt(privateKey, "" + password)
                const jsonObj = [];
                jsonObj[0] = {
                    "address": address,
                    "publicKey": publicKey,
                    "privateKey": encPrivate.toString()
                }
                await downloadSeed(mnemonic);
                await storeWallet(publicKey, address, encPrivate.toString())
                localStorage.removeItem("walletprogress")
            } catch (e) {
                localStorage.removeItem("walletprogress")
                setWalletCreation(false)
                console.log(e)
            }
        }
    }

    const handleClose = async () => {
        setOpen(false)
    }
    let { username, email, password } = state

    const getNonce = async (address) => {
        await web3.eth.getTransactionCount(address, "pending").then(_nonce => {
            globalNonce = _nonce;
            return _nonce;
        });
    }
    const sendEther = async () => {
        await getNonce(ethwallet.walletaddress);
        let password = document.getElementById("password").value;
        let eth = document.getElementById("ethvalue").value;
        let receiver = document.getElementById("receiver").value;
        let receivername = document.getElementById("receivername").value;

        if (password == "" || eth == "" || receiver == "") {
            setError("please enter valid data")
        } else {
            setOpen(false)
            const decPrivate = crypt.AES.decrypt(ethwallet.privatekey, password).toString(crypt.enc.Utf8);
            if (decPrivate.length <= 0)
                setError("your password may be wrong")
            else {
                if (web3.utils.isAddress(receiver)) {
                    try {
                        setProgress(true)
                        const privateKey = Buffer.from(decPrivate.slice(2), 'hex');
                        const txParams = {
                            nonce: globalNonce,
                            gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
                            gasLimit: web3.utils.toHex(21000),
                            to: receiver,
                            value: "0x" + web3.utils.toWei(eth, 'ether'),
                            from: ethwallet.walletaddress
                        };
                        const tx = new Tx(txParams, { common });
                        tx.sign(privateKey); // Transaction Signing here
                        const serializedTx = tx.serialize();
                        console.log("serializedTx", serializedTx)
                        return web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', async (receipt) => {
                            setProgress(false)
                            setSuccess("BNB sent successfully")
                            if (receivername == "" || receivername == null) {
                                await storePaymentTransferRecord(ethwallet.username, receiver,
                                    receipt.blockHash, eth)
                            }
                            else {
                                await storePaymentTransferRecord(ethwallet.username, receivername,
                                    receipt.blockHash, eth)
                            }
                        })
                            .catch((e) => {
                                setProgress(false)
                                setError("insufficient funds!");
                            })
                    } catch (e) {
                        setProgress(false)
                        setError("Something went wrong!!");
                    }
                } else {
                    setProgress(false)
                    setError("pease enter valid reciever address!")
                }
            }
        }
    }
    setTimeout(function () {
        setStatus(true)

    }, 2000)
    function handleSnackbarClose() {
        setError(null)
        setSuccess(null)
        setCopied(false)
    }
    function handleForgot() {
        setForgotPassword(false)
    }
    if (error != null || success != null || copied) {
        rows = [];
        getData(ethwallet.walletaddress);
    }
    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Wallet' },
                    ]}
                />
                {forgotPassword &&
                    <ForgotPassword
                        close={handleForgot}
                        status={forgotPassword}
                        error={setError}
                        success={setSuccess}

                    />
                }
                {progress &&
                    <WaitSnackbar
                        message={"please wait while ether is sent"}
                    ></WaitSnackbar>
                }
                {walletCreation &&
                    <WaitSnackbar
                        message={"please wait while wallet is created"}
                    ></WaitSnackbar>
                }
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
                    open={copied}
                    autoHideDuration={3000}
                    onClose={handleSnackbarClose}
                >
                    <MySnackbarContentWrapper
                        onClose={handleSnackbarClose}
                        variant="success"
                        message="Copied"
                    />
                </Snackbar>
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
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Transaction Details</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="ethvalue"
                            label="BNB value"
                            type="text"
                            fullWidth
                        />
                        <TextField
                            margin="dense"
                            id="receiver"
                            label="Receiver address"
                            type="text"
                            fullWidth
                        />
                        <TextField
                            margin="dense"
                            id="receivername"
                            label="Receiver name (optional)"
                            type="text"
                            fullWidth
                        />
                        <TextField
                            margin="dense"
                            id="password"
                            label="wallet password"
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
                            onClick={() => sendEther()} color="primary"
                        >
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>

                {createWallet != null ?
                    <SimpleCard>
                        <>
                            <h2>Wallet Details</h2>
                        </>
                        <Grid item lg={7} md={7} sm={7} xs={12}>
                            <div className="p-8 h-full">
                                <ValidatorForm onSubmit={handleFormSubmit}>
                                    <TextValidator
                                        className="mb-4 w-full"
                                        label="Password"
                                        variant="outlined"
                                        size="small"
                                        onChange={handleChange}
                                        name="password"
                                        type="password"
                                        value={password || ''}
                                        validators={['required']}
                                        errorMessages={['this field is required']}
                                    />
                                    <center>
                                        <Button
                                            className="capitalize"
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                            disabled={walletCreation}
                                        >
                                            Create
                                        </Button>
                                    </center>
                                    {walletCreation &&
                                        <div>
                                            <center>
                                                <CircularProgress className={classes.progress} />
                                            </center>
                                        </div>
                                    }
                                </ValidatorForm>
                            </div>
                        </Grid>
                    </SimpleCard>
                    :
                    wallet != null && status ?
                        <Box sx={{ bgcolor: 'background.paper', width: 500 }}>
                            <AppBar position="static">
                                <Tabs
                                    value={value}
                                    onChange={handleValueChange}
                                    indicatorColor="secondary"
                                    textColor="inherit"
                                    variant="fullWidth"
                                    aria-label="full width tabs example"
                                >
                                    <Tab label="Wallet Details" {...a11yProps(0)} />
                                    <Tab label="History/Activity" {...a11yProps(1)} />
                                </Tabs>
                            </AppBar>
                            <SwipeableViews
                                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                                index={value}
                                onChangeIndex={handleChangeIndex}
                            >
                                <TabPanel value={value} index={0} dir={theme.direction}>
                                    {
                                        ethwallet && ethwallet.walletaddress &&
                                        <>
                                            <QRCode value={ethwallet.walletaddress} style={{
                                                marginRight: "auto",
                                                marginLeft: "auto",
                                                display: "block",
                                                marginTop: "50px"
                                            }} />
                                            <Grid container spacing={3} className="mb-3 mt-12">
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        autoFocus
                                                        margin="dense"
                                                        id="address"
                                                        label="Address"
                                                        type="text"
                                                        value={ethwallet.walletaddress}
                                                        fullWidth
                                                        aria-readonly="true"
                                                        color="primary"
                                                    />
                                                    <CopyToClipboard text={ethwallet.walletaddress}
                                                        onCopy={() => setCopied(true)}>
                                                        <Icon
                                                            style={{
                                                                position: "absolute",
                                                                marginLeft: "-30px",
                                                                marginTop: "20px",
                                                                cursor: "pointer"
                                                            }}
                                                        >content_copy</Icon>
                                                    </CopyToClipboard>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        margin="dense"
                                                        id="balance"
                                                        label="balance"
                                                        type="text"
                                                        value={balance ? balance : 0}
                                                        fullWidth
                                                        aria-readonly="true"
                                                        color="primary"
                                                    />
                                                    <Icon style={{
                                                        position: "absolute",
                                                        marginTop: "24px",
                                                        marginLeft: "-50px",
                                                        cursor: "pointer"
                                                    }}
                                                        onClick={() => refreshBalance()}
                                                        variant="outlined"
                                                    >refresh</Icon>
                                                </Grid>
                                                <Grid item xs={12} md={12}>
                                                    <TextField
                                                        margin="dense"
                                                        id="pk"
                                                        label="Public Key"
                                                        type="text"
                                                        value={ethwallet.publicKey}
                                                        fullWidth
                                                        aria-readonly="true"
                                                        color="primary"
                                                    />
                                                    <CopyToClipboard text={ethwallet.publicKey}
                                                        onCopy={() => setCopied(true)}>
                                                        <Icon
                                                            style={{
                                                                position: "absolute",
                                                                marginLeft: "-30px",
                                                                marginTop: "20px",
                                                                cursor: "pointer"
                                                            }}
                                                        >content_copy</Icon>
                                                    </CopyToClipboard>
                                                </Grid>
                                                <div className="text-center"
                                                    style={{
                                                        marginLeft: "auto", marginRight: "auto",
                                                        display: "block"
                                                    }}
                                                >
                                                    {(plan == "silver" || plan == "gold") &&
                                                        <Button
                                                            className="capitalize"
                                                            variant="contained"
                                                            color="primary"
                                                            type="submit"
                                                            onClick={() => setOpen(true)}
                                                            disabled={progress}
                                                        >
                                                            Send BNB
                                                        </Button>
                                                    }
                                                    {progress &&
                                                        <>
                                                            <center>
                                                                <CircularProgress className={classes.progress} />
                                                            </center>
                                                        </>
                                                    }
                                                </div>
                                            </Grid>

                                        </>

                                    }
                                </TabPanel>
                                <TabPanel value={value} index={1} dir={theme.direction}>
                                    <div className="w-full overflow-auto">
                                        {address && !refresh ?
                                            <Table className="whitespace-pre">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell className="px-0" style={{ width: "50px" }}>Sno.</TableCell>
                                                        <TableCell className="px-0" style={{ width: "385px" }}>From</TableCell>
                                                        <TableCell className="px-0">Filename</TableCell>
                                                        <TableCell className="px-0">Upload Time</TableCell>
                                                        <TableCell className="px-0">
                                                            <Icon style={{
                                                                position: "absolute",
                                                                marginTop: "-10px",
                                                                marginLeft: "20px",
                                                            }}
                                                                onClick={() => handleRefresh()}
                                                                variant="outlined"
                                                            >refresh</Icon>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {
                                                        rows.map((key, i) => (
                                                            <TableRow key={i}>
                                                                <TableCell className="px-0 capitalize" align="left">
                                                                    {i + 1}
                                                                </TableCell>
                                                                <TableCell className="px-0 capitalize" align="left">
                                                                    {rows[i].userName}
                                                                </TableCell>
                                                                <TableCell className="px-0 capitalize" align="left">
                                                                    {rows[i].fileName}
                                                                </TableCell>
                                                                <TableCell className="px-0 capitalize" align="left">
                                                                    {new Date(rows[i].uploadTime * 1000).toLocaleString('en-GB')}
                                                                </TableCell>

                                                            </TableRow>
                                                        ))
                                                    }
                                                </TableBody>

                                            </Table>
                                            :
                                            <div>
                                                <center>
                                                    <CircularProgress className={classes.progress} />
                                                </center>
                                            </div>
                                        }
                                    </div>
                                </TabPanel>
                            </SwipeableViews>
                        </Box>
                        :
                        <div>
                            <center>
                                <CircularProgress className={classes.progress} />
                            </center>
                        </div>
                }
                <center>
                    {forgotPassword || forgotStatus ?
                        <div>
                            <center>
                                <CircularProgress className={classes.progress} />
                            </center>
                        </div>
                        :
                        ethwallet && ethwallet.walletaddress &&
                        <Button
                            className="capitalize"
                            variant="contained"
                            color="primary"
                            type="submit"
                            onClick={() => setForgotPassword(true)}
                        >
                            Fogot password ?
                        </Button>
                    }

                </center>
            </div>
        </div >
    );
}