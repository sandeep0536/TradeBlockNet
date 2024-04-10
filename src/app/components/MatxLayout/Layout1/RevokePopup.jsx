import React, { useState } from "react";
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { makeStyles } from "@material-ui/styles";
import { KeyboardDateTimePicker } from "@material-ui/pickers";
import {
    Grid,
    Button,
} from '@material-ui/core'
import { useEffect } from "react";
import { Box, InputLabel, MenuItem, FormControl, Select } from "@material-ui/core";
import Web3 from "web3";
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS, COMMON } from "ServerConfig";
import crypt from "crypto-js";
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from "../SnackbarComponent";
import clsx from 'clsx'
import TextField from '@material-ui/core/TextField'
import Common from 'ethereumjs-common';
import { lightBlue } from "@material-ui/core/colors";
import { DateTimePicker } from "@material-ui/pickers";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import WaitSnackbar from "../WaitSnackbar"
import { getNonce } from "app/views/material-kit/projecttest/web3Functions/Web3Functions";
const muiTheme = createMuiTheme({
    spacing: 2,
});
const Tx = require("ethereumjs-tx").Transaction;
const common = COMMON;

let wallet;
let globalNonce;
let rows = [];
let shareDID = [];
let shareHash = [];

const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));
const useStyles = makeStyles(({ palette, ...theme }) => ({
    dateHeader: {
        'MuiPickersToolbar-toolbar': {
            backgroundColor: '#1976d2 !important'
        }
    }
}));

export default function RevokePopup(props) {
    const classes = useStyles();
    const [selectFile, setSelectFile] = React.useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null)
    const [close, setClose] = useState(true)
    const [wait, setWait] = useState(false)

    const [selectedDate, setSelectedDate] = React.useState(Date.now());

    const [status, setStatus] = React.useState(false);
    const handleDateChange = (date) => {
        const timestamp = new Date(Date.parse(date)).getTime() / 1000;
        setSelectedDate(date);
    };

    const handleFileChange = (event) => {
        setSelectFile(event.target.value);
    };
    function handleSnackbarClose(event, reason) {
        if (reason === 'clickaway') {
            return
        }
        setSuccess(null)
    }
    function handleErrorClose(event, reason) {
        setError(null)
    }

    async function revokeFileReceiver() {
        const timestamp = new Date(Date.parse(selectedDate)).getTime() / 1000;
        let decPrivate;
        const password = document.getElementById("password").value;
        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
            from: wallet.walletaddress,
            gasLimit: "0x200b20",
        });
        globalNonce = await getNonce(wallet.walletaddress)
            .catch((e) => {
                setWait(false)
                console.log(e)
            })
        try {
            decPrivate = crypt.AES.decrypt(wallet.privatekey, password).toString(crypt.enc.Utf8);
        } catch (e) {
            setWait(false)
            setError("your password may be wrong")
        }
        if (decPrivate.length <= 0) {
            setWait(false)
            setError("your password may be wrong")
        } else {
            setClose(false)
            setWait(true)
            const privateKey = Buffer.from(decPrivate.slice(2), 'hex');
            const contractFunction = contract.methods.revokeFile(
                selectFile,
                "" + timestamp
            );
            const functionAbi = await contractFunction.encodeABI();
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
            return web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', async (receipt) => {
                setWait(false)
                setSuccess("File Revoked successfully")
            })
        }
    }
    useEffect(() => {
        try {
            rows = [];
            const data = JSON.parse(localStorage.getItem("did_data"));
            wallet = data.wallet;
            getFiles()
        } catch (e) { }
    })

    const getFiles = async (project) => {
        try {
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                from: wallet.walletaddress,
                gasLimit: "0x200b20",
            });
            const sharehash = await contract.methods.getAllSharedHash(wallet.walletaddress).call({
                from: wallet.walletaddress,
            })
            for (let i = 0; i < sharehash.length; i++) {
                shareHash[i] = sharehash[i];
                rows.push(await contract.methods.getFileDetails(sharehash[i]).call({
                    from: wallet.walletaddress,
                }))
                // shareDID.push(await contract.methods.getFileIdByShareHash(sharehash[i]).call({
                //     from: wallet.walletaddress,
                // }))
            }
            setStatus(true)
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <div>

            <Dialog
                open={close}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title" >Revoke File</DialogTitle>

                <DialogContent style={{ minWidth: "300px" }}>
                    <Box sx={{ minWidth: 420 }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Select File</InputLabel>
                            <Select
                                labelId="demo-simple-select-label-file"
                                id="demo-simple-select-file"
                                value={selectFile}
                                label="Select File"
                                fullWidth
                                onChange={handleFileChange}
                            >
                                {
                                    status &&
                                    Object.keys(rows).map((key, i) => (
                                        <MenuItem value={shareHash[i]} key={rows[i].fileName}>{rows[i].fileName}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Box>
                    <br />
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <ThemeProvider theme={muiTheme}>
                            <DateTimePicker
                                renderInput={(props) => <TextField {...props} />}
                                label="Revocation Date"
                                value={selectedDate}
                                onChange={(date) => handleDateChange(date)}
                                fullWidth
                            />
                        </ThemeProvider>
                    </MuiPickersUtilsProvider>
                    <TextField
                        margin="dense"
                        id="password"
                        label="Wallet password"
                        type="password"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={props.close}
                    >
                        Cancel
                    </Button>
                    <Button onClick={revokeFileReceiver}>
                        Submit
                    </Button>
                </DialogActions>

            </Dialog>
            {wait &&
                <WaitSnackbar
                    message={"please wait while file revoke"}
                ></WaitSnackbar>
            }
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
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
                    horizontal: 'right',
                }}
                open={error != null}
                autoHideDuration={3000}
                onClose={handleErrorClose}
            >
                <MySnackbarContentWrapper
                    onClose={handleErrorClose}
                    variant="error"
                    message={error}
                />
            </Snackbar>

        </div >
    );
}