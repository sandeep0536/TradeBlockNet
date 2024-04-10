import React, { useEffect, useState } from 'react'
import { Grid, Button } from '@material-ui/core'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import EthCrypto from 'eth-crypto'
import { generateMnemonic, EthHdWallet } from 'eth-hd-wallet'
import crypt from 'crypto-js'
import { makeStyles } from '@material-ui/core/styles'
import Web3 from 'web3'
import { CircularProgress } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from './SnackbarComponent'
import WaitSnackbar from './filecomponents/WaitSnackbar'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import download from 'downloadjs'
import { StoreWallet, getAllDIDData, getDID } from './StoreDataDid'
import WalletComponent from './WalletComponent'
import { ipfs } from './filecomponents/DLTcomponents/Web3/ipfs'
import pinataSDK from '@pinata/sdk'
import {
    INFURA_URL,
    API_URL,
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    COMMON,
    ROLES_ARRAY,
} from 'ServerConfig'

const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY)

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
let ethwallet
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL))
let rows = []

export default function CreateWallet() {
    const classes = useStyles()
    const [state, setState] = useState({})
    const [plan, setPlan] = useState(null)
    const [wallet, setWallet] = useState(null)
    const [createWallet, setCreateWallet] = useState(null)
    const [walletCreation, setWalletCreation] = useState(false)
    const [progress, setProgress] = useState(false)
    const [status, setStatus] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [seed, setSeed] = useState(null)
    let { password, cpassword } = state
    const handleChange = ({ target: { name, value } }) => {
        setState({
            ...state,
            [name]: value,
        })
    }
    function handleSnackbarClose() {
        setError(null)
        setSuccess(null)
    }

    setInterval(function () {
        if (localStorage.getItem('did_data') == 'empty') {
            setCreateWallet('createwallet')
        }
    }, 100)
    useEffect(() => {
        try {
            ;(async function () {
                if (localStorage.getItem('walletprogress') == 'true') {
                    setWalletCreation(true)
                }
                await getWalletData()
                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: localStorage.getItem('userEmail'),
                    }),
                }
                const res = await fetch(
                    `${API_URL}/getsubscriptionstatus`,
                    opts
                )
                await res
                    .json()
                    .then((res) => {
                        const data = JSON.parse(res.result)
                        setPlan(data[0].plan_type)
                    })
                    .catch((e) => {
                        setProgress(false)
                        console.log(e)
                    })
            })()
        } catch (e) {
            setProgress(false)
            console.log(e)
        }
    }, [rows])

    const getWalletData = async () => {
        // if (localStorage.getItem("did_data") == null ||
        //     localStorage.getItem("did_data") == undefined) {
        //     await getAllDIDData()
        //         .then((res) => {
        //             setProgress(true)
        //             localStorage.setItem("did_data", res)
        //             if (res != null || res != undefined || res != "empty") {
        //                 const walletData = JSON.parse(localStorage.getItem("did_data"))
        //                 ethwallet = walletData.wallet;
        //                 setWallet(ethwallet)
        //                 setProgress(false)
        //                 setStatus(true)
        //             }
        //             else {
        //                 setProgress(false)
        //                 setCreateWallet("createwallet")
        //             }
        //         })
        //         .catch((e) => {
        //             console.log(e)
        //             localStorage.setItem("did_data", "empty")
        //         })

        // } else {
        //     if (localStorage.getItem("did_data") == "empty" ||
        //         JSON.parse(localStorage.getItem("did_data")).length == 0)
        //         setCreateWallet("createwallet")
        //     else {
        //         const data = JSON.parse(localStorage.getItem("did_data"))
        //         ethwallet = data.wallet;
        //         setWallet(ethwallet)
        //     }
        // }
        try {
            const response = await getDID()
            // console.log(response)
            if (
                response == false &&
                (localStorage.getItem('userData') == null ||
                    localStorage.getItem('userData') == undefined)
            ) {
                setCreateWallet('createwallet')
            } else {
                const data = JSON.parse(localStorage.getItem('did_data'))
                ethwallet = data.wallet
                setWallet(ethwallet)
                // console.log(ethwallet)
            }
        } catch (e) {
            console.log(e)
        }
    }
    const storeWallet = async (
        publicKey,
        address,
        privatekey,
        decPrivate,
        userToken
    ) => {
        await StoreWallet(
            localStorage.getItem('userEmail'),
            localStorage.getItem('userName'),
            publicKey,
            address,
            privatekey,
            decPrivate,
            userToken
        )
            .then((res) => {
                const data = JSON.parse(localStorage.getItem('did_data'))
                ethwallet = data.wallet
                setWalletCreation(false)
                setCreateWallet(null)
            })
            .catch((e) => {
                setWalletCreation(false)
                setError('Something went wrong')
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
        const seedData = seed.split(' ')
        for (let i = 0; i < seedData.length; i++) {
            page.drawText(`${i + 1}. ${seedData[i]}`, {
                x: 50,
                y: height - (i + 3) * fontSize,
                size: fontSize,
                color: rgb(0, 0, 0),
            })
        }
        const pdfBytes = await pdfDoc.save()
        setSeed(seed)
        download(pdfBytes, 'Tradeblocknet.pdf')
    }
    const handleFormSubmit = async (event) => {
        const passw =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/

        const value = passw.test(password)
        if (password == '') {
            setError('please enter details')
        } else if (password != cpassword) setError("password doesn't match")
        else if (value) {
            try {
                localStorage.setItem('walletprogress', true)

                setWalletCreation(true)
                const mnemonic = generateMnemonic()
                const wallet = EthHdWallet.fromMnemonic(mnemonic)
                const [address] = wallet.generateAddresses(1)
                const privateKey =
                    '0x' + wallet.getPrivateKey(address).toString('hex')
                const publicKey = EthCrypto.publicKeyByPrivateKey(privateKey)
                const encPrivate = crypt.AES.encrypt(privateKey, '' + password)
                const jsonObj = []
                jsonObj[0] = {
                    address: address,
                    publicKey: publicKey,
                    privateKey: encPrivate.toString(),
                }
                await downloadSeed(mnemonic)
                if (localStorage.getItem('userToken') !== null) {
                    const data = [
                        {
                            userEmail: localStorage.getItem('userEmail'),
                            userToken: localStorage.getItem('userToken'),
                            userRolePermission: ROLES_ARRAY,
                        },
                    ]
                    const bufferData = await Buffer.from(JSON.stringify(data))
                    await ipfs.add(bufferData, async (err, ipfshash) => {
                        if (err) {
                            setError('something went wrong')
                            return
                        } else {
                            await storeWallet(
                                publicKey,
                                address,
                                encPrivate.toString(),
                                privateKey,
                                localStorage.getItem('userToken')
                            )
                            localStorage.setItem('tokenHash', ipfshash[0].hash)
                            localStorage.removeItem('walletprogress')
                            await pinata.pinByHash(ipfshash[0].hash)
                        }
                    })
                } else {
                    await storeWallet(
                        publicKey,
                        address,
                        encPrivate.toString(),
                        privateKey,
                        null
                    )
                    localStorage.removeItem('walletprogress')
                }
            } catch (e) {
                localStorage.removeItem('walletprogress')
                setWalletCreation(false)
                console.log(e)
            }
        } else {
            setError(
                'Password minimum 8 digit and Passwords must contain lower case [a-z],upper case letter [A-Z],numeric character [0-9] and special character:~`!@#$%^&*()-_+={}[]|?'
            )
        }
    }

    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb routeSegments={[{ name: 'Wallet' }]} />
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
                {createWallet == null && walletCreation == false && !ethwallet && (
                    <div>
                        <center>
                            <CircularProgress className={classes.progress} />
                        </center>
                    </div>
                )}
                {createWallet != null ? (
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
                                        errorMessages={[
                                            'this field is required',
                                        ]}
                                    />
                                    <TextValidator
                                        className="mb-4 w-full"
                                        label="Confirm Password"
                                        variant="outlined"
                                        size="small"
                                        onChange={handleChange}
                                        name="cpassword"
                                        type="password"
                                        value={cpassword || ''}
                                        validators={['required']}
                                        errorMessages={[
                                            'this field is required',
                                        ]}
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
                                    {walletCreation && (
                                        <div>
                                            <center>
                                                <CircularProgress
                                                    className={classes.progress}
                                                />
                                            </center>
                                            <WaitSnackbar
                                                message={
                                                    'please wait while wallet is created'
                                                }
                                            ></WaitSnackbar>
                                        </div>
                                    )}
                                </ValidatorForm>
                            </div>
                        </Grid>
                    </SimpleCard>
                ) : (
                    ethwallet && (
                        <WalletComponent
                            wallet={ethwallet}
                            plan={plan}
                            seedData={seed}
                        />
                    )
                )}
            </div>
        </div>
    )
}
