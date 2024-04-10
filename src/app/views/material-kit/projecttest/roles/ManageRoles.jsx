import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Checkbox from '@material-ui/core/Checkbox'
import { Breadcrumb } from 'app/components'
import { Container, Row, Col } from 'react-bootstrap'
import {
    InputLabel,
    ListItemIcon,
    ListItemText,
    FormControl,
    Select,
    Icon,
    IconButton,
} from '@material-ui/core'
import { MenuProps } from '../../projecttest/filecomponents/utils'
import Menu from '@material-ui/core/Menu'
import { MenuItem } from '@material-ui/core'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { Button } from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import { useEffect } from 'react'
import { storeDID, storeRole, storePermissions, deleteRole } from '../StoreDataDid'
import { ProgressBar } from 'react-bootstrap'
import { CircularProgress } from '@material-ui/core'
import WaitSnackbar from '../filecomponents/WaitSnackbar'
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from '../SnackbarComponent'
import PasswordPopup from '../../../../components/MatxLayout/Layout1/PasswordPopup'
import crypt from 'crypto-js'
import { getEstimatedGas, getNonce } from '../web3Functions/Web3Functions'
import { getAllOrganizationUser } from './UserRoles'
import { ipfs } from '../filecomponents/DLTcomponents/Web3/ipfs'
import Web3 from 'web3'
import {
    INFURA_URL,
    API_URL,
    INFURA_ROPSTEN_URL,
    ROLES_ARRAY,
} from 'ServerConfig'
import { CONTRACT_ABI, CONTRACT_ADDRESS, COMMON } from 'ServerConfig'
import { PINATA_API_KEY, PINATA_SECRET_KEY } from 'ServerConfig'
import pinataSDK from '@pinata/sdk'
import $, { data, valHooks } from 'jquery'
import 'datatables.net-dt/js/dataTables.dataTables'
import 'datatables.net-dt/css/jquery.dataTables.min.css'

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
        width: '150px',
        height: '150px',
    },
    innerthumb: {
        position: 'absolute',
        marginTop: '105px',
        width: '150px',
        height: '44px',
    },
    folder: {
        marginTop: '-30px',
    },
    file: {
        width: '70px',
        fontSize: '12px',
        marginLeft: '10px',
        marginTop: '1px',
    },
    formControl: {
        width: 200,
    },
    formControluser: {
        width: 300,
    },
    indeterminateColor: {
        color: '#f50057',
    },
    selectAllText: {
        fontWeight: 500,
    },
    selectedAll: {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
        },
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

let contacts
let allRoles
let wallet
let allUsers = []
let userData = []
let progress = 0
let second = 1000
let globalNonce = 0
const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY)
const Tx = require('ethereumjs-tx').Transaction

const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL))
const common = COMMON
let assignedRoles

let newdata = [];
export default function ManageRoles() {
    const classes = useStyles()
    const [selected, setSelected] = useState('')
    const [deleteSelected, setDeleteSelected] = useState([])
    const [creationStatus, setCreationStatus] = useState(false)
    const [deletionStatus, setDeleionStatus] = useState(false)
    const [createRole, setCreateRole] = useState(false)
    const [deleteRoles, setDeleteRoles] = useState(false)
    const [status, setStatus] = useState(false)
    const [fetch, setFetch] = useState(false)
    const [success, setSuccess] = useState(null)
    const [error, setError] = useState(null)
    const [role, setRole] = useState(null)
    const [open, setOpen] = useState(false)
    const [progress, setProgress] = useState(false)
    const [password, setPassword] = useState(false)
    const [tableStatus, setTableStatus] = useState(false)
    const [state, setState] = useState(ROLES_ARRAY)
    const [table, setTable] = useState("");
    const [assignedRoles, setAssignedRoles] = useState([])
    console.log("state26",state);
    // const [allUsers, setAllUsers] = useState([])
    // useEffect(() => {
    //     ;(async () => {
    //         try {
    //             // await getData()
    //             setTableStatus(true)
    //             // setTable(null)
    //             $('#user-permission').dataTable()

    //         } catch (e) {}
    //     })()
    // }, [])
    // console.log("table", table)
    useEffect(() => {
        ; (async () => {
            try {
                await getData()
                setTable(null)
                setTableStatus(true)
                $('#user-permission').dataTable()
            } catch (e) {
                console.log(e)
            }

        })()
    }, [table])


    // useEffect(() => {
    //     ;(async () => {
    //         try {
    //         } catch (e) {}
    //     })()
    // }, [])

    const handleChange = (name) => (event) => {
        // console.log(event.target.value)
        try {
            if (name == 'Role') {
                // console.log("hello")
                setState({ ...state, [name]: event.target.value })
                // console.log("stateee", state)
            }
            // console.log("hello")
            else setState({ ...state, [name]: event.target.checked })
        } catch (e) {
            console.log(e)
        }
    }
    // console.log('state', state)
    const handleSelect = async(event) => {
        try {
            const value = event.target.value
            // console.log("value",value)
            // console.log(value)
            await setSelected(event.target.value)
            let data24 = localStorage.getItem('did_data')
            let data23 = JSON.parse(data24)
            data23 = data23.permissions
            for (let i = 0; i < data23.length; i++) {
                if (data23[i].userEmail === value) {
                    let permissions = data23[i].userRolePermission
                    setState({
                        ...state,
                        ['Upload']:
                            permissions.Upload,
                        ['Download']:
                            permissions.Download,
                        ['Share']:
                            permissions.Share,
                        ['Revokefile']:
                            permissions.Revokefile,
                        ['Role']: permissions.Role,
                        ['Transfer']:
                            permissions.Transfer,
                        ['Partner']:
                            permissions.Partner,
                        ['Inactive']: permissions.Inactive
                    })
                    break
                }
            }
            // if (selected) {
            //     setState({
            //         ...state,
            //         ['Upload']: data23.permissions[0].userRolePermission.Upload,
            //         ['Download']:
            //             data23.permissions[0].userRolePermission.Download,
            //         ['Share']: data23.permissions[0].userRolePermission.Share,
            //         ['Revokefile']:
            //             data23.permissions[0].userRolePermission.Revokefile,
            //         ['Role']: data23.permissions[0].userRolePermission.Role,
            //         ['Transfer']:
            //             data23.permissions[0].userRolePermission.Transfer,
            //         ['Partner']:
            //             data23.permissions[0].userRolePermission.Partner,
            //     })
            //     console.log('data23')
            // }
            // document.getElementById(`mutiple-select-label-${i}`).value = value
        } catch (e) {
            console.log(e)
        }
    }
    const handleDelete = (event) => {
        try {
            const value = event.target.value
            setDeleteSelected(value)
            // document.getElementById(`mutiple-select-label-${i}`).value = value
        } catch (e) {
            console.log(e)
        }
    }
    function handleRole() {
        setCreateRole(!createRole)
        // handleCreateRole();
    }
    function handleRoleDelete() {
        setDeleteRoles(!deleteRoles)
    }
    function handleClose() {
        setOpen(!open)
        setPassword(!password)
    }

    // const timer = setInterval(async () => {
    //     if (fetch) {
    //         console.log(progress)
    //         if (progress == 40) {
    //             alert("check")
    //             second = 3000;
    //         }
    //         progress++;
    //         setProgressStatus((pre) => (pre >= 100 ? completeProgress() : pre + 1));
    //         // setProgressStatus((prevProgress) => (prevProgress == 50 ? completeProgress() : prevProgress + 1));
    //     }
    //     else clearInterval(timer)
    // }, progress == 40 ? second * 3 : second);
    async function completeProgress(prevProgress) {
        // await getData();
        // clearInterval(timer)
        // document.getElementById("progress").style.display = "none"
    }
    async function handleCreateRole() {
        try {
            // const password = document.getElementById("file-password").value;
            // const decPrivate = crypt.AES.decrypt(wallet.privatekey, password).toString(crypt.enc.Utf8);
            // if (decPrivate.length < 1) {
            //     setError("your password may be wrong");
            // } else {
            if (role == "User") {
                setError("You cannot create role User")
            }
            else {
                setOpen(false)
                setCreationStatus(true)
                // setFetch(true)
                await storeRole(role, wallet.walletaddress)
                setCreateRole(false)
                // await storeDID(localStorage.getItem("idx_id"), decPrivate, wallet.walletaddress);
                setFetch(true)
                setCreationStatus(false)
                setSuccess('Role created successfully')
            }


            // }
        } catch (e) {
            setError('something went wrong')
        }
    }
    // console.log("assignedRoles", assignedRoles)
    async function roleDelete() {
        // setOpen(false)
        // console.log("event", state.Role)
        if (state.Role == "User") {
            setError("Type User role cannot be deleted")
        }
        else {
            setDeleionStatus(true)
            await deleteRole(state.Role);
            setFetch(true)
            setDeleionStatus(false)
            setSuccess('Role deleted successfully')
        }
    }
    const roleStatus = setTimeout(async () => {
        if (fetch) {
            // console.log('check...')
            await getData()
        }
        clearTimeout(roleStatus)
    }, 100)
    async function getData() {
        const data = JSON.parse(localStorage.getItem('did_data'))
        const companyData = JSON.parse(
            data.companyProfile[localStorage.getItem('userEmail')]
        )
        wallet = data.wallet
        allRoles = companyData.roles

        // console.log("jjkk", allRoles);
        setAssignedRoles(data.permissions)

        // console.log("jjkk", "3", assignedRoles);



        // for (var i = 0; i < assignedRoles.length; i++) {

        //     for(var k = i; k <= i; k++){
        //         if(assignedRoles[i].userRolePermission.Role == allRoles[i]){
        //             if(! newdata[i]?.userEmail.includes(assignedRoles[i].userEmail)){
        //               console.log("kkll","kkll")
        //               newdata.push(assignedRoles[i]) 

        //             }

        //           }else{
        //               console.log("kkll","kkll" , newdata[i])
        //               if(! newdata[i]?.userEmail.includes(assignedRoles[i].userEmail)){
        //                   var bc =[]
        //                   bc =assignedRoles[i]
        //                   console.log("bc" , bc);
        //                   bc.userRolePermission.Role = "User"
        //                 newdata.push(bc) 
        //                 }

        //           }  
        //     }


        //  }


        //  console.log("jjkk","5")

        // rolesArr.push(rolesArr)

        // console.log("assign",assignedRoles)
        // console.log('assignedRoles', assignedRoles[0].userRolePermission)
        const users = await getAllOrganizationUser(companyData.companyToken)
        // console.log("users", users)
        for (let i = 0; i < users.length; i++) {
            ipfs.files.get(users[i], function (err, data) {
                let user = data[0].content.toString('binary')
                // console.log("user",user)
                const userData = JSON.parse(user)
                // console.log("userData",userData)
                // console.log("alll", userData[0].userEmail)
                allUsers.push(userData[0].userEmail)
                allUsers = [...new Set(allUsers)]
            })
        }
        setTimeout(() => {
            setStatus(true)
        }, 1000)
    }

    // console.log("allUsers", allUsers)
    // console.log("userss",allUsers)
    // console.log("jjkk", "2", newdata)
    function handleSnackbarClose(event, reason) {
        if (reason === 'clickaway') {
            return
        }
        setSuccess(null)
    }
    function handleErrorClose(event, reason) {
        setError(null)
    }
    async function handlePermission() {
        try {
            setPassword(false)
            setProgress(true)
            let password = document.getElementById('file-password').value
            globalNonce = await getNonce(wallet.walletaddress)
            const data = JSON.parse(localStorage.getItem('did_data'))
            const companyData = JSON.parse(
                data.companyProfile[localStorage.getItem('userEmail')]
            )
            const permission = [
                {
                    userEmail: selected,
                    userToken: companyData.companyToken,
                    userRolePermission: state,
                },
            ]
            let decPrivateKey = crypt.AES.decrypt(
                wallet.privatekey,
                password
            ).toString(crypt.enc.Utf8)
            if (decPrivateKey.length > 0) {
                const privateKey = Buffer.from(decPrivateKey.slice(2), 'hex')
                let txParams
                const bufferData = await Buffer.from(JSON.stringify(permission))
                await ipfs.add(bufferData, async (err, ipfshash) => {
                    if (err) {
                        setProgress(false)
                        setError('something went wrong')
                        return
                    } else {
                        const contract = new web3.eth.Contract(
                            CONTRACT_ABI,
                            CONTRACT_ADDRESS,
                            {
                                from: wallet.walletaddress,
                                gasLimit: '0x200b20',
                            }
                        )
                        const updatePermission =
                            contract.methods.updateUserPermissions(
                                selected.toString(),
                                ipfshash[0].hash
                            )
                        const updateFunctionAbi =
                            await updatePermission.encodeABI()
                        txParams = {
                            nonce: globalNonce,
                            gasPrice: '0x4a817c800',
                            gasLimit: '0x67c280', //0x200b20, //50000,
                            to: CONTRACT_ADDRESS,
                            data: updateFunctionAbi,
                            value: '0x0',
                            from: wallet.walletaddress,
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
                                await storePermissions(permission)
                                    .then(async (res) => {
                                        setProgress(false)
                                        setTable("");
                                        setSuccess(
                                            'Permission granted successfully'
                                        )

                                        await pinata.pinByHash(ipfshash[0].hash)
                                    })
                                    .catch((e) => {
                                        setProgress(false)
                                        console.log(e)
                                        setError('something went wrong')
                                    })
                            })
                            .catch((e) => {
                                setProgress(false)
                                console.log(e)
                                setError('insufficient funds!')
                            })
                    }
                })
            } else {
                setProgress(false)
                setError('your password may be wrong')
            }
        } catch (e) {
            console.log(e)
            setError('something went wrong')
        }
    }
    // console.log("ROLES", assignedRoles.userRolePermission.Role)
    // console.log("allUsers",userData)
    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb routeSegments={[{ name: 'Manage Roles' }]} />
            </div>
            {/* <PasswordPopup status={open} close={handleClose} submit={handleCreateRole} />*/}
            <PasswordPopup
                status={password}
                close={handleClose}
                submit={handlePermission}
            />
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
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
                    horizontal: 'left',
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
            <Container>
                <Row>
                    <Col md={4}>
                        <b>Users</b>
                    </Col>
                    <Col md={3}>
                        <b>Roles  {!createRole && (

                            <Button
                                className="capitalize"
                                variant="contained"
                                color="primary"
                                type="submit"
                                onClick={handleRole}
                            >
                                Create role
                            </Button>

                        )}</b>
                    </Col>
                    <Col md={5}>
                        <b>Permissions  {status && (
                            <Button
                                className="capitalize"
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={
                                    !state.Role ||
                                    progress ||
                                    (!state.Upload &&
                                        !state.Share &&
                                        !state.Partner &&
                                        !state.Transfer &&
                                        !state.Download &&
                                        !state.Revokefile &&
                                        !state.Inactive) ||
                                    selected.length == 0
                                }
                                onClick={() => setPassword(true)}
                            >
                                Grant permission
                            </Button>
                        )}</b>
                    </Col>
                </Row>
                <Row>
                    <Col md={4}>
                        <FormControl
                            className={classes.formControluser}
                            key={'users'}
                        >
                            <InputLabel id={`demo-simple-select-label-type`}>
                                Choose users
                            </InputLabel>
                            <Select
                                labelId={`demo-simple-select-label-type`}
                                id={`demo-simple-select-type`}
                                value={selected}
                                label="Select Users"
                                onChange={handleSelect}
                            >
                                {status &&
                                    allUsers &&
                                    allUsers.map((row, i) => (
                                        <MenuItem
                                            value={allUsers[i]}
                                            key={allUsers[i]}
                                        >
                                            {allUsers[i]}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Col>
                    <Col md={3}>
                        <FormControl
                            className={classes.formControl}
                            key={'roles'}
                        >
                            <InputLabel id="demo-simple-select-label-type">
                                Select Roles
                            </InputLabel>
                            <Select
                                labelId="demo-simple-select-label-type"
                                id="demo-simple-select-type"
                                value={state.Role}
                                label="Select Roles"
                                onChange={handleChange('Role')}
                            >
                                {status &&
                                    allRoles &&
                                    allRoles.map((row, i) => (
                                        <MenuItem value={allRoles[i]} key={i}>
                                            {allRoles[i]}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Col>
                    <Col md={5}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={state.Upload}
                                    onChange={handleChange('Upload')}
                                    value="Upload"
                                    color="primary"
                                />
                            }
                            label="Upload"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={state.Share}
                                    onChange={handleChange('Share')}
                                    value="Share"
                                    color="primary"
                                />
                            }
                            label="Share"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={state.Partner}
                                    onChange={handleChange('Partner')}
                                    value="Partner"
                                    color="primary"
                                />
                            }
                            label="Partner"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={state.Transfer}
                                    onChange={handleChange('Transfer')}
                                    value="Transfer"
                                    color="primary"
                                />
                            }
                            label="Transfer"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={state.Download}
                                    onChange={handleChange('Download')}
                                    value="Download"
                                    color="primary"
                                />
                            }
                            label="Download"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={state.Revokefile}
                                    onChange={handleChange('Revokefile')}
                                    value="Revokefile"
                                    color="primary"
                                />
                            }
                            label="Revoke file"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={state.Inactive}
                                    onChange={handleChange('Inactive')}
                                    value="inactive"
                                    color="primary"
                                />
                            }
                            label="Inactive"
                        />
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <center>

                            {progress && (
                                <div>
                                    <center>
                                        <CircularProgress
                                            className={classes.progress}
                                        />
                                    </center>
                                    <WaitSnackbar
                                        message={
                                            'please wait while permission granted'
                                        }
                                    ></WaitSnackbar>
                                </div>
                            )}
                        </center>
                    </Col>
                </Row>
            </Container>
            <Container>
                {createRole && (
                    <Row>
                        <Col md={5} className="m-auto">
                            {/* {fetch &&
                                <ProgressBar id="progress" animated variant="success" now={progressStatus} label={`${progressStatus}%`} />
                            } */}

                            {creationStatus && (
                                <div>
                                    <center>
                                        <CircularProgress
                                            className={classes.formControl}
                                        />
                                    </center>
                                    <WaitSnackbar
                                        message={
                                            'please wait while role create'
                                        }
                                    ></WaitSnackbar>
                                </div>
                            )}
                            <TextField
                                autoFocus
                                margin="dense"
                                id="rname"
                                label="Role name"
                                type="text"
                                name="rname"
                                fullWidth
                                variant="outlined"
                                onChange={(e) => setRole(e.target.value)}
                            />
                            <center>
                                <Button
                                    className="capitalize"
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={creationStatus || !role}
                                    onClick={handleCreateRole}
                                >
                                    Create
                                </Button>
                            </center>
                        </Col>
                    </Row>
                )}
                <br />
                <h3>Delete Role  <Button
                    className="capitalize"
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={deletionStatus}
                    onClick={roleDelete}
                >
                    Delete
                </Button></h3>

                <Col md={3}>
                    {deletionStatus && (
                        <div>
                            <center>
                                <CircularProgress
                                    className={classes.formControl}
                                />
                            </center>
                            <WaitSnackbar
                                message={
                                    'please wait while role deleted'
                                }
                            ></WaitSnackbar>
                        </div>
                    )}
                    <FormControl
                        className={classes.formControl}
                        key={'roles'}
                    >
                        <InputLabel id="demo-simple-select-label-type">
                            Select Roles
                        </InputLabel>
                        <Select
                            labelId="demo-simple-select-label-type"
                            id="demo-simple-select-type"
                            value={state.Role}
                            label="Select Roles"
                            // disabled={deletionStatus}
                            onChange={handleChange('Role')}
                        >
                            {status &&
                                allRoles &&
                                allRoles.map((row, i) => (
                                    <MenuItem value={allRoles[i]} key={i}>
                                        {allRoles[i]}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>

                </Col>
                {/* <h3>Delete users</h3>
                <Row>
                    <Col md={8}>
                        <FormControl className={classes.formControl}>
                            <InputLabel id={`mutiple-select-label`}>
                                Choose users
                            </InputLabel>
                            <Select
                                labelId={`mutiple-select-label`}
                                id={`mutiple-select-label`}
                                name={`mutiple-select-label`}
                                value={deleteSelected}
                                onChange={handleDelete}
                                renderValue={(selected) => selected.join(', ')}
                                MenuProps={MenuProps}
                            >
                                {status &&
                                    allUsers &&
                                    allUsers.map((row, i) => (
                                        <MenuItem key={i} value={allUsers[i]}>
                                            <ListItemIcon>
                                                <Checkbox
                                                    id={`check-${i}`}
                                                    checked={
                                                        deleteSelected.indexOf(
                                                            allUsers[i]
                                                        ) > -1
                                                    }
                                                    key={i}
                                                ></Checkbox>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={allUsers[i]}
                                                key={i}
                                            />
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Col>
                    <Col>
                        <Button
                            className="capitalize"
                            variant="contained"
                            color="primary"
                            type="submit"
                            onClick={handleRole}
                        >
                            Delete
                        </Button>
                    </Col>
                </Row> */}

            </Container>
            <hr style={{ color: 'blue' }}></hr>
            <Container>
                {tableStatus && (
                    <table id="user-permission">
                        <thead>
                            <tr>
                                <th>Sno.</th>
                                <th>Users</th>
                                <th>Role</th>
                                <th>Permissions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedRoles &&
                                assignedRoles.map((row, i) => (
                                    <>
                                        <tr>
                                            <td className="px-6">{i + 1}</td>
                                            <td className="px-4">
                                                {assignedRoles[i].userEmail}
                                            </td>
                                            <td className="px-4">
                                                {

                                                    assignedRoles[i]
                                                        .userRolePermission.Role

                                                }
                                            </td>
                                            <td className="px-4">
                                                <div>
                                                    {assignedRoles[i]
                                                        .userRolePermission
                                                        .Upload
                                                        ? 'Upload '
                                                        : ''}
                                                    {assignedRoles[i]
                                                        .userRolePermission
                                                        .Share
                                                        ? ' Share'
                                                        : ''}
                                                    {assignedRoles[i]
                                                        .userRolePermission
                                                        .Partner
                                                        ? ' Partner'
                                                        : ''}
                                                    {assignedRoles[i]
                                                        .userRolePermission
                                                        .Transfer
                                                        ? ' Transfer'
                                                        : ''}
                                                    {assignedRoles[i]
                                                        .userRolePermission
                                                        .Download
                                                        ? ' Download'
                                                        : ''}
                                                    {assignedRoles[i]
                                                        .userRolePermission
                                                        .Revokefile
                                                        ? ' Revokefile'
                                                        : ''}
                                                        {assignedRoles[i]
                                                        .userRolePermission
                                                        .Inactive
                                                        ? 'Inactive '
                                                        : ''}
                                                </div>
                                            </td>
                                        </tr>
                                    </>
                                ))}
                        </tbody>
                    </table>
                )}
            </Container>
        </div>
    )
}
