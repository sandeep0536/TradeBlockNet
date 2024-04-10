import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import React, { useState, useEffect } from "react";
import Button from "components/CustomButtons/Button.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import {
    META_DATA_ABI,
    META_DATA_ADDRESS,
    ACCOUNT,
    PRIVATE_KEY
} from "components/Web3/config.js";
import crypt from "crypto-js";
import EthCrypto, { publicKey } from 'eth-crypto'

import Web3 from "web3";
let globalNonce = 0;

const Tx = require("ethereumjs-tx").Transaction;
const web3 = new Web3(new Web3.providers.HttpProvider(
    'https://ropsten.infura.io/v3/26b91494ef884ebfaa8bdd40c0919c28'
));;
const contract = new web3.eth.Contract(META_DATA_ABI, META_DATA_ADDRESS, {
    from: ACCOUNT,
    gasLimit: "0x200b20",
});

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const getNonce = () => {
    /* web3.eth.getTransactionCount(ACCOUNT).then(_nonce => {
         globalNonce = _nonce;
         console.log("lll" + _nonce)
         return _nonce;
     });
     */
}
const ShowPopup = (props) => {
    const [open, setOpen] = useState(true);
    const [reject, setReject] = useState(false);
    const handleClose = () => {
        setOpen(false);
    };
    const setValidationStatus = async (hash, status, reason) => {
        try {
            const password = document.getElementById("password").value;
            console.log("globalNonce " + globalNonce)
            if (password == "") alert("please enter wallet password");
            else {
                const decPrivate = crypt.AES.decrypt(localStorage.getItem("privatekey"), password).toString(crypt.enc.Utf8);
                const privateKey = Buffer.from(decPrivate.slice(2), 'hex');
                if (status == "Reject") {
                    const rejectReason = document.getElementById("reason").value;
                    if (rejectReason == "") {
                        alert("please enter any reason for rejection");
                    } else {
                        web3.eth.getTransactionCount(ACCOUNT).then(_nonce => {
                            let nonceValue = _nonce;
                            const contractFunction = contract.methods.setStatus(hash, status, rejectReason);
                            const functionAbi = contractFunction.encodeABI();
                            const txParams = {
                                nonce: nonceValue,
                                gasPrice: "0x4a817c800",//2100000
                                gasLimit: "0x200b20",//2100000, //50000,
                                to: META_DATA_ADDRESS,
                                data: functionAbi,
                                value: "0x00",
                                from: ACCOUNT
                            };
                            const tx = new Tx(txParams, { chain: 'ropsten' });
                            tx.sign(privateKey); // Transaction Signing here
                            const serializedTx = tx.serialize();
                            web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', receipt => {
                                setOpen(false)
                            })
                        });
                    }
                } else {
                    const acceptReason = document.getElementById("reason").value;
                    if (acceptReason != "") {
                        reason = acceptReason;
                    }
                    web3.eth.getTransactionCount(ACCOUNT).then(_nonce => {
                        let nonceValue = _nonce;
                        const contractFunction = contract.methods.setStatus(hash, status, reason);
                        const functionAbi = contractFunction.encodeABI();
                        const txParams = {
                            nonce: nonceValue,
                            gasPrice: "0x4a817c800",//2100000
                            gasLimit: "0x200b20",//2100000, //50000,
                            to: META_DATA_ADDRESS,
                            data: functionAbi,
                            value: "0x00",
                            from: ACCOUNT
                        };
                        const tx = new Tx(txParams, { chain: 'ropsten' });
                        tx.sign(privateKey); // Transaction Signing here
                        const serializedTx = tx.serialize();

                        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', receipt => {
                            console.log(receipt)
                            setOpen(false)
                        })
                    });
                }
            }
        } catch (err) {
            alert(err)
            setOpen(false)
        }
    }
    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            onClose={handleClose}
            keepMounted
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
            fullWidth={true}
            maxWidth={"md"}
        >
            <DialogTitle id="alert-dialog-slide-title">
                {"FileDetails"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    <CustomInput
                        labelText="Enter HomeLoan Wallet Password"
                        id="password"
                        formControlProps={{
                            fullWidth: true,
                        }}
                        inputProps={{
                            type: "password",
                        }}
                    />
                    <CustomInput
                        labelText="Enter Reason"
                        id="reason"
                        formControlProps={{
                            fullWidth: true,
                        }}
                    />

                    <p><b>FileHash : </b>{props.hash}</p>
                    <p><b>From : </b>{props.from}</p>
                    <p><b>To : </b>{"HomeLoan"}</p>
                    <p><b>Date : </b>{props.date}</p>
                    <p><b>Time : </b>{props.time}</p>
                    <p><b>Comment : </b>{props.comment}</p>
                    {props.fileExt == "gif" || props.fileExt == "jpg" || props.fileExt == "png" ?
                        <img src={props.fileData} ></img>
                        : <iframe src={props.fileData} frameborder="0" allowfullscreen
                            width="100%" height="900px"></iframe>
                    }
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { setValidationStatus(props.hash, "Accept", "Valid") }} color="primary">
                    Accept
                </Button>
                <Button onClick={() => { setValidationStatus(props.hash, "Reject", "") }} color="primary">
                    Reject
                </Button>
                <Button onClick={handleClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog >
    );


}
export default ShowPopup;