import React, { useEffect, useState } from 'react'
import { Grid, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { CircularProgress } from '@material-ui/core'
import QRCode from 'qrcode.react'
import { Icon } from '@material-ui/core'
import {
    Card,
    Table,
    TableHead,
    TableCell,
    TableBody,
    TableRow,
} from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import PropTypes from 'prop-types'
import SwipeableViews from 'react-swipeable-views'
import { useTheme } from '@material-ui/core'
import { AppBar } from '@material-ui/core'
import { Tabs } from '@material-ui/core'
import { Tab } from '@material-ui/core'
import { Typography } from '@material-ui/core'
import { Box } from '@material-ui/core'
import Web3 from 'web3'
import { INFURA_URL, API_URL, INFURA_ROPSTEN_URL } from 'ServerConfig'
import { CONTRACT_ABI, CONTRACT_ADDRESS, COMMON } from 'ServerConfig'
import crypt from 'crypto-js'
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from './SnackbarComponent'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import WaitSnackbar from './filecomponents/WaitSnackbar'
import { storePaymentTransferRecord, getDID } from './StoreDataDid'
import ForgotPassword from './ForgotPassword'
import PasswordPopup from 'app/components/MatxLayout/Layout1/PasswordPopup'
import { ipfs } from './filecomponents/DLTcomponents/Web3/ipfs'
import { InputLabel, MenuItem, FormControl, Select } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import InputAdornment from '@material-ui/core/InputAdornment'
import { getNonce } from './web3Functions/Web3Functions'
import $ from 'jquery'
import "datatables.net-dt/js/dataTables.dataTables"
import "datatables.net-dt/css/jquery.dataTables.min.css"
import TopupPopup from './TopupPopup'
import history from 'history.js';

let globalNonce
let payments = [];
const Tx = require('ethereumjs-tx').Transaction

const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL))
const common = COMMON
let rows = []
const useStyles = makeStyles((theme) => ({
    progress: {
        margin: theme.spacing(2),
    },
    MuiTabsflexContainer: {
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'block',
    },
}))
function TabPanel(props) {
    const { children, value, index, ...other } = props

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
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
}

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    }
}

export default function WalletComponent(props) {
    const classes = useStyles()
    const theme = useTheme()
    const ethwallet = props.wallet
    const [balance, setBalance] = useState(null)
    const [copied, setCopied] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [open, setOpen] = useState(false)
    const [progress, setProgress] = useState(false)
    const [forgotPassword, setForgotPassword] = useState(false)
    const [forgotStatus, setForgotStatus] = useState(false)
    const [historyProgress, setHistoryProgress] = useState(false)
    const [value, setValue] = React.useState(0)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [warning, setWarning] = useState(null)
    const [currency, setCurrency] = useState(null)
    const [sync, setSync] = useState(false)
    const [passOpen, setPassOpen] = useState(false)
    const [walletSyncProgress, setWalletSyncProgress] = useState(false)
    const [msg, setMsg] = useState(true)
    const [topup, setTopup] = useState(false)
    const [showPrivateOpen, setShowPrivateOpen] = useState(false)
    const [decryptedPrivateKey, setDecryptedPrivateKey] = useState(null)
    const [NXFTBalance, setNXFTBalance] = useState(0)
    const [status, setStatus] = useState(false);
    useEffect(() => {
        (async () => {
            const status = await fetchRecords();
            if (status) {
                setTimeout(() => {
                    $('#payment-table').dataTable({ destroy: true, scrollX: true });
                }, 4000)
            }
        })()
    })
    async function fetchRecords() {
        try {
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
                        history.push("/subscription")
                    }
                    else if (new Date(startDate).getTime() > new Date(data[0].sub_end_date).getTime()) {
                        history.push("/subscription")
                    }
                    else if (data[0].plan == "sandbox" || data[0].plan == "bronze" || data[0].plan == "silver") {
                        history.push("/dashboard")
                    }
                })

            const data = JSON.parse(localStorage.getItem("did_data"));
            payments = data.paymentsrecord;
            return true;
        } catch (e) {
            console.log(e)
        }
    }
    setTimeout(function () {
        try {
            setStatus(true)
        } catch (e) { }
    }, 3000)
    useEffect(() => {
        getNXFT()
        if (props.seedData && msg) {
            setWarning(
                'pls fund your wallet to sync your wallet with blockchain'
            )
            setSuccess('Wallet created successfully')
        }
        if (localStorage.getItem('forgotstatus') == 'true') {
            setForgotStatus(true)
        }
        ;(async () => {
            const response = await getDID()
            if (response == false) {
                setSync(true)
                localStorage.setItem('walletSync', true)
            } else setSync(false)
            refreshBalance()
        })()
        
    }, [rows])

    //function to get NXFT balance
    async function getNXFT() {
        const opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: localStorage.getItem('userEmail'),
                action: 1,
            }),
        }
        const response = await fetch(`${API_URL}/getNXFTBalance`, opts)
        // console.log("nxft",response.json())
        await response
            .json()
            .then((res) => {
                if (res.status == true) {
                    setNXFTBalance(res.result[0].NXFT_balance + ' TBN')
                }
            })
            .catch((e) => {
                console.log(e)
            })
    }

    setTimeout(() => {
        setMsg(false)
    }, 5000)
    const handleValueChange = (event, newValue) => {
        setValue(newValue)
    }

    const handleChangeIndex = (index) => {
        setValue(index)
    }
    function handlePopup() {
        setTopup(!topup)
    }
    const handleRefresh = async () => {
        rows = []
        // await getData(ethwallet.walletaddress)
        setRefresh(true)
        setTimeout(function () {
            setRefresh(false)
        }, 3000)
    }
    function payhandleRefresh() {
        setStatus(false);
        fetchRecords();
        setTimeout(function () {
            setStatus(true)
        }, 3000)
    }
    function handleCurrency(e) {
        setCurrency(e.target.value)
    }
    const refreshBalance = () => {
        if (ethwallet != undefined) {
            web3.eth.getBalance(
                ethwallet.walletaddress.toString().toLowerCase(),
                function (err, result) {
                    if (err) {
                        console.log(err)
                    } else {
                        setBalance(web3.utils.fromWei(result, 'ether') + ' BNB')
                        getData(ethwallet.walletaddress)
                    }
                }
            )
        }
    }
    const getData = async (address) => {
        try {
            const contract = new web3.eth.Contract(
                CONTRACT_ABI,
                CONTRACT_ADDRESS,
                {
                    from: address,
                    gasLimit: '0x200b20',
                }
            )
            const allhash = await contract.methods
                .getAllFilesUploadedByUser(address)
                .call({
                    from: address,
                })
            for (let i = 0; i < allhash.length; i++) {
                rows.push(
                    await contract.methods.getFileMetaData(allhash[i]).call({
                        from: address,
                    })
                )
            }
            setHistoryProgress(true)
        } catch (e) {
            console.log(e)
        }
    }

    const handleClose = async () => {
        setOpen(false)
    }

    async function sendETH(
        privateKey,
        receivername,
        decPrivate,
        receiver,
        eth
    ) {
        const ropstenWeb3 = new Web3(INFURA_ROPSTEN_URL)
        ropstenWeb3.eth.getTransactionCount(
            ethwallet.walletaddress,
            (err, transactionCount) => {
                // console.log('globalnonce', transactionCount)
                const txParams = {
                    to: receiver,
                    gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
                    gasLimit: web3.utils.toHex(21000),
                    nonce: transactionCount,
                    value: web3.utils.toHex(web3.utils.toWei(eth, 'ether')),
                }
                let tx = new Tx(txParams, { chain: 'ropsten' })
                // console.log('tex', tx)
                tx.sign(privateKey) // Transaction Signing here
                const serializedTx = tx.serialize()
                // console.log('serializedTx', serializedTx)
                return ropstenWeb3.eth
                    .sendSignedTransaction('0x' + serializedTx.toString('hex'))
                    .on('receipt', async (receipt) => {
                        // console.log(receipt)
                        setProgress(false)
                        setSuccess('ETH sent successfully')
                        if (receivername == '' || receivername == null) {
                            storePaymentTransferRecord(
                                ethwallet.username,
                                receiver,
                                receipt.transactionHash,
                                eth,
                                ethwallet.walletaddress,
                                decPrivate
                            )
                        } else {
                            storePaymentTransferRecord(
                                ethwallet.username,
                                receivername,
                                receipt.transactionHash,
                                eth,
                                ethwallet.walletaddress,
                                decPrivate
                            )
                        }
                    })
                    .catch((e) => {
                        console.log(e)
                        setProgress(false)
                        setError('insufficient funds or something went wrong!')
                    })
            }
        )
    }
    const sendBNB = async () => {
        globalNonce = await getNonce(ethwallet.walletaddress)
        let password = document.getElementById('password').value
        let eth = document.getElementById('ethvalue').value
        let receiver = document.getElementById('receiver').value
        let receivername = document.getElementById('receivername').value
        if (password == '' || eth == '' || receiver == '') {
            setError('please enter valid data')
        } else {
            setOpen(false)
            const decPrivate = crypt.AES.decrypt(
                ethwallet.privatekey,
                password
            ).toString(crypt.enc.Utf8)
            if (decPrivate.length <= 0) setError('your password may be wrong')
            else {
                if (web3.utils.isAddress(receiver)) {
                    try {
                        setProgress(true)
                        const privateKey = Buffer.from(
                            decPrivate.slice(2),
                            'hex'
                        )
                        const txParams = {
                            nonce: globalNonce,
                            gasPrice: web3.utils.toHex(
                                web3.utils.toWei('10', 'gwei')
                            ),
                            gasLimit: web3.utils.toHex(21000),
                            to: receiver,
                            value: web3.utils.toHex(
                                web3.utils.toWei(eth, 'ether')
                            ),
                            from: ethwallet.walletaddress,
                        }
                        if (currency == 'ETH')
                            await sendETH(
                                privateKey,
                                receivername,
                                decPrivate,
                                receiver,
                                eth
                            )
                        else {
                            let tx = new Tx(txParams, { common })
                            tx.sign(privateKey) // Transaction Signing here
                            const serializedTx = tx.serialize()
                            // console.log('serializedTx', serializedTx)
                            return web3.eth
                                .sendSignedTransaction(
                                    '0x' + serializedTx.toString('hex')
                                )
                                .on('receipt', async (receipt) => {
                                    setSuccess('BNB sent successfully')
                                    setProgress(false)
                                    if (
                                        receivername == '' ||
                                        receivername == null
                                    ) {
                                        await storePaymentTransferRecord(
                                            ethwallet.username,
                                            receiver,
                                            receipt.transactionHash,
                                            eth,
                                            ethwallet.walletaddress,
                                            decPrivate
                                        )
                                    } else {
                                        await storePaymentTransferRecord(
                                            ethwallet.username,
                                            receivername,
                                            receipt.transactionHash,
                                            eth,
                                            ethwallet.walletaddress,
                                            decPrivate
                                        )
                                    }
                                })
                                .catch((e) => {
                                    console.log(e)
                                    setProgress(false)
                                    setError('insufficient funds!')
                                })
                        }
                    } catch (e) {
                        setProgress(false)
                        setError('Something went wrong!!')
                    }
                } else {
                    setProgress(false)
                    setError('please enter valid reciever address!')
                }
            }
        }
    }

    async function showPrivateKey() {
        let password = document.getElementById('file-password').value
        const hash = localStorage.getItem('userData')
        await ipfs.files.get(hash, async function (err, files) {
            Array.from(files).forEach(async (file) => {
                try {
                    const data = JSON.parse(file.content.toString('binary'))
                    const privateKey = data.phash
                    let decPrivateKey = crypt.AES.decrypt(
                        privateKey,
                        password
                    ).toString(crypt.enc.Utf8)
                    if (decPrivateKey.length > 0) {
                        // console.log(decPrivateKey)
                        setDecryptedPrivateKey(decPrivateKey)
                        setShowPrivateOpen(!showPrivateOpen)
                    } else {
                        setError('Your password may be wrong!')
                    }
                } catch (e) {
                    setError('Your password may be wrong!')
                    console.log(e)
                }
            })
        })
    }
    async function syncWalletWithChain() {
        globalNonce = await getNonce(ethwallet.walletaddress)
        const hash = localStorage.getItem('userData')
        let password = document.getElementById('file-password').value
        setWalletSyncProgress(true)
        await ipfs.files.get(hash, async function (err, files) {
            Array.from(files).forEach(async (file) => {
                try {
                    setPassOpen(false)
                    const contract = new web3.eth.Contract(
                        CONTRACT_ABI,
                        CONTRACT_ADDRESS,
                        {
                            from: ethwallet.walletaddress,
                            gasLimit: '0x200b20',
                        }
                    )
                    const didData = JSON.parse(localStorage.getItem('did_data'))
                    const data = JSON.parse(file.content.toString('binary'))
                    const privateKey = data.phash
                    let decPrivateKey = crypt.AES.decrypt(
                        privateKey,
                        password
                    ).toString(crypt.enc.Utf8)
                    if (decPrivateKey.length > 0) {
                        const privateKey = Buffer.from(
                            decPrivateKey.slice(2),
                            'hex'
                        )
                        let txParams
                        if (didData.userToken != null) {
                            const inviteFunction =
                                contract.methods.addInvitedUsers(
                                    localStorage.getItem('userEmail'),
                                    didData.userToken,
                                    localStorage.getItem('idx_id'),
                                    localStorage.getItem('userData').toString(),
                                    localStorage.getItem('tokenHash').toString()
                                )
                            const inviteFunctionAbi =
                                await inviteFunction.encodeABI()
                            txParams = {
                                nonce: globalNonce,
                                gasPrice: '0x4a817c800',
                                gasLimit: '0x67c280', //0x200b20, //50000,
                                to: CONTRACT_ADDRESS,
                                data: inviteFunctionAbi,
                                value: '0x0',
                                from: ethwallet.walletaddress,
                            }
                        } else {
                            const contractFunction = contract.methods.addUser(
                                localStorage.getItem('userEmail').toString(),
                                localStorage.getItem('idx_id'),
                                localStorage.getItem('userData').toString()
                            )
                            const functionAbi =
                                await contractFunction.encodeABI()
                            txParams = {
                                nonce: globalNonce,
                                gasPrice: '0x4a817c800',
                                gasLimit: '0x67c280', //0x200b20, //50000,
                                to: CONTRACT_ADDRESS,
                                data: functionAbi,
                                value: '0x0',
                                from: ethwallet.walletaddress,
                            }
                        }
                        const tx = new Tx(txParams, { common })
                        tx.sign(privateKey) // Transaction Signing here
                        const serializedTx = tx.serialize()
                        // console.log('serializedTx', serializedTx)
                        return web3.eth
                            .sendSignedTransaction(
                                '0x' + serializedTx.toString('hex')
                            )
                            .on('receipt', async (receipt) => {
                                // console.log(receipt)
                                localStorage.removeItem('userToken')
                                localStorage.removeItem('tokenHash')
                                setWalletSyncProgress(false)
                                localStorage.removeItem('sync')
                                localStorage.removeItem('walletSync')
                                window.location.reload()
                            })
                            .catch((e) => {
                                setWalletSyncProgress(false)
                                console.log(e)
                                setError('insufficient funds!')
                            })
                    } else {
                        setWalletSyncProgress(false)
                        setError('your password may be wrong')
                    }
                } catch (e) {
                    setWalletSyncProgress(false)
                    console.log(e)
                    setError('something went wrong')
                }
            })
        })
        // let password = document.getElementById("file-password").value;
        // if (password == "") {
        //     setError("please enter valid data")
        // } else {
        //     setOpen(false)
        //     const decPrivate = crypt.AES.decrypt(ethwallet.privatekey, password).toString(crypt.enc.Utf8);
        //     if (decPrivate.length <= 0)
        //         setError("your password may be wrong")
        //     else {
        //         if (web3.utils.isAddress(receiver)) {
        //             try {
        //                 const common = Common.forCustomChain(1, {
        //                     name: 'bnb',
        //                     networkId: 97,
        //                     chainId: 97
        //                 }, 'petersburg');
        //                 setProgress(true)
        //                 const privateKey = Buffer.from(decPrivate.slice(2), 'hex');
        //                 const txParams = {
        //                     nonce: globalNonce,
        //                     gasPrice: "0x4a817c800",
        //                     gasLimit: "0x67c280",//0x200b20, //50000,
        //                     to: receiver,
        //                     value: "0x" + web3.utils.toWei(eth, 'ether'),
        //                     from: ethwallet.walletaddress
        //                 };
        //                 const tx = new Tx(txParams, { common });
        //                 tx.sign(privateKey); // Transaction Signing here
        //                 const serializedTx = tx.serialize();
        //                 console.log("serializedTx", serializedTx)
        //                 return web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', async (receipt) => {
        //                     setProgress(false)
        //                     setSuccess("BNB sent successfully")
        //                     if (receivername == "" || receivername == null) {
        //                         await storePaymentTransferRecord(ethwallet.username, receiver,
        //                             receipt.blockHash, eth)
        //                     }
        //                     else {
        //                         await storePaymentTransferRecord(ethwallet.username, receivername,
        //                             receipt.blockHash, eth)
        //                     }
        //                 })
        //                     .catch((e) => {
        //                         setProgress(false)
        //                         setError("insufficient funds!");
        //                     })
        //             } catch (e) {
        //                 setProgress(false)
        //                 setError("Something went wrong!!");
        //             }
        //         } else {
        //             setProgress(false)
        //             setError("pease enter valid reciever address!")
        //         }
        //     }
        // }
    }

    function handleSnackbarClose() {
        setError(null)
        setSuccess(null)
        setCopied(false)
        setWarning(null)
    }
    function handleForgot() {
        setForgotPassword(false)
    }
    function syncWallet() {
        setPassOpen(true)
    }
    function handlePassword() {
        setPassOpen(!passOpen)
    }
    if (error != null || success != null || copied) {
        rows = []
        getData(ethwallet.walletaddress)
    }
    // console.log("privatesandip",ethwallet.privatekey)

    const [showPassword, setShowPassword] = useState(false)
    function handleClickShowPassword() {
        if(decryptedPrivateKey){setShowPrivateOpen(false); setDecryptedPrivateKey(null)} 
        else
        setShowPrivateOpen(!showPrivateOpen)
        // console.log("sandeeep")

        // setShowPassword(!showPassword);
    }
      const handleMouseDownPassword = () => setShowPassword(!showPassword);
    return (
        <div>
            <TopupPopup status={topup} close={handlePopup} />
            <PasswordPopup
                status={showPrivateOpen}
                close={handleClickShowPassword}
                submit={showPrivateKey}

            />
            <PasswordPopup
                status={passOpen}
                close={handlePassword}
                submit={syncWalletWithChain}
            />
            {forgotPassword && (
                <ForgotPassword
                    close={handleForgot}
                    status={forgotPassword}
                    error={setError}
                    success={setSuccess}
                />
            )}
            {progress && (
                <WaitSnackbar
                    message={'please wait while ether is sent'}
                ></WaitSnackbar>
            )}
            {walletSyncProgress && (
                <WaitSnackbar
                    message={'please wait while wallet sync with chain'}
                ></WaitSnackbar>
            )}
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
                open={warning != null}
                autoHideDuration={5000}
                onClose={handleSnackbarClose}
            >
                <MySnackbarContentWrapper
                    onClose={handleSnackbarClose}
                    variant="info"
                    message={warning}
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
                <DialogTitle id="form-dialog-title">Send E-Payment</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">
                            Currency
                        </InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={currency}
                            label="Curremcy"
                            style={{ height: '40px', marginTop: '8px' }}
                            onChange={handleCurrency}
                        >
                            <MenuItem value={'BNB'} selected>
                                BNB
                            </MenuItem>
                            <MenuItem value={'ETH'}> ETH</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        id="ethvalue"
                        label="Amount"
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
                    <Button onClick={() => sendBNB()} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
            <Box sx={{ bgcolor: 'background.paper' }}>
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
                        {ethwallet && ethwallet.walletaddress && (
                            <>
                                <QRCode
                                    value={ethwallet.walletaddress}
                                    style={{
                                        marginRight: 'auto',
                                        marginLeft: 'auto',
                                        display: 'block',
                                        marginTop: '50px',
                                    }}
                                />
                                <Grid
                                    container
                                    spacing={3}
                                    className="mb-3 mt-12"
                                >
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
                                        <CopyToClipboard
                                            text={ethwallet.walletaddress}
                                            onCopy={() => setCopied(true)}
                                        >
                                            <Icon
                                                style={{
                                                    position: 'absolute',
                                                    marginLeft: '-30px',
                                                    marginTop: '20px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                content_copy
                                            </Icon>
                                        </CopyToClipboard>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            margin="dense"
                                            id="balance"
                                            label="balance"
                                            type="text"
                                            value={balance ? balance : '0 BNB'}
                                            fullWidth
                                            aria-readonly="true"
                                            color="primary"
                                        />
                                        <Icon
                                            style={{
                                                position: 'absolute',
                                                marginTop: '24px',
                                                marginLeft: '-25px',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => refreshBalance()}
                                            variant="outlined"
                                        >
                                            refresh
                                        </Icon>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            margin="dense"
                                            id="nxft-balance"
                                            label="TBN balance"
                                            type="text"
                                            value={
                                                NXFTBalance
                                                    ? NXFTBalance
                                                    : '0 TBN'
                                            }
                                            fullWidth
                                            aria-readonly="true"
                                            color="primary"
                                        />
                                        <Icon
                                            style={{
                                                position: 'absolute',
                                                marginTop: '24px',
                                                marginLeft: '-25px',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => getNXFT()}
                                            variant="outlined"
                                        >
                                            refresh
                                        </Icon>
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
                                        <CopyToClipboard
                                            text={ethwallet.publicKey}
                                            onCopy={() => setCopied(true)}
                                        >
                                            <Icon
                                                style={{
                                                    position: 'absolute',
                                                    marginLeft: '-30px',
                                                    marginTop: '20px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                content_copy
                                            </Icon>
                                        </CopyToClipboard>
                                    </Grid>
                                    <Grid item xs={12} md={12}>
                                        <TextField
                                            margin="dense"
                                            id="pk"
                                            label="Private Key"
                                            type={
                                                decryptedPrivateKey
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={
                                                decryptedPrivateKey
                                                    ? decryptedPrivateKey
                                                    : ethwallet.privatekey
                                            }
                                            fullWidth
                                            aria-readonly="true"
                                            color="primary"
                                            InputProps={{
                                                // <-- This is where the toggle button is added.
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={
                                                                handleClickShowPassword

                                                            }

                                                        >
                                                            {decryptedPrivateKey ? (
                                                                <Visibility />
                                                            ) : (
                                                                <VisibilityOff />
                                                            )}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        {/* <CopyToClipboard
                                            text={ethwallet.privatekey}
                                            onCopy={() => setCopied(true)}
                                        >
                                            <Icon
                                                style={{
                                                    position: 'absolute',
                                                    marginLeft: '-30px',
                                                    marginTop: '20px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                content_copy
                                            </Icon>
                                        </CopyToClipboard> */}
                                    </Grid>
                                    {props.seedData && (
                                        <Grid item xs={12} md={12}>
                                            <TextField
                                                margin="dense"
                                                id="seed"
                                                label="Seed"
                                                type="text"
                                                value={props.seedData}
                                                fullWidth
                                                aria-readonly="true"
                                                color="primary"
                                            />
                                            <CopyToClipboard
                                                text={props.seedData}
                                                onCopy={() => setCopied(true)}
                                            >
                                                <Icon
                                                    style={{
                                                        position: 'absolute',
                                                        marginLeft: '-30px',
                                                        marginTop: '20px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    content_copy
                                                </Icon>
                                            </CopyToClipboard>
                                        </Grid>
                                    )}
                                    <div
                                        className="text-center"
                                        style={{
                                            marginLeft: 'auto',
                                            marginRight: 'auto',
                                            display: 'block',
                                        }}
                                    >
                                        {(props.plan == 'silver' ||
                                            props.plan == 'gold') && (
                                            <Button
                                                className="capitalize"
                                                variant="contained"
                                                color="primary"
                                                type="submit"
                                                onClick={() => setOpen(true)}
                                                disabled={progress}
                                            >
                                                Send payment
                                            </Button>
                                        )}
                                        {'  '}
                                        {forgotPassword || forgotStatus ? (
                                            <div>
                                                <center>
                                                    <CircularProgress
                                                        className={
                                                            classes.progress
                                                        }
                                                    />
                                                </center>
                                            </div>
                                        ) : (
                                            <>
                                                <Button
                                                    className="capitalize"
                                                    variant="contained"
                                                    color="primary"
                                                    type="submit"
                                                    onClick={() =>
                                                        setForgotPassword(true)
                                                    }
                                                >
                                                    Fogot password ?
                                                </Button>
                                                {'  '}
                                                <Button
                                                    className="capitalize"
                                                    variant="contained"
                                                    color="primary"
                                                    type="submit"
                                                    onClick={handlePopup}
                                                >
                                                    Top up TBN
                                                </Button>
                                            </>
                                        )}
                                        {'  '}
                                        {sync && (
                                            <Button
                                                className="capitalize"
                                                variant="contained"
                                                color="primary"
                                                type="submit"
                                                disabled={walletSyncProgress}
                                                onClick={() => syncWallet()}
                                            >
                                                Sync wallet
                                            </Button>
                                        )}
                                        {progress && (
                                            <>
                                                <center>
                                                    <CircularProgress
                                                        className={
                                                            classes.progress
                                                        }
                                                    />
                                                </center>
                                            </>
                                        )}
                                        {walletSyncProgress && (
                                            <>
                                                <center>
                                                    <CircularProgress
                                                        className={
                                                            classes.progress
                                                        }
                                                    />
                                                </center>
                                            </>
                                        )}
                                    </div>
                                </Grid>
                            </>
                        )}
                    </TabPanel>
                    <Card elevation={3} className="pt-5 mb-6">
            <div className="flex justify-between items-center px-6 mb-3">
                <span className="card-title">Payments
                    <Icon style={{
                        position: "absolute",
                        marginLeft: "20px",
                    }}
                        variant="outlined"
                        onClick={payhandleRefresh}
                    >refresh</Icon>
                </span>
                <Select size="small" defaultValue="this_month" disableUnderline>
                    <MenuItem value="this_month">This Month</MenuItem>
                    <MenuItem value="last_month">Last Month</MenuItem>
                </Select>
            </div>
            <Table
                id="payment-table"
                style={{ width: "100%" }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell style={{ whiteSpace: "nowrap" }}>
                            SNo.
                        </TableCell>
                        <TableCell style={{ whiteSpace: "nowrap" }}>
                            From
                        </TableCell>
                        <TableCell style={{ whiteSpace: "nowrap" }}>
                            To
                        </TableCell>
                        <TableCell style={{ whiteSpace: "nowrap" }}>
                            Amount
                        </TableCell>
                        <TableCell style={{ whiteSpace: "nowrap" }}>
                            Transaction
                        </TableCell>
                    </TableRow>
                </TableHead>
                {!status ?
                    <div>
                        <CircularProgress />
                    </div>
                    :
                    <TableBody>
                        {/**
                             * shown all payments data
                             */}
                        {payments ?
                            Object.keys(payments).map((item, i) => (
                                <TableRow key={i} hover>
                                    <TableCell
                                        className="px-0 capitalize"
                                        align="left"
                                        style={{ whiteSpace: "nowrap" }}
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
                                        style={{ whiteSpace: "nowrap" }}
                                    >
                                        {payments[item].from}
                                    </TableCell>
                                    <TableCell
                                        className="px-0 capitalize"
                                        align="left"
                                        style={{ whiteSpace: "nowrap" }}
                                    >
                                        {payments[item].to}
                                    </TableCell>
                                    <TableCell
                                        className="px-0 capitalize"
                                        align="left"
                                        style={{ whiteSpace: "nowrap" }}
                                    >
                                        {payments[item].value}
                                    </TableCell>
                                    <TableCell
                                        className="px-0 capitalize"
                                        align="left"
                                        style={{ whiteSpace: "nowrap" }}
                                    >
                                        <a href={`https://testnet.bscscan.com/tx/${payments[item].blockHash}`} target="_blank">
                                            {payments[item].blockHash}
                                        </a>
                                    </TableCell>
                                </TableRow>
                            ))
                            :
                            ""
                        }
                    </TableBody>
                }
            </Table>

        </Card>
                </SwipeableViews>
            </Box>
        </div>
    )
}
