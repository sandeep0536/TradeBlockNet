import React, { useEffect, useState, useCallback } from 'react'
import Breadcrumb from 'app/components/Breadcrumb/Breadcrumb'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import { Grid, Button } from '@material-ui/core'
import { deleteContacts, getAllDIDData, getStoredWallet, storeContacts } from './StoreDataDid'
import WaitSnackbar from './filecomponents/WaitSnackbar'
import { CircularProgress } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from './SnackbarComponent'
import {
    Table,
    TableHead,
    TableCell,
    TableBody,
    TableRow,
} from '@material-ui/core'
import PasswordPopup from '../../../components/MatxLayout/Layout1/PasswordPopup'
import crypt from 'crypto-js'
import { getUserRole } from './roles/UserRoles'
import { ipfs } from './filecomponents/DLTcomponents/Web3/ipfs'
import { PARTNER_WARNING } from 'ServerConfig'
import RoleWarningPopup from './RoleWarningPopup'
import { API_URL } from 'ServerConfig'
const useStyles = makeStyles((theme) => ({
    progress: {
        margin: theme.spacing(2),
    },
}))
// let contact = []
// console.log("contact",contact)
let wallet
export default function SaveContact() {
    const classes = useStyles()
    const [state, setState] = useState({})
    const [progress, setProgress] = useState(false)
    const [error, setError] = useState(null)
    const [status, setStatus] = useState(false)
    const [success, setSuccess] = useState(null)
    const [open, setOpen] = useState(false)
    const [restrictUser, setRestrictUser] = useState(false)
    const [warning, setWarning] = useState(null)
    const [contactStatus, setContactStatus] = useState(false)
    const [contact, setContact] = useState([])
    const [data, setData] = useState(false)
    const [userData, setUserData] = useState([])
    useEffect(() => {
        ; (async () => {
            if (
                localStorage.getItem('did_data') == null ||
                localStorage.getItem('did_data') == 'undefined' ||
                localStorage.getItem('did_data') == undefined
            ) {
                const data = await getAllDIDData()
                localStorage.setItem('did_data', data)
                setStatus(true)
            } else {
                if (localStorage.getItem('did_data') == 'empty') {
                    setProgress(false)
                    setError('please create wallet first !')
                }
                else {
                    const data = JSON.parse(localStorage.getItem('did_data'))
                    setContact(data.contact)
                    wallet = data.wallet
                    const hash = await getUserRole(wallet.walletaddress)
                    if (hash == '') {
                        if (data.userToken == null) setRestrictUser(false)
                        else if (
                            data.companyProfile == null ||
                            data.companyProfile == undefined
                        ) {
                            setRestrictUser(true)
                            setWarning(PARTNER_WARNING)
                        }
                    } else {
                        ipfs.files.get(hash, function (err, files) {
                            try {
                                const data = JSON.parse(
                                    files[0].content.toString('binary')
                                )
                                const permissions = data[0].userRolePermission
                                if (permissions.Inactive) {
                                    setRestrictUser(true)
                                    setWarning(
                                        'you have an Inactive user'
                                    )
                                }
                                else if (!permissions.Partner) {
                                    setRestrictUser(true)
                                    setWarning(
                                        'you have no permission to add partners'
                                    )
                                }

                            } catch (e) {
                                console.log(e)
                            }
                        })
                    }
                }

                await getAllDIDData()
            }
        })()
    }, [])

    useEffect(() => {
        ; (async () => {
            if (localStorage.getItem('did_data') == 'empty' || localStorage.getItem('did_data') == null) {
                setProgress(false)
                setError('please create wallet first !')
            }
            else if (JSON.parse(localStorage.getItem('did_data')).userToken == null && JSON.parse(localStorage.getItem('did_data')).companyProfile == undefined) {
                setProgress(false)
                setError('please create company profile')
            }
            // else if(JSON.parse(localStorage.getItem('did_data')).userToken){

            // }
            else {
                const data = JSON.parse(localStorage.getItem('did_data'))
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


                    await responsed.json()
                        .then((response) => {
                            setUserData(JSON.parse(response?.result))
                        }).catch((e) => {
                            console.log(e)
                        })
                }
                else {
                    // const companyData = JSON.parse(
                    //     data?.companyProfile[localStorage.getItem('userEmail')]
                    // )

                    // const companytoken = companyData?.companyToken
                    const opts = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            // "token": companytoken,
                            "useremail": useremail,
                        }),
                    }
                    const response = await fetch(`${API_URL}/fetchcontact`, opts);

                    await response.json()
                        .then((res) => {
                            setUserData(JSON.parse(res?.result))
                        }).catch((e) => {
                            console.log(e)
                        })
                }
            }

        })()

    }, []);



    // useEffect(() => {
    //     ; (async () => {
    //         let data24 = localStorage.getItem('did_data')
    //         let data23 = JSON.parse(data24)
    //         const useremail = data23.wallet.useremail
    //         const opts = {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 "useremail": useremail,
    //             }),
    //         }
    //         const response = await fetch(`${API_URL}/fetchcontact`, opts);

    //         await response.json()
    //             // console.log("resppp",res)
    //             .then((res) => {
    //                 setUserData(JSON.parse(res?.result))
    //             }).catch((e) => {
    //                 console.log(e)
    //             })

    //     })()


    // }, [])



    // console.log("user", userData)

    const handleChange = ({ target: { name, value } }) => {
        setState({
            ...state,
            [name]: value,
        })
    }

    async function handleDelete(contact) {
        try {
            const data = JSON.parse(localStorage.getItem('did_data'))
            const email_user = data.wallet.useremail
            const opts = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "contact": contact,
                    "emailuser": email_user
                }),
            }
            await fetch(`${API_URL}/deletecontact`, opts);

            // await response.json()
            //     // console.log("resppp",res)
            //     .then((res) => {
            //         console.log(JSON.parse(res?.result))
            //     }).catch((e) => {
            //         console.log(e)
            //     })
            setData(true)
            setSuccess("Contact deleted successfully")
            setData(false)

            // //  setState(true)
            // setContactStatus(true)
            // await deleteContacts(contact, wallet.walletaddress);
            // //   console.log("before")
            // // setContactStatus(false)
            // setContactStatus(false)
            // setData(true)
            // setStatus(false)


        } catch (e) {
            console.log(e)
        }
    }

    // const handleFormSubmit = async (event) => {
    //     try {
    //         // const password = document.getElementById("file-password").value;
    //         // const decPrivate = crypt.AES.decrypt(wallet.privatekey, "" + password).toString(crypt.enc.Utf8);
    //         // if (decPrivate <= 0)
    //         //     setError("your password may be wrong!")
    //         // else {
    //         setOpen(false)
    //         setProgress(true)
    //         // const res = await getStoredWallet();
    //         if (!wallet) {
    //             setProgress(false)
    //             setError('please create wallet first !')
    //         } else {
    //             // console.log("resp",response.json())
    //             // await storeContacts(
    //             //     email,
    //             //     name,
    //             //     publickey,
    //             //     address,
    //             //     wallet.walletaddress
    //             // )
    //             setProgress(false)
    //             setData(true)
    //             setState({})
    //             setSuccess('Contact saved successfully')
    //         }
    //         // }
    //     } catch (e) {
    //         console.log(e)
    //         setProgress(false)
    //         setError('Something went wrong')
    //     }
    // }




    setTimeout(function () {
        setStatus(true)
    }, 3000)
    let { email, address, publickey, name } = state
    function handleErrorClose() {
        setError(null)
    }
    function handleSnackbarClose() {
        setSuccess(null)
    }
    const roleStatus = setTimeout(async () => {
        if (data) {
            const data = JSON.parse(localStorage.getItem('did_data'))
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


                await responsed.json()
                    .then((response) => {
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
                    .then((res) => {
                        setUserData(JSON.parse(res?.result))
                    }).catch((e) => {
                        console.log(e)
                    })
            }
        }
        clearTimeout(roleStatus)
    }, 100)
    async function handlePassword() {
        try {
            let data24 = localStorage.getItem('did_data')
            let data23 = JSON.parse(data24)
            const data = JSON.parse(localStorage.getItem('did_data'))
            const comprofile = data?.companyProfile
            if (comprofile == undefined || comprofile == null || !comprofile) {
                const data = JSON.parse(localStorage.getItem('did_data'))
                const usertok = data.userToken
                const useremail = data23.wallet.useremail
                const username = data23.wallet.username
                const walletaddress = data23.wallet.walletaddress
                const pKey = data23.wallet.publicKey
                if (!wallet) {
                    setProgress(false)
                    setError('please create wallet first !')
                }
                else if (data23.wallet.useremail === email || data23.wallet.publicKey === publickey || data23.wallet.walletaddress === address) {
                    setWarning('you have not permssion to add yourself')
                } else {
                    const opts = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "useremail": useremail,
                            "username": username,
                            "userkey": pKey,
                            "useraddress": walletaddress,
                            "token": usertok,
                            "contactemail": email,
                            "contactname": name,
                            "contactkey": publickey,
                            "contactaddress": address
                        }),
                    }
                    await fetch(`${API_URL}/savecontact`, opts);
                    setData(true)
                    setSuccess('Contact saved successfully')
                    setData(false)
                    setState({})

                }
            }
            else if (
                comprofile == null ||
                comprofile == undefined
            ) {
                const useremail = data23.wallet.useremail
                const username = data23.wallet.username
                const walletaddress = data23.wallet.walletaddress
                const pKey = data23.wallet.publicKey
                if (!wallet) {
                    setProgress(false)
                    setError('please create wallet first !')
                }
                else if (data23.wallet.useremail === email || data23.wallet.publicKey === publickey || data23.wallet.walletaddress === address) {
                    setWarning('you have not permssion to add yourself')
                } else {
                    // handleFormSubmit()
                    const opts = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "useremail": useremail,
                            "username": username,
                            "userkey": pKey,
                            "useraddress": walletaddress,
                            // "token": comprofile,
                            "contactemail": email,
                            "contactname": name,
                            "contactkey": publickey,
                            "contactaddress": address
                        }),
                    }
                    await fetch(`${API_URL}/savecontact`, opts);
                    // setProgress(false)
                    setData(true)
                    // setData(false)
                    setSuccess('Contact saved successfully')
                    setData(false)
                    setState({})
                    // roleStatus()
                }
            }
            else {
                const companyData = JSON.parse(
                    data?.companyProfile[localStorage.getItem('userEmail')]
                )
                // const data = JSON.parse(localStorage.getItem('did_data'))
                // const comprofile = data?.companyProfile?.companyToken
                const companytoken = companyData?.companyToken
                const useremail = data23.wallet.useremail
                const username = data23.wallet.username
                const walletaddress = data23.wallet.walletaddress
                const pKey = data23.wallet.publicKey
                if (!wallet) {
                    setProgress(false)
                    setError('please create wallet first !')
                }
                else if (data23.wallet.useremail === email || data23.wallet.publicKey === publickey || data23.wallet.walletaddress === address) {
                    setWarning('you have not permssion to add yourself')
                } else {
                    // handleFormSubmit()
                    const opts = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "useremail": useremail,
                            "username": username,
                            "userkey": pKey,
                            "useraddress": walletaddress,
                            "token": companytoken,
                            "contactemail": email,
                            "contactname": name,
                            "contactkey": publickey,
                            "contactaddress": address
                        }),
                    }
                    await fetch(`${API_URL}/savecontact`, opts);
                    // setProgress(false)
                    setData(true)
                    // setData(false)
                    setSuccess('Contact saved successfully')
                    setData(false)
                    setState({})
                    // roleStatus()
                }
            }


            // setOpen(!open)
        }
        catch (e) {
            console.log(e)
            setProgress(false)
            setError('Something went wrong')
        }
    }




    // const handleUserForm = setTimeout(async () => {
    //     if (userData) {
    //         console.log("gautam" , "sinha")
    //         let data24 = localStorage.getItem('userEmail')
    //         let data23 = JSON.parse(data24)
    //         const useremail = data23

    //         if(useremail == userData.contact_email){

    //         }
    //     }
    //     else{
    //         console.log("gautam - 11" , "sinha")
    //     }
    // }, 1000)


    // useEffect(()=>{
    //     if (userData) {

    //         console.log("gautam" , userData)
    //         let data24 = localStorage.getItem('userEmail')
    //         let data23 = JSON.parse(data24)
    //         const useremail = data23

    //         // if(useremail == userData?.contact_email){

    //         // }
    //     }
    // }, [userData]);



    function handleWarning() {
        setWarning(null)
    }
    async function getData() {
        let data = JSON.parse(localStorage.getItem('did_data'))
        setContact(data.contact)
    }
    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb routeSegments={[{ name: 'Save Contacts' }]} />
                <RoleWarningPopup
                    status={warning != null}
                    close={handleWarning}
                    content={warning}
                    title={'Partner warning'}
                />
                {/* <PasswordPopup status={open} close={handlePassword} submit={handleFormSubmit} /> */}
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

                <Grid item lg={12} md={12} sm={12} xs={12}>
                    <div className="p-8 h-full bg-light-gray relative">
                        <ValidatorForm onSubmit={handlePassword}>
                            <TextValidator
                                className="mb-4 w-full"
                                variant="outlined"
                                size="small"
                                label="Name"
                                onChange={handleChange}
                                type="name"
                                name="name"
                                value={name || ''}
                                validators={['required']}
                                errorMessages={['this field is required']}
                            />
                            <TextValidator
                                className="mb-4 w-full"
                                variant="outlined"
                                size="small"
                                label="Email"
                                onChange={handleChange}
                                type="email"
                                name="email"
                                value={email || ''}
                                validators={['required', 'isEmail']}
                                errorMessages={[
                                    'this field is required',
                                    'email is not valid',
                                ]}
                            />
                            <TextValidator
                                className="mb-4 w-full"
                                label="Account Address"
                                variant="outlined"
                                size="small"
                                onChange={handleChange}
                                name="address"
                                type="address"
                                value={address || ''}
                                validators={['required']}
                                errorMessages={['this field is required']}
                            />
                            <TextValidator
                                className="mb-4 w-full"
                                label="Public Key"
                                variant="outlined"
                                size="small"
                                onChange={handleChange}
                                name="publickey"
                                type="publickey"
                                value={publickey || ''}
                                validators={['required']}
                                errorMessages={['this field is required']}
                            />
                            <div className="text-center">
                                <Button
                                    className="capitalize"
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={
                                        localStorage.getItem('did_data') == 'empty' || localStorage.getItem('did_data') == null ||
                                        progress ||
                                        restrictUser ||
                                        !publickey ||
                                        !email ||
                                        !address
                                    }
                                >
                                    Save
                                </Button>
                                {progress && (
                                    <div>
                                        <center>
                                            <CircularProgress
                                                className={classes.progress}
                                            />
                                        </center>
                                        <WaitSnackbar
                                            message={
                                                'please wait while contact saved'
                                            }
                                        ></WaitSnackbar>
                                    </div>
                                )}
                            </div>
                        </ValidatorForm>
                    </div>
                </Grid>
                {!status ? (
                    <div>
                        <center>
                            <CircularProgress />
                        </center>
                    </div>
                ) : (
                    <div>
                        <br></br>
                        <h3>Saved contacts</h3>

                        <Table className="whitespace-pre">
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        className="px-0"
                                        style={{ width: '70px' }}
                                    >
                                        Sno.
                                    </TableCell>
                                    <TableCell
                                        className="px-0"
                                        style={{ width: '220px' }}
                                    >
                                        Name
                                    </TableCell>
                                    <TableCell className="px-0">
                                        Email
                                    </TableCell>
                                    <TableCell className="px-0">
                                        Account Address
                                    </TableCell>
                                    <TableCell className="px-0">
                                        Delete

                                    </TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {status &&
                                    userData &&
                                    Object.keys(userData).map((key, i) => (
                                        <TableRow key={i}>
                                            <TableCell
                                                className="px-0 capitalize"
                                                align="left"
                                            >
                                                {i + 1}
                                            </TableCell>
                                            <TableCell
                                                className="px-0 capitalize"
                                                align="left"
                                            >
                                                {userData[key].user_name}
                                            </TableCell>
                                            <TableCell
                                                className="px-0 capitalize"
                                                align="left"
                                            >
                                                {userData[key].user_email}
                                            </TableCell>
                                            <TableCell
                                                className="px-0 capitalize"
                                                align="left"
                                            >
                                                {userData[key].user_address}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    id={`check-${i}`}
                                                    variant="outlined"
                                                    color="red"
                                                    onClick={() => { handleDelete(userData[key].user_email) }}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                        {contactStatus && (
                            <div>
                                <center>
                                    <CircularProgress
                                        className={classes.progress}
                                    />
                                </center>
                                <WaitSnackbar
                                    message={
                                        'please wait while contact Delete'
                                    }
                                ></WaitSnackbar>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
