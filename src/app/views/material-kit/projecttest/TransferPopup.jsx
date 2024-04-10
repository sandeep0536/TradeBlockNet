import React, { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'
import { Breadcrumb } from 'app/components'
import GridItem from '../projecttest/filecomponents/DLTcomponents/Grid/GridItem'
import { DropzoneArea } from 'material-ui-dropzone';
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
    Checkbox,
    InputLabel,
    ListItemIcon,
    ListItemText,
    FormControl,
    Select
} from "@material-ui/core";
import RoleWarningPopup from './RoleWarningPopup'
import { MenuProps } from "../projecttest/filecomponents/utils";
import GridContainer from "../projecttest/filecomponents/DLTcomponents/Grid/GridContainer";
import CustomInput from "../projecttest/filecomponents/DLTcomponents/CustomInput/CustomInput";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { KeyboardDateTimePicker } from "@material-ui/pickers";
import EthCrypto from 'eth-crypto'
import { API_URL, PINATA_API_KEY, PINATA_SECRET_KEY, COMMON } from "ServerConfig";
import { ipfs } from "../projecttest/filecomponents/DLTcomponents/Web3/ipfs";
import crypt from "crypto-js";
import Web3 from "web3";
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS } from "ServerConfig";
import pinataSDK from '@pinata/sdk';
import ResponsiveDialog from "../dialog/ResponsiveDialog"
import { removeTransferHash } from "./StoreDataDid";
import WaitSnackbar from "./filecomponents/WaitSnackbar"
import { getNonce } from "./web3Functions/Web3Functions";
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
let contacts = [];
let wallet;
let sharecount = 0;
let globalNonce = 0;
const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));

export default function TransferPopup(props) {
    const classes = useStyles()

    const [userPassword, setUserPassword] = useState(null)
    const [selected, setSelected] = useState([]);
    const [confirmPopup, setConfirmPopup] = useState(false);
    const [transferProgress, setTransferProgress] = useState(false);
    const [userData, setUserData] = useState([])
    const [userShareValue, setUserShareValue] = useState([])
    const [warning,setWarning] = useState(null)
    useEffect(() => {
        try {
            const data = JSON.parse(localStorage.getItem("did_data"));
            wallet = data.wallet;
            contacts = data.contact;
        } catch (e) { }
    })
    useEffect(() => {
        ; (async () => {
            const data = JSON.parse(localStorage.getItem('did_data'))
            const usertoken = data.userToken
            // console.log("companyData", data?.companyProfile);
            const comprofile = data?.companyProfile
            let data24 = localStorage.getItem('did_data')
            let data23 = JSON.parse(data24)
            const useremail = data23.wallet.useremail
            if (usertoken) {
                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "token": usertoken,
                        "useremail": useremail
                    }),
                }
                const responsed = await fetch(`${API_URL}/fetchcontactParent`, opts);
                //  console.log("resss",responsed.json())


                await responsed.json()
                    // console.log("resppp",res)
                    // console.log(res)
                    .then((response) => {
                        // console.log("not error")
                        setUserData(JSON.parse(response?.result))
                    }).catch((e) => {
                        console.log(e)
                    })
            }
            else if (
                comprofile == null ||
                comprofile == undefined
            ){
               
                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "useremail": useremail,
                    }),
                }
                const response = await fetch(`${API_URL}/fetchcontact`, opts);

                await response.json()
                    // console.log("resppp",res)
                    .then((res) => {
                        setUserData(JSON.parse(res?.result))
                    }).catch((e) => {
                        console.log(e)
                    })
            }
            else {
                const companyData = JSON.parse(
                    data?.companyProfile[localStorage.getItem('userEmail')]
                )

                const companytoken = companyData?.companyToken
                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "token": companytoken,
                        "useremail": useremail,
                    }),
                }
                const response = await fetch(`${API_URL}/fetchcontact`, opts);

                await response.json()
                    // console.log("resppp",res)
                    .then((res) => {
                        setUserData(JSON.parse(res?.result))
                    }).catch((e) => {
                        console.log(e)
                    })
            }

            
        })()

    }, []);
    const handleSelect = (event) => {
        try {
            // console.log('event.target',event.target)

            const { value } = event.target;
            // console.log('event.target',value)

            if (value) {
                const data = JSON.parse(localStorage.getItem('did_data'))
                const data_user = data.wallet.useremail
                    if (value == data_user) {
                        setWarning("You cannot select yourself")
                    }
                    else {
                        // console.log("userData",userData);
                        // const userSelected = userData.map((val, i) => {
                        //     // console.log("hello from", val.user_email, value[i])
                        //     if (value[i] == data_user) {
                        //         setWarning("You cannot select yourself")
                        //     }
                        //     else {
                        //         console.log("value" , val);
                        //         // return val.user_email === value[i]
                        //         const res = arr.filter(f => brr.some(item => item.id === f.id));
                        //         newFunc(val.user_email);
                        //     }
                        // })

                        const res = userData.filter(f => value.some(email => email === f.user_email));
                        // console.log("res" ,res)
                        setSelected(res)
                        setUserShareValue(value)
                    
                }
                
            }
        }
        // console.log('event.target',value.user_email)

        catch (e) {
            console.log(e)
        }
    }
    // console.log("userData",selected);
 
    function handleConfirm() {
        setConfirmPopup(!confirmPopup)
    }
    function handleWarning() {
        setWarning(null)
    }
    function handleTransferProgress() {
        setTransferProgress(!transferProgress)
    }
    const sendTransaction = async (hashing,serializedTx, decPrivate, length) => {
        return web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', async (receipt) => {
            const blockno = receipt.blockNumber;
            const transactionHash = receipt.transactionHash;
            const opts = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "fileHash": hashing,
                    "hash": transactionHash,
                    "bnumber": blockno,
                    "event": "TransferOwnership",
                    "status": "PROGRESS"
                }),
            }
            await fetch(`${API_URL}/storetransaction`, opts)
            // await pinata.unpin(hash)
        })
    }
    // console.log("selected",selected)
    async function transferConfirmation() {
        props.close()
        handleConfirm();
        try {
            globalNonce = await getNonce(wallet.walletaddress);
            const password = userPassword;
            const common = COMMON;
            if (password == "")
                props.error("please enter password")
            else {
                const decPrivate = crypt.AES.decrypt(wallet.privatekey, password).toString(crypt.enc.Utf8);
                if (decPrivate.length < 1)
                    props.error("your password may be wrong");
                else {
                    // console.log("hello from else")
                    props.anchor(null)
                    setTransferProgress(true)
                    for (let i = 0; i < selected.length; i++) {
                        ipfs.files.get(props.hash, async function (err, files) {
                            // console.log("functionAbi1",files)
                            Array.from(files).forEach(async (file) => {
                                // console.log("functionAbi2",file)
                                try {
                                    let decryptedData = crypt.AES.decrypt(file.content.toString("binary"), decPrivate);
                                    // console.log("functionAbi3",decryptedData)
                                    const signature = EthCrypto.sign(
                                        decPrivate,
                                        EthCrypto.hash.keccak256(decryptedData)
                                    );
                                    // console.log("functionAbi4",signature)
                                    const payload = {
                                        message: decryptedData,
                                        signature
                                    };
                                    const res = await EthCrypto.encryptWithPublicKey(
                                        "" + selected[i].user_key,
                                        JSON.stringify(payload)
                                    )
                                    const encryptedPass = EthCrypto.cipher.stringify(res);
                                    // console.log("functionAbi55",encryptedPass)
                                    const bufferData = Buffer.from(encryptedPass);
                                    // console.log("functionAbi5",bufferData)
                                    ipfs.add(bufferData, async (err, ipfshash) => {
                                        await pinata.pinByHash(ipfshash[0].hash)
                                            .then(async (res) => {
                                                const privateKey = Buffer.from(decPrivate.slice(2), 'hex');
                                                const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                                                    from: wallet.walletaddress,
                                                    gasLimit: "0x200b20"
                                                });
                                                const contractFunction = contract.methods.transferOwnership(props.hash, ipfshash[0].hash, selected[i].user_address);
                                                // console.log("functionAbi6",contractFunction)
                                                const functionAbi = await contractFunction.encodeABI();
                                                // console.log("functionAbi7",functionAbi)
                                                const txParams = {
                                                    nonce: globalNonce++,
                                                    gasPrice: "0x4a817c800",
                                                    gasLimit: "0x67c280",//0x200b20, //50000,
                                                    to: CONTRACT_ADDRESS,
                                                    data: functionAbi,
                                                    value: "0x00",
                                                    from: wallet.walletaddress
                                                };
                                                const tx = new Tx(txParams, { common });
                                                tx.sign(privateKey); // Transaction Signing here
                                                const serializedTx = tx.serialize();
                                                await sendTransaction(props.hash,serializedTx, decPrivate, selected.length)
                                                    .then(async (res) => {
                                                        await removeTransferHash(props.project, props.hash, wallet.walletaddress, decPrivate)
                                                        const opts = {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                            },
                                                            body: JSON.stringify({
                                                                "email": localStorage.getItem("userEmail"),
                                                                "action": 3,
                                                                "files": 1,
                                                            })
                                                        }
                                                        const resdeduct = await fetch(`${API_URL}/deducttokens`, opts);
                                                        // console.log("resdeduct",resdeduct.json)
                                                        resdeduct.json().then((response) => {
                                                            if (response.status === true) {
                                                                window.location.reload()
                                                                setTransferProgress(false)
                                                                props.success("Ownership transferred")
                                                            }
                                                        })
                                                    })
                                                    .catch((err) => {
                                                        props.error("Insuffient funds")
                                                        setTransferProgress(false)
                                                        console.log(err)
                                                    })
                                            })
                                    })
                                } catch (e) {
                                    setTransferProgress(false)
                                    props.error("something went wrong");
                                    console.log(e)
                                }
                                // var typedArray = convertWordArrayToUint8Array(decryptedData);
                                // var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: hash[4] + "/" + hash[5] }));
                            })
                        })
                    }
                }
            }
        } catch (e) {
            setTransferProgress(false)
            props.error("something went wrong");
            console.log(e)
        }
    }

    // console.log("select",userData)
    return (
        <div>
            <ResponsiveDialog status={confirmPopup} close={handleConfirm}
                header={"File Ownership Transfer Confirmation"}
                content={"Are you sure to transfer this file ?"}
                submit={transferConfirmation}
            />
            <RoleWarningPopup
                status={warning != null}
                close={handleWarning}
                content={warning}
                title={'Select Warning'}
            />
            <Dialog
                open={props.status}
                onClose={props.close}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Transfer Ownership</DialogTitle>
                <DialogContent>
                    <Grid item>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="file-password"
                            label="Wallet Password"
                            type="password"
                            onChange={(e) => setUserPassword(e.target.value)}
                            fullWidth
                            color="primary"
                        />
                    </Grid>
                    <FormControl className={classes.formControl}>
                        <InputLabel id="mutiple-select-label">Choose contacts</InputLabel>
                        <Select
                            labelId="mutiple-select-label"
                            multiple
                            value={userShareValue}
                            onChange={handleSelect}
                            renderValue={(selected) => selected.join(", ")}
                            MenuProps={MenuProps}
                        >
                            {userData && userData.map((row, i) => (
                                <MenuItem key={i} value={row.user_email}>
                                    <ListItemIcon>
                                        <Checkbox checked={userShareValue.indexOf(row?.user_email) > -1}></Checkbox>

                                    </ListItemIcon>
                                    <ListItemText primary={row?.user_name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={props.close}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        onClick={handleConfirm}
                    >
                        Transfer
                    </Button>
                </DialogActions>
            </Dialog>
            {transferProgress &&
                <div>
                    <center>
                        <CircularProgress className={classes.progress} />
                    </center>
                    <WaitSnackbar
                        message={"please wait while file transfer"}
                    ></WaitSnackbar>
                </div>
            }
        </div>
    );
}