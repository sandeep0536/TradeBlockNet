import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import React, { useState, useEffect, useCallback } from "react";
import Button from "components/CustomButtons/Button.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import { KeyGeneratorAction } from "actions/KeyGeneratorAction";
import EthCrypto from "eth-crypto";
import { generateMnemonic, EthHdWallet } from "eth-hd-wallet"
import crypt from "crypto-js";
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import AdminNavbarLinks from "components/Navbars/AdminNavbarLinks";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        '& > *': {
            margin: theme.spacing(0.5),
        },
    },
}));
export const WalletPopup = ({ hide, onSeedChange }) => {
    const classes = useStyles();
    const [seed, setSeed] = useState(false);
    const [seed1, setSeed1] = useState("");
    const [seed2, setSeed2] = useState("");
    const [seed3, setSeed3] = useState("");
    const [seed4, setSeed4] = useState("");
    const [seed5, setSeed5] = useState("");
    const [seed6, setSeed6] = useState("");
    const [seed7, setSeed7] = useState("");
    const [seed8, setSeed8] = useState("");
    const [seed9, setSeed9] = useState("");
    const [seed10, setSeed10] = useState("");
    const [seed11, setSeed11] = useState("");
    const [seed12, setSeed12] = useState("");
    const [btnDisable, setbtnDisable] = useState(false);
    const [walletName, setWalletName] = useState("");
    const generateWallet = () => {
        setbtnDisable(true)
        /* const password = document.getElementById("private-password").value;
         if (password == "") { alert("please enter password") }
         else {
           const mnemonic = generateMnemonic();
           localStorage.setItem("seed", mnemonic)
           const wallet = EthHdWallet.fromMnemonic(mnemonic)
           const [address] = wallet.generateAddresses(1)
           const privateKey = "0x" + (wallet.getPrivateKey(address).toString('hex'))
           const publicKey = EthCrypto.publicKeyByPrivateKey(
             privateKey
           );
           const encPrivate = crypt.AES.encrypt(privateKey, "" + password)
           localStorage.setItem("privateKey", encPrivate)
           localStorage.setItem("publicKey", publicKey)
           window.location.reload()
         }
         */
        const walletName = document.getElementById("wallet-user-name").value;
        const walletPassword = document.getElementById("wallet-password").value;
        if (localStorage.publicKey == null) {
            if (walletName == "" || walletPassword == "") {
                alert("please enter valid details");
            }
            else {
                const mnemonic = generateMnemonic();
                const seedValue = mnemonic.split(" ")
                setSeed(true)
                setSeed1(seedValue[0])
                setSeed2(seedValue[1])
                setSeed3(seedValue[2])
                setSeed4(seedValue[3])
                setSeed5(seedValue[4])
                setSeed6(seedValue[5])
                setSeed7(seedValue[6])
                setSeed8(seedValue[7])
                setSeed9(seedValue[8])
                setSeed10(seedValue[9])
                setSeed11(seedValue[10])
                setSeed12(seedValue[11])
                const wallet = EthHdWallet.fromMnemonic(mnemonic)
                const [address] = wallet.generateAddresses(1)
                const privateKey = "0x" + (wallet.getPrivateKey(address).toString('hex'))
                const publicKey = EthCrypto.publicKeyByPrivateKey(
                    privateKey
                );
                const encPrivate = crypt.AES.encrypt(privateKey, "" + walletPassword)
                localStorage.setItem("privateKey", encPrivate)
                localStorage.setItem("publicKey", publicKey)
                localStorage.setItem("address", address)
                localStorage.setItem("walletName", walletName)
                localStorage.setItem("walletType", "user")
                setSeed(true)
                setWalletName(walletName)
                setInterval(function () {
                    document.getElementById("wallet-name").innerHTML = localStorage.getItem("walletName");
                }, 1000)
            }
        }
        else {
            alert("Sorry,Wallet already generated")
        }
    }

    return (
        <Dialog
            open={true}
            TransitionComponent={Transition}
            keepMounted
            onClose={hide}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle id="alert-dialog-slide-title">
                {"Enter Wallet Details"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    <CustomInput
                        labelText="Wallet Name"
                        id="wallet-user-name"
                        inputProps={{
                            defaultValue: "",
                        }}
                        formControlProps={{
                            fullWidth: true,
                        }}
                    />
                    <CustomInput
                        labelText="Wallet Password"
                        id="wallet-password"
                        formControlProps={{
                            fullWidth: true,
                        }}
                        inputProps={{
                            type: "password",
                        }}
                    />
                </DialogContentText>
            </DialogContent>
            <DialogActions>

                <Button onClick={() => generateWallet()} color="primary"
                    id="generate-btn" disabled={btnDisable}>
                    Generate Wallet
                </Button>
                <Button onClick={hide} color="primary">
                    Close
                </Button>
                <br />
            </DialogActions>
            <GridContainer>
                <GridItem xs={6} sm={12} md={12}>
                    {seed ?
                        <div className={classes.root}>
                            <Chip label={seed1} />
                            <Chip label={seed2} />
                            <Chip label={seed3} />
                            <Chip label={seed4} />
                            <Chip label={seed5} />
                            <Chip label={seed6} />
                        </div>
                        : ""
                    }
                </GridItem>
                <GridItem xs={6} sm={12} md={12}>
                    {seed ?
                        <div className={classes.root}>
                            <Chip label={seed7} />
                            <Chip label={seed8} />
                            <Chip label={seed9} />
                            <Chip label={seed10} />
                            <Chip label={seed11} />
                            <Chip label={seed12} />
                        </div>
                        : ""
                    }
                </GridItem>
            </GridContainer>

        </Dialog >
    );
}