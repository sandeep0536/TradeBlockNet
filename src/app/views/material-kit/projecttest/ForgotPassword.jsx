import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { Grid, Button } from '@material-ui/core'
import GridContainer from './filecomponents/DLTcomponents/Grid/GridContainer'
import CustomInput from './filecomponents/DLTcomponents/CustomInput/CustomInput'
import GridItem from './filecomponents/DLTcomponents/Grid/GridItem'
import { EthHdWallet } from 'eth-hd-wallet'
import crypt from 'crypto-js'
import EthCrypto from 'eth-crypto'
import { StoreWallet } from './StoreDataDid'
import { CircularProgress } from '@material-ui/core'
import { API_URL, COMMON, ENDPOINT } from 'ServerConfig'
import Web3 from 'web3'
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS } from 'ServerConfig'
import { getNonce } from './web3Functions/Web3Functions'
const Tx = require('ethereumjs-tx').Transaction
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL))
let globalNonce = 0

const styles = {
    cardCategoryWhite: {
        '&,& a,& a:hover,& a:focus': {
            color: 'rgba(255,255,255,.62)',
            margin: '0',
            fontSize: '14px',
            marginTop: '0',
            marginBottom: '0',
        },
        '& a,& a:hover,& a:focus': {
            color: '#FFFFFF',
        },
    },
    cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
        '& small': {
            color: '#777',
            fontSize: '65%',
            fontWeight: '400',
            lineHeight: '1',
        },
    },
}
const useStyles = makeStyles(styles)
export default function ForgotPassword(props) {
    const classes = useStyles()
    const [status, setStatus] = useState(true)
    const [forgotDisable, setForgotDisable] = useState(false)

    async function forgotPassword() {
        const seed1 = document.getElementById('w-1').value
        const seed2 = document.getElementById('w-2').value
        const seed3 = document.getElementById('w-3').value
        const seed4 = document.getElementById('w-4').value
        const seed5 = document.getElementById('w-5').value
        const seed6 = document.getElementById('w-6').value
        const seed7 = document.getElementById('w-7').value
        const seed8 = document.getElementById('w-8').value
        const seed9 = document.getElementById('w-9').value
        const seed10 = document.getElementById('w-10').value
        const seed11 = document.getElementById('w-11').value
        const seed12 = document.getElementById('w-12').value
        const newPassword = document.getElementById('newpassword').value
        const confirmPassword = document.getElementById('confirmpassword').value
        const passw =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/

        const value = passw.test(newPassword)
        // console.log("hello",value,newPassword)
        if (newPassword == '' || confirmPassword == '') {
            props.error('please fill all fields')
        } else if (newPassword != confirmPassword) {
            props.error("password doesn't match")
        } else if (value) {
            try {
                setForgotDisable(true)
                localStorage.setItem('forgotstatus', true)
                const mnemonic =
                    seed1.trim() +
                    ' ' +
                    seed2.trim() +
                    ' ' +
                    seed3.trim() +
                    ' ' +
                    seed4.trim() +
                    ' ' +
                    seed5.trim() +
                    ' ' +
                    seed6.trim() +
                    ' ' +
                    seed7.trim() +
                    ' ' +
                    seed8.trim() +
                    ' ' +
                    seed9.trim() +
                    ' ' +
                    seed10.trim() +
                    ' ' +
                    seed11.trim() +
                    ' ' +
                    seed12.trim()
                const wallet = EthHdWallet.fromMnemonic(mnemonic)
                // const wallet = EthHdWallet.fromMnemonic(`pudding aspect rabbit chunk motion avocado opera circle receive spot soul border`);
                const [address] = wallet.generateAddresses(1)
                let privateKey =
                    '0x' + wallet.getPrivateKey(address).toString('hex')
                const publicKey = EthCrypto.publicKeyByPrivateKey(privateKey)
                const encPrivate = crypt.AES.encrypt(
                    privateKey,
                    '' + newPassword
                )
                // setStatus(false)
                await StoreWallet(
                    localStorage.getItem('userEmail'),
                    localStorage.getItem('userName'),
                    publicKey,
                    address,
                    encPrivate.toString(),
                    privateKey,
                    null,
                    callbackWallet
                ).catch((e) => {
                    setForgotDisable(false)
                    localStorage.removeItem('forgotstatus')
                    props.error('something, went wrong')
                    console.log(e)
                })
            } catch (e) {
                setForgotDisable(false)
                localStorage.removeItem('forgotstatus')
                props.error('invalid mnemonic seed')
            }
        } else {
            props.error('please use strong password')
        }
    }
    async function callbackWallet(res, idx, address, privateKey) {
        if (res) {
            globalNonce = await getNonce(address)
            privateKey = Buffer.from('' + privateKey.slice(2), 'hex')
            const common = COMMON
            const contract = new web3.eth.Contract(
                CONTRACT_ABI,
                CONTRACT_ADDRESS,
                {
                    from: address,
                    gasLimit: '0x200b20',
                }
            )
            const contractFunction = contract.methods.addUser(
                localStorage.getItem('userEmail').toString(),
                idx,
                res
            )
            const functionAbi = await contractFunction.encodeABI()
            const txParams = {
                nonce: globalNonce,
                gasPrice: '0x4a817c800',
                gasLimit: '0x67c280', //0x200b20, //50000,
                to: CONTRACT_ADDRESS,
                data: functionAbi,
                value: '0x00',
                from: address,
            }
            const tx = new Tx(txParams, { common })
            tx.sign(privateKey) // Transaction Signing here
            const serializedTx = tx.serialize()
            const hash = await web3.eth.sendSignedTransaction(
                '0x' + serializedTx.toString('hex')
            )
            setForgotDisable(false)
            props.close()
            localStorage.removeItem('forgotstatus')
            props.success('Password reset successfully!')
        } else {
            setForgotDisable(false)
            localStorage.removeItem('forgotstatus')
            props.error('something, went wrong')
        }
    }
    return (
        <Dialog open={status} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">
                Change password[Please put your secret seed words that were provided when you created the wallet]
            </DialogTitle>
            <DialogContent>
                <GridContainer>
                    <TextField
                        margin="dense"
                        id="newpassword"
                        label="New Password"
                        type="password"
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        id="confirmpassword"
                        label="Confirm password"
                        type="password"
                        fullWidth
                    />
                    <GridItem xs={3} sm={3} md={3}>
                        <CustomInput
                            labelText="word-1"
                            id="w-1"
                            formControlProps={{
                                fullWidth: true,
                            }}
                        />
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                        <CustomInput
                            labelText="word-2"
                            id="w-2"
                            formControlProps={{
                                fullWidth: true,
                            }}
                        />
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                        <CustomInput
                            labelText="word-3"
                            id="w-3"
                            formControlProps={{
                                fullWidth: true,
                            }}
                        />
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                        <CustomInput
                            labelText="word-4"
                            id="w-4"
                            formControlProps={{
                                fullWidth: true,
                            }}
                        />
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                        <CustomInput
                            labelText="word-5"
                            id="w-5"
                            formControlProps={{
                                fullWidth: true,
                            }}
                        />
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                        <CustomInput
                            labelText="word-6"
                            id="w-6"
                            formControlProps={{
                                fullWidth: true,
                            }}
                        />
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                        <CustomInput
                            labelText="word-7"
                            id="w-7"
                            formControlProps={{
                                fullWidth: true,
                            }}
                        />
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                        <CustomInput
                            labelText="word-8"
                            id="w-8"
                            formControlProps={{
                                fullWidth: true,
                            }}
                        />
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                        <CustomInput
                            labelText="word-9"
                            id="w-9"
                            formControlProps={{
                                fullWidth: true,
                            }}
                        />
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                        <CustomInput
                            labelText="word-10"
                            id="w-10"
                            formControlProps={{
                                fullWidth: true,
                            }}
                        />
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                        <CustomInput
                            labelText="word-11"
                            id="w-11"
                            formControlProps={{
                                fullWidth: true,
                            }}
                        />
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                        <CustomInput
                            labelText="word-12"
                            id="w-12"
                            formControlProps={{
                                fullWidth: true,
                            }}
                        />
                    </GridItem>
                </GridContainer>
            </DialogContent>

            <DialogTitle style={{ color: 'red' }} id="draggable-dialog-title">
                Passwords must contain:<br></br><b>*</b> A minimum of 1 lower case letter [a-z]<br></br><b>*</b> A minimum of 1 upper case letter [A-Z] <br></br><b>*</b> A minimum of 1
                numeric character [0-9]<br></br><b>*</b> A minimum of 1 special character: ~!@#$%^&*()-_+={}[]|\;:
            </DialogTitle>
            <DialogActions>
                {forgotDisable && (
                    <div>
                        <CircularProgress
                            className={classes.progress}
                            style={{ color: 'blue' }}
                        />
                    </div>
                )}
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={props.close}
                    disabled={forgotDisable}
                >
                    Cancel
                </Button>
                <Button disabled={forgotDisable} onClick={forgotPassword}>
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    )
}
