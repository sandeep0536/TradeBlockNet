import React from 'react'
import { useEffect } from 'react'
import { getTransferredFiles } from './StoreDataDid'
import Web3 from 'web3'
import {
    INFURA_URL,
    CONTRACT_ABI,
    CONTRACT_ADDRESS,
    API_URL,
    TRANSFER_WARNING,
} from 'ServerConfig'
import { useState } from 'react'
import { Button } from '@material-ui/core'
import { LibraryBooks, Photo, PictureAsPdf } from '@material-ui/icons'
import { Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Icon } from '@material-ui/core'
import Menu from '@material-ui/core/Menu'
import { MenuItem } from '@material-ui/core'
import { Link } from '@material-ui/core'
import { Breadcrumb, ConfirmationDialog } from 'app/components'
import { CircularProgress } from '@material-ui/core'
import LogDialog from '../dialog/ResponsiveDialog'
import ShareFilePopup from './ShareFilePopup'
import { MenuProps } from '../projecttest/filecomponents/utils'
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from './SnackbarComponent'
import WaitSnackbar from '../projecttest/filecomponents/WaitSnackbar'
import TransferPopup from './TransferPopup'
import { getUserRole } from './roles/UserRoles'
import { ipfs } from '../projecttest/filecomponents/DLTcomponents/Web3/ipfs'
import RoleWarningPopup from './RoleWarningPopup'

let contacts = []

const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1),
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
}))

const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL))
let allFiles = []

let fileStatus = []
let wallet
export default function TransferredFiles(props) {
    const classes = useStyles()
    const [success, setSuccess] = useState(null)
    const [uploadFileId, setUploadFileId] = useState(null)
    const [currentHash, setCurrentHash] = useState(null)
    const [currentExt, setCurrentExt] = useState(null)
    const [logsData, setLogsData] = useState(null)
    const [hash, setHash] = useState(null)
    const [error, setError] = useState(null)
    const [ext, setExt] = useState(null)
    const [filename, setFilename] = useState(null)
    const [upload, setUpload] = useState(true)
    const [share, setShare] = useState(false)
    const [status, setStatus] = useState(true)
    const [shareStatus, setShareStatus] = useState(false)
    const [open, setOpen] = useState(false)
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [showPassord, setShowPassword] = useState(false)
    const [expire, setExpire] = useState(false)
    const [uploadComponent, setUploadComponent] = useState(false)
    const [file, setFile] = useState({ files: [] })
    const [selectedDate, setSelectedDate] = React.useState(Date.now())
    const [selected, setSelected] = useState([])
    const [transferProgress, setTransferProgress] = useState(false)
    const [transfer, setTransfer] = useState(false)
    const [currentLogs, setCurrentLogs] = useState(null)
    const [showLogs, setShowLogs] = useState(false)
    const [restrictUser, setRestrictUser] = useState(false)
    const [shareRestrictUser, setShareRestrictUser] = useState(false)
    const [transferRestricUser, setTransferRestricUser] = useState(false)
    const [warning, setWarning] = useState(null)
    // console.log("tres",transfer)
    function handleMenuClose() {
        setAnchorEl(null)
    }
    function handleShareOpen() {
        setShare(true)
    }

    const handleMenuClick = async (event, hash, ext, file, id) => {
        event.preventDefault()
        getFileId(hash)
        setCurrentHash(hash)
        // console.log("ext",ext)
        setCurrentExt(ext)
        setFilename(file)
        setHash(hash)
        setExt(ext)
        setAnchorEl(event.currentTarget)
    }
    const getFileId = async (hash) => {
        try {
            const contract = new web3.eth.Contract(
                CONTRACT_ABI,
                CONTRACT_ADDRESS,
                {
                    from: wallet.walletaddress,
                    gasLimit: '0x200b20',
                }
            )
            const id = await contract.methods.getFileIdByUploadHash(hash).call({
                from: wallet.walletaddress,
            })
            setUploadFileId(id)
            var log = logsData.filter((obj) => obj.file_id === id)
            setCurrentLogs(log.length > 0 ? log : null)
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        ; (async () => {
            allFiles = []
            const data = JSON.parse(localStorage.getItem('did_data'))
            wallet = data.wallet
            try {
                const contract = new web3.eth.Contract(
                    CONTRACT_ABI,
                    CONTRACT_ADDRESS,
                    {
                        from: wallet.walletaddress,
                        gasLimit: '0x200b20',
                    }
                )
                const hash = await contract.methods
                    .getAllFilesUploadedByUser(wallet.walletaddress)
                    .call({
                        from: wallet.walletaddress,
                    })
                for (let i = 0; i < hash.length; i++) {
                    const data = await contract.methods
                        .getFileMetaData(hash[i])
                        .call({
                            from: wallet.walletaddress,
                        })
                    const status = await contract.methods
                        .getFileStatus(hash[i])
                        .call({
                            from: wallet.walletaddress,
                        })
                    fileStatus.push(status)
                    // console.log("allFiles",allFiles)

                    allFiles.push(data)
                }
                setStatus(false)
                await getTransferredFiles(wallet.walletaddress)
                const rolehash = await getUserRole()
                if (rolehash == '') {
                    if (data.userToken == null) setRestrictUser(false)
                    else if (
                        data.companyProfile == null ||
                        data.companyProfile == undefined
                    ) {
                        setRestrictUser(true)
                        setWarning(TRANSFER_WARNING)
                    }
                } else {
                    ipfs.files.get(rolehash, function (err, files) {
                        try {
                            const data = JSON.parse(
                                files[0].content.toString('binary')
                            )
                            const permissions = data[0].userRolePermission
                            // console.log(permissions)
                            if (permissions.Inactive) {
                                setTransferRestricUser(true)
                                setWarning(
                                    'you have an Inactive user'
                                )
                            }
                            else if (!permissions.Transfer) {
                                setTransferRestricUser(true)
                                setWarning(
                                    'you have no permission to transfer files you can only view them!'
                                )
                            }
                            if (!permissions.Share) {
                                setShareRestrictUser(true)
                            }
                        } catch (e) {
                            console.log(e)
                        }
                    })
                }
            } catch (e) {
                console.log(e)
            }
        })()
    }, [])
    // console.log("allFiles", allFiles);
    function handleLogs() {
        // console.log("",showLogs)
        setShowLogs(!showLogs)
    }
    function handleWarning() {
        setWarning(null)
    }

    async function getTransferredFiles(address) {
        // console.log("address",address)
        try {
            const opts = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: address,
                }),
            }
            const files = await fetch(`${API_URL}/gettransferredfiles`, opts)
            // console.log("file",files.json())
            await files
                .json()
                .then((res) => {
                    if (res.result.status) {
                        if (res.result.data.length > 0) {
                            setLogsData(res.result.data)
                        }
                    }
                })
                .catch((e) => {
                    console.log(e)
                })
        } catch (e) {
            console.log(e)
        }
    }
    // console.log("logs",logsData)
    function handleShareClose() {
        setShare(!share)
    }
    function handleSnackbarClose(event, reason) {
        if (reason === 'clickaway') {
            return
        }
        setSuccess(null)
    }
    function handleErrorClose(event, reason) {
        setError(null)
    }
    function handleTransfer() {
        setTransfer(!transfer)
    }
    function handleTransferProgress() {
        setTransferProgress(!transferProgress)
    }
    // console.log("allfiles",allFiles)
    // console.log("trans",transfer)
    // console.log("logsData",logsData)
    // console.log("filetransfer",fileStatus)
    // console.log("transs",transferProgress)
    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb
                    routeSegments={[{ name: 'Transferred Projects' }]}
                />
            </div>
            <RoleWarningPopup
                status={warning != null}
                close={handleWarning}
                content={warning}
                title={'Transfer file warning'}
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
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={success != null}
                autoHideDuration={3000}
                onClose={handleErrorClose}
            >
                <MySnackbarContentWrapper
                    onClose={handleErrorClose}
                    variant="success"
                    message={success}
                />
            </Snackbar>
            <ShareFilePopup
                status={share}
                close={handleShareClose}
                fileId={uploadFileId}
                error={setError}
                anchor={setAnchorEl}
                success={setSuccess}
                shareStatus={setShareStatus}
                share={setShare}
                hash={hash}
                ext={ext}
                fileName={filename}
            />
            <TransferPopup
                status={transfer}
                close={handleTransfer}
                error={setError}
                anchor={setAnchorEl}
                success={setSuccess}
                progress={handleTransferProgress}
                project={'Transfer'}
                hash={hash}
            />
            {showLogs && currentLogs != null && (
                <LogDialog
                    status={showLogs}
                    header={'File Logs'}
                    close={handleLogs}
                    transfer={true}
                    content={currentLogs}
                />
            )}
            {shareStatus && (
                <div>
                    <center>
                        <CircularProgress className={classes.progress} />
                    </center>
                    <WaitSnackbar
                        message={'please wait while file share'}
                    ></WaitSnackbar>
                </div>
            )}
            {transferProgress && (
                <div>
                    <center>
                        <CircularProgress className={classes.progress} />
                    </center>
                    <WaitSnackbar
                        message={'please wait while file transfer'}
                    ></WaitSnackbar>
                </div>
            )}
            <Grid container spacing={2}>
                {status ? (
                    <CircularProgress className={classes.progress} />
                ) : (
                    allFiles &&
                    allFiles.map(
                        (row, i) =>
                            allFiles[i].project == 'transfer' &&
                            fileStatus[i] != 'Transfer' && (
                                <Grid item md={2} key={i}>
                                    <Button
                                        className={classes.thumb}
                                        variant="outlined"
                                        color="primary"
                                    >
                                        <div>
                                            {allFiles[i].fileExt ===
                                                'image/jpg' ||
                                                allFiles[i].fileExt ===
                                                'image/png' ||
                                                allFiles[i].fileExt ===
                                                'image/jpeg' ||
                                                allFiles[i].fileExt ===
                                                'image/gif' ||
                                                allFiles[i].fileExt ===
                                                'image/svg+xml' ||
                                                allFiles[i].fileExt ===
                                                'image/svg' ? (
                                                <Photo></Photo>
                                            ) : allFiles[i].fileExt ===
                                                'text/plain' ? (
                                                <LibraryBooks></LibraryBooks>
                                            ) : allFiles[i].fileExt ===
                                                'application/pdf' ? (
                                                <PictureAsPdf></PictureAsPdf>
                                            ) : (
                                                (() => {
                                                    if (allFiles[i].fileName) {
                                                        var ext = /^.+\.([^.]+)$/.exec(allFiles[i].fileName);
                                                        return ext == null ? "" : ext[1];

                                                    }
                                                })()
                                            )}
                                        </div>
                                        <Button
                                            className={classes.innerthumb}
                                            variant="outlined"
                                            color="primary"
                                        >
                                            {allFiles[i].fileName.length >
                                                10 ? (
                                                <span
                                                    className={classes.file}
                                                >{`${allFiles[
                                                    i
                                                ].fileName.substring(
                                                    0,
                                                    9
                                                )}...`}</span>
                                            ) : (
                                                <span className={classes.file}>
                                                    {allFiles[i].fileName}
                                                </span>
                                            )}
                                        </Button>
                                        <>
                                            <Icon
                                                style={{
                                                    position: 'absolute',
                                                    marginLeft: '110px',
                                                    marginTop: '-120px',
                                                }}
                                                variant="outlined"
                                                aria-owns={
                                                    anchorEl
                                                        ? 'simple-menu'
                                                        : undefined
                                                }
                                                aria-haspopup="true"
                                                onClick={(e) =>
                                                    handleMenuClick(
                                                        e,
                                                        allFiles[i].hash,
                                                        allFiles[i].fileExt,
                                                        allFiles[i].fileName
                                                    )
                                                }
                                            >
                                                more_vert
                                            </Icon>
                                            <Menu
                                                id="simple-menu"
                                                anchorEl={anchorEl}
                                                open={Boolean(anchorEl)}
                                                onClose={handleMenuClose}
                                                style={{
                                                    marginLeft: '-60px',
                                                    marginTop: '16px',
                                                }}
                                            >
                                                <Link
                                                    href={`/project/showowner/${currentHash != null &&
                                                        Buffer.from(
                                                            '' + currentHash
                                                        ).toString('base64')
                                                        }/${currentExt}/transfer`}
                                                    target=""
                                                    style={{
                                                        textDecoration:
                                                            'initial',
                                                        color: 'inherit',
                                                    }}
                                                >
                                                    <MenuItem>Open</MenuItem>
                                                </Link>
                                                {!shareRestrictUser && (
                                                    <MenuItem
                                                        onClick={() =>
                                                            handleShareOpen(
                                                                hash,
                                                                ext,
                                                                filename,
                                                                uploadFileId
                                                            )
                                                        }
                                                    >
                                                        {'Share'}
                                                    </MenuItem>
                                                )}
                                                {!transferRestricUser && (
                                                    <MenuItem
                                                        onClick={handleTransfer}
                                                    >
                                                        {'Transfer'}
                                                    </MenuItem>
                                                )}
                                                <MenuItem onClick={handleLogs}>
                                                    Logs
                                                </MenuItem>
                                            </Menu>
                                        </>
                                    </Button>
                                </Grid>
                            )
                    )
                )}
            </Grid>
        </div>
    )
}
