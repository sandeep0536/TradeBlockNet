import React from "react";
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import {
    Grid,
    Button,
} from '@material-ui/core'
import { useEffect } from "react";
import { Box, InputLabel, MenuItem, FormControl, Select } from "@material-ui/core";
import Web3 from "web3";
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS } from "ServerConfig";
import { Link } from "@material-ui/core";
import { confirmAlert } from 'react-confirm-alert';
import PasswordPopup from "./PasswordPopup";
import TextField from '@material-ui/core/TextField'
import crypt from "crypto-js";
import { ipfs } from "../../../views/material-kit/projecttest/filecomponents/DLTcomponents/Web3/ipfs";

let wallet;
let rows = [];
let upload = [];
let receive = [];
let receiveHash = [];

const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));
export default function PrintPopup(props) {
    const [download, setDownload] = React.useState(false);
    const [project, setProject] = React.useState('');
    const [selectFile, setSelectFile] = React.useState('');
    const [open, setOpen] = React.useState(true);
    const [status, setStatus] = React.useState(false);
    const [receiveStatus, setReceiveStatus] = React.useState(false);

    const handleFileChange = (event) => {
        setSelectFile(event.target.value);
    };
    useEffect(() => {
        (async () => {
            try {
                rows = [];
                upload = [];
                receive = [];
                receiveHash = [];
                const data = JSON.parse(localStorage.getItem("did_data"));
                wallet = data.wallet;
                await getFiles()
            } catch (e) { }
        })()
    })
    const getFiles = async () => {
        try {
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                from: wallet.walletaddress,
                gasLimit: "0x200b20",
            });

            const uploadHash = await contract.methods.getAllFilesUploadedByUser(wallet.walletaddress).call({
                from: wallet.walletaddress,
            })
            for (let i = 0; i < uploadHash.length; i++) {
                upload[i] = uploadHash[i];
                rows.push(await contract.methods.getFileMetaData(uploadHash[i]).call({
                    from: wallet.walletaddress,
                }))
            }

            await contract.methods.getFileHashForReciever(wallet.walletaddress).call({
                from: wallet.walletaddress
            })
                .then((res) => {
                    for (let i = 0; i < res.length; i++) {
                        receiveHash[i] = res[i];
                        contract.methods.getParticularFile(res[i]).call({
                            from: wallet.walletaddress,
                        })
                            .then((response) => {
                                receive.push(response)
                            })
                    }
                })
            setInterval(() => {
                if (rows.length > 0)
                    setStatus(true)
                if (receive.length > 0)
                    setReceiveStatus(true)
            }, 100)
        } catch (e) {
            console.log(e)
        }
    }

    const submit = () => {
        const password = document.getElementById("file-password").value;
        setOpen(props.close)
        confirmAlert({
            title: 'Confirm to download',
            message: 'Are you sure to download file',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => downloadFile(password)
                },
                {
                    label: 'No',
                    onClick: () => ""
                }
            ]
        });
    };
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

    function downloadFile(password) {
        if (password != "") {
            try {
                const decPrivate = crypt.AES.decrypt(wallet.privatekey, password).toString(crypt.enc.Utf8);
                if (decPrivate.length > 0) {
                    ipfs.files.get(selectFile.split("-")[0], async function (err, files) {
                        try {
                            Array.from(files).forEach((file) => {
                                let decryptedData = crypt.AES.decrypt(file.content.toString("binary"), decPrivate);
                                var typedArray = convertWordArrayToUint8Array(decryptedData);

                                var url1 = window.URL.createObjectURL(new Blob([typedArray], { type: selectFile.split("-")[1] }));
                                var a = document.createElement("a");
                                document.body.appendChild(a);
                                a.style = "display: none";
                                a.href = url1;
                                a.download = selectFile.split("-")[2];
                                a.click();
                                window.URL.revokeObjectURL(url1);
                            })
                        } catch (e) {
                            console.log(e)
                        }
                    })
                } else {
                    alert("your password may be wrong")
                }
            } catch (e) {
                alert("something went wrong")
                console.log(e)
            }
        } else {
            alert("please enter password");
        }
    }

    return (
        <div>
            <Dialog
                open={open}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title" >Print file</DialogTitle>

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
                                    status && rows.length != 0 &&
                                    Object.keys(rows).map((key, i) => (
                                        <MenuItem value={upload[i] + "-" + rows[i].fileExt + "-" + rows[i].fileName}>{rows[i].fileName}</MenuItem>
                                    ))
                                }
                                {
                                    receiveStatus && receive.length != 0 &&
                                    Object.keys(receive).map((key, i) => (
                                        <MenuItem value={receiveHash[i] + "-" + receive[i].extension + "-" + receive[i].fileName}>{receive[i].fileName}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                        <TextField
                            margin="dense"
                            id="file-password"
                            label="file password"
                            type="password"
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={props.close}
                    >
                        Cancel
                    </Button>
                    <Button disabled={selectFile == ""} onClick={() => submit()}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}