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
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from "app/components/MatxLayout/SnackbarComponent";
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
import { getNonce } from "./web3Functions/Web3Functions";
import { isArray } from "lodash";
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
let fileid
const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));

export default function ShareFilePopup(props) {
    // console.log("props.fileId",props.fileId)
    fileid = props.fileId
    // console.log("fileid",fileid)
    const classes = useStyles()
  
    const [selectedDate, setSelectedDate] = React.useState(Date.now());
    const [selected, setSelected] = useState([]);
    const [userShareValue, setUserShareValue] = useState([]);
    const [dateTime, setDateTime] = useState(null);
    const [userData, setUserData] = useState([])
    const [error, setError] = useState(null)
    const [warning, setWarning] = useState(null)


    // console.log("sandeep",userData)
    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("did_data"));
        wallet = data.wallet;
        contacts = data.contact;
    })

    // console.log("sandeep123",contacts)

    useEffect(() => {
        ; (async () => {
            const data = JSON.parse(localStorage.getItem('did_data'))
            // console.log("companyData", data?.companyProfile);
            const comprofile = data?.companyProfile
            const usertoken = data.userToken
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
    function handleErrorClose() {
        setError(null)
    }
    function handleWarning() {
        setWarning(null)
    }
    const handleSelect = (event) => {
        try {
            // console.log('event.target',event.target)

            const { value } = event.target;
            if (value) {
                const data = JSON.parse(localStorage.getItem('did_data'))
                const data_user = data.wallet.useremail
                    if (value == data_user) {
                        setWarning("You cannot select yourself")
                    }
                    else {
                        // const userSelected = userData.filter((val, i) => {
                        //     // console.log("hello from", val.user_email, value[i])
                        //     if (value[i] == data_user) {
                        //         setWarning("You cannot select yourself")
                        //     }
                        //     else {
                        //         return val.user_email === value[i]
                        //     }
                        // })
                        const res = userData.filter(f => value.some(email => email === f.user_email));
                        // console.log("res",res)
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
    
    const handleDateChange = (date) => {
        const timestamp = new Date(Date.parse(date)).getTime() / 1000;
        setDateTime(timestamp)
        setSelectedDate(date);
    };

    const sendTransaction = async (hashing,serializedTx, length) => {
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
                    "event": "ShareFile",
                    "status": "PROGRESS"
                }),
            }
            await fetch(`${API_URL}/storetransaction`, opts)
        })
    }

    // console.log("res1",selected)
    const shareFile = async () => {
        props.anchor(null)
        globalNonce = await getNonce(wallet.walletaddress)
        const walletpassword = document.getElementById("file-password").value;
        const comment = document.getElementById("comment").value;
        // console.log(props.fileName)
        // console.log("selecte1",selected)
        if (selected.length === 0 || walletpassword === "" || comment === "" || dateTime === null) {
            const decPrivate = crypt.AES.decrypt(wallet.privatekey, walletpassword).toString(crypt.enc.Utf8);
            // console.log("private",decPrivate)
            props.error("please fill all details");
        }
        else {
            props.shareStatus(true);
            props.share(false)
            try {
                const decPrivate = crypt.AES.decrypt(wallet.privatekey, walletpassword).toString(crypt.enc.Utf8);
                if (decPrivate.length > 0) {
                    const privateKey = Buffer.from(decPrivate.slice(2), 'hex');
                    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                        from: wallet.walletaddress,
                        gasLimit: "0x200b20",
                    });
                    // console.log("selecte2",selected)
                    for (let i = 0; i < selected.length; i++) {
                        const randompassword = Math.random().toString(36).substring(2, 7);
                        ipfs.files.get(props.hash, (err, files) => {
                            Array.from(files).forEach((file) => {
                                let decryptedData = crypt.AES.decrypt(file.content.toString("binary"), decPrivate);
                                var encrypted = crypt.AES.encrypt(decryptedData, "" + randompassword).toString();
                                const bufferData = Buffer.from("" + encrypted);
                                ipfs.add(bufferData, async (err, ipfshash) => {
                                    await pinata.pinByHash(ipfshash[0].hash)
                                        .then(async (pinres) => {
                                            const signature = EthCrypto.sign(
                                                decPrivate,
                                                EthCrypto.hash.keccak256("" + randompassword)
                                            );
                                            const payload = {
                                                message: randompassword,
                                                signature
                                            };
                                            // console.log("select3",selected[i].user_key)
                                            const res = await EthCrypto.encryptWithPublicKey(
                                                selected[i].user_key,
                                                JSON.stringify(payload)
                                            )
                                            const encryptedPass = EthCrypto.cipher.stringify(res);
                                            const currtime = Math.round(new Date().getTime() / 1000);
                                            const common = COMMON;
                                            // console.log("select4",selected[i].user_address)
                                            const contractFunction = await contract.methods.shareFile(
                                                "" + fileid,
                                                selected[i].user_address,
                                                "" + ipfshash[0].hash
                                                , "" + encryptedPass,
                                                "" + dateTime,
                                                "" + currtime,
                                                "" + selected[i].user_email,
                                                "" + localStorage.getItem("userEmail"),
                                                props.fileName
                                                , "" + comment,
                                                "" + props.ext);
                                            const functionAbi = await contractFunction.encodeABI();
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
                                            await sendTransaction(props.hash,serializedTx, selected.length)
                                                .then(async (res) => {
                                                    sharecount++;
                                                    if (sharecount === selected.length) {
                                                        const opts = {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                            },
                                                            body: JSON.stringify({
                                                                "email": localStorage.getItem("userEmail"),
                                                                "action": 2,
                                                                "files": selected.length,
                                                            })
                                                        }
                                                        const res = await fetch(`${API_URL}/deducttokens`, opts);
                                                        res.json().then((response) => {
                                                            if (response.status === true) {
                                                                props.success("File Shared Successfully!!")
                                                                props.shareStatus(false)
                                                            }
                                                        })
                                                        sharecount = 0;
                                                    }
                                                })
                                                .catch((err) => {
                                                    props.error("Insuffient funds")
                                                    props.shareStatus(false)
                                                    console.log(err)
                                                })
                                        });
                                })
                            })
                        })
                    }
                } else {
                    props.shareStatus(false)
                    props.error("your password may be wrong")
                }
            } catch (e) {
                props.shareStatus(false)
                console.log(e)
                props.error("something went wrong")
            }
        }
    }
    // console.log("userData", userData)
    return (
        <Dialog
            open={props.status}
            onClose={props.close}
            aria-labelledby="form-dialog-title"
        >
            <RoleWarningPopup
                status={warning != null}
                close={handleWarning}
                content={warning}
                title={'Select Warning'}
            />
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
            <DialogTitle id="form-dialog-title">Share File</DialogTitle>
            <DialogContent>
                <Grid item>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="id"
                        label="File Id"
                        type="text"
                        value={fileid}
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
                <br></br>
                <br></br>
                <GridContainer>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <GridItem>
                            <KeyboardDateTimePicker
                                key={selectedDate}
                                value={selectedDate}
                                onChange={handleDateChange}
                                label="Revoke Document Date"
                                minDate={new Date("2018-01-01T00:00")}
                                format="dd/MM/yyyy hh:mm a"
                            />
                        </GridItem>
                    </MuiPickersUtilsProvider>
                    <GridItem>
                        <CustomInput
                            labelText="wallet password"
                            id="file-password"
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
                    onClick={props.close}
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
    );
}