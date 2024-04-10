import React, { useEffect, useState, useCallback } from 'react'
import { ipfs } from './filecomponents/DLTcomponents/Web3/ipfs'
import { CircularProgress } from '@material-ui/core'
import Breadcrumb from 'app/components/Breadcrumb/Breadcrumb'
import { API_URL } from 'ServerConfig'
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS } from 'ServerConfig'
import Web3 from 'web3'
import { Grid } from '@material-ui/core'
import { Button } from '@material-ui/core'
import { Code, LibraryBooks, Photo, PictureAsPdf } from '@material-ui/icons'
import Menu from '@material-ui/core/Menu'
import { Icon } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { MenuItem, Select } from '@material-ui/core'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import  Links  from "@material-ui/core/Link";
import { MatxSearchBox } from 'app/components'
import TransferredFiles from './TransferredFiles'
import DetailsDialog from './DetailsDialog'
import { getAllDIDData } from './StoreDataDid'
import { Folder } from '@material-ui/icons'
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@material-ui/core'

import clsx from 'clsx'

let wallet
let rows = []
let Hash = []
let fileStatus = []
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL))
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
        width: '70px',
        fontSize: '12px',
        marginLeft: '10px',
        marginTop: '1px',
    },
    file: {
        width: '70px',
        fontSize: '12px',
        marginLeft: '10px',
        marginTop: '1px',
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
let data

export default function () {
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [fileHash, setFileHash] = React.useState(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [senderName, setSenderName] = useState('')
    const [fileName, setFileName] = useState('')
    const [transferFileStatus, setTransferFileStatus] = useState(false)
    const [grid, setGrid] = useState(true)
    const [dataTransfer, setDataTransfer] = useState(null)
    const [transferData, setTransferData] = useState(null);
    const [status, setStatus] = useState(false)
    const [checkData,setCheckData] = useState(false)
    let data = JSON.parse(localStorage.getItem("did_data"));

    // console.log("props1",dataTransfer)
    if (
        dataTransfer &&
        Object.keys(dataTransfer).length > 0 &&
        transferData == null
    ) {
        setTransferFileStatus(true)
        setTransferData(dataTransfer)
    }


    let jsonData = {};

    // console.log("dataproject",data.project)
    if (data.project === null || data.project === undefined) {
        // setStatus(true)
        console.log("hello")
    } else {
        jsonData = data;
        // console.log("jsonData", data)
        //  setStatus(true)
    }
//    console.log("hello",jsonData)
    useEffect ( ()=>{
        // console.log("add",data.wallet.walletaddress)
        ;(async()=>{
           await getTransferredFiles(data.wallet.walletaddress)

        })()

    },[]);
    useEffect(() => {
        rows = []
            ; (async () => {
                try {
                    if (
                        localStorage.getItem('did_data') == null ||
                        localStorage.getItem('did_data') == 'empty' ||
                        localStorage.getItem('did_data') == undefined
                    ) {
                        const data = await getAllDIDData()
                        if (data != 'empty') localStorage.setItem('did_data', data)
                    } else {
                        const data = JSON.parse(localStorage.getItem('did_data'))
                        wallet = data.wallet
                        await getAllData(wallet).catch((e) => {
                            console.log(e)
                        })
                    }
                } catch (e) {
                    console.log(e)
                }
            })()
    }, [])

    useEffect(() => {
        ; (async () => {
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
                    const status = await contract.methods
                        .getFileStatus(hash[i])
                        .call({
                            from: wallet.walletaddress,
                        })
                    fileStatus.push(status)
                }
                for(let i = 0; i < fileStatus.length; i++){
                    // console.log("filestatus",fileStatus[i])
                    if(fileStatus[i] == ""){
                        setCheckData(true)
                    }
                }
                
            }
            catch (e) {
                console.log(e)
            }
        })()
    },[])
    async function getTransferredFiles(address) {
        try {
            const opts = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "address": address,
                }),
            }
            const files = await fetch(`${API_URL}/gettransferredfiles`, opts);
            // console.log("file",files.json())
            await files.json()
                .then((res) => {
                    if (res.result.status) {
                        if (res.result.data.length > 0) {
                            // console.log("result",res.result.data)
                            setDataTransfer(res.result.data);
                        }
                    }
                }).catch((e) => {
                    console.log(e)
                })
        }
        catch (e) {
            console.log(e)
        }
    }

    // if (jsonData == null) {
    // } else {
    //     data = jsonData
    // }

    const classes = useStyles()
    const opts = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: localStorage.getItem('userEmail'),
            username: localStorage.getItem('userName'),
        }),
    }
    // console.log("props1",transferData)
    
    function handleMenuClick(event, sender, file, hash) {
        setSenderName(sender)
        setFileHash(hash)
        setFileName(file)
        setAnchorEl(event.currentTarget)
    }
    function handleMenuClose() {
        setAnchorEl(null)
    }
    const showFileDetails = () => {
        setDetailsOpen(true)
    }

 

    const handleClose = () => {
        setDetailsOpen(false)
    }
    const handleRefresh = async () => {
        rows = []
        await getAllData(wallet)
        setStatus(false)
        setTimeout(function () {
            setStatus(true)
        }, 3000)
    }

    const getAllData = async (wallet) => {
        try {
            // console.log('alldata')
            const contract = new web3.eth.Contract(
                CONTRACT_ABI,
                CONTRACT_ADDRESS,
                {
                    from: wallet.walletaddress,
                    gasLimit: '0x200b20',
                }
            )
            const data = await contract.methods
                .getFileHashForReciever(wallet.walletaddress)
                .call({ from: wallet.walletaddress })
            for (let i = 0; i < data.length; i++) {
                await contract.methods
                    .getParticularFile(data[i])
                    .call({
                        from: wallet.walletaddress,
                    })
                    .then((response) => {
                        // console.log(response)
                        // console.log("rows","1", response[i].fileName)
                        // var ext = /^.+\.([^.]+)$/.exec(response[i].fileName);
                        // console.log("ab",ext)
                        Hash.push(data[i])
                        rows.push(response)
                    })
                    .catch((E) => { })
            }
            // console.log(rows)
        } catch (e) {
            console.log(e)
        }
    }
    // console.log("get",getAllData)
    // console.log("rows", rows)
    const selectView = (value) => {
        if (value === 'grid') setGrid(true)
        else setGrid(false)
    }
    setTimeout(function () {
        setStatus(true)
    }, 2000)

    // console.log("rows",rows);
    // console.log("tran",transferData)
    return (
        <div className="m-sm-30">
            <div className="mb-sm-30">
                <Breadcrumb routeSegments={[{ name: 'Recieved documents' }]} />
            </div>
            {rows && grid && <MatxSearchBox rows={rows}></MatxSearchBox>}
            <div>
                <DetailsDialog
                    sender={senderName}
                    fileName={fileName}
                    detailsOpen={detailsOpen}
                    handleClose={handleClose}
                ></DetailsDialog>
                <br />
                <br />
                <br />
                <Icon
                    style={{
                        marginLeft: '20px',
                        marginTop: '-10px',
                        float: 'right',
                    }}
                    variant="outlined"
                    onClick={handleRefresh}
                >
                    refresh
                </Icon>

                <div id="recievedfileshead">
                    <h3>Documents</h3>

                    <Select
                        size="small"
                        defaultValue="grid"
                        disableUnderline
                        style={{ float: 'right', border: '1px solid' }}
                    >
                        <MenuItem
                            value="grid"
                            onClick={() => selectView('grid')}
                        >
                            Grid view
                        </MenuItem>
                        <MenuItem
                            value="list"
                            onClick={() => selectView('list')}
                        >
                            List view
                        </MenuItem>
                    </Select>
                </div>
                <br />
                <div id="recievedfiles">
                    <Grid container spacing={2}>
                        {grid ? (
                            status && rows ? (
                                rows.map((key, i) => (
                                    <Grid item md={2} key={i}>
                                        <Button
                                            className={classes.thumb}
                                            variant="outlined"
                                            color="primary"
                                        //onClick={}
                                        >
                                            <div>
                                                {rows[i].extension ==
                                                    'image/jpg' ||
                                                    rows[i].extension ==
                                                    'image/png' ||
                                                    rows[i].extension ==
                                                    'image/jpeg' ||
                                                    rows[i].extension ==
                                                    'image/gif' ? (
                                                    <Photo></Photo>
                                                ) : rows[i].extension ==
                                                    'text/plain' ? (
                                                    <LibraryBooks></LibraryBooks>
                                                ) : rows[i].extension ==
                                                    'application/pdf' ? (
                                                    <PictureAsPdf></PictureAsPdf>
                                                ): (
                                                    (() => {
                                                        if (rows[i].fileName) {
                                                            var ext = /^.+\.([^.]+)$/.exec(rows[i].fileName);
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
                                                <div>
                                                    {rows[i].fileName.length >
                                                        10 ? (
                                                        <div>
                                                            <span
                                                                className={
                                                                    classes.file
                                                                }
                                                            >{`${rows[
                                                                i
                                                            ].fileName.substring(
                                                                0,
                                                                9
                                                            )}...`}</span>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <span
                                                                className={
                                                                    classes.file
                                                                }
                                                            >
                                                                {
                                                                    rows[i]
                                                                        .fileName
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </Button>
                                            <div>
                                                <Icon
                                                    style={{
                                                        position: 'absolute',
                                                        marginLeft: '32px',
                                                        marginTop: '-65px',
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
                                                            rows[i].senderName,
                                                            rows[i].fileName,
                                                            Hash[i]
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
                                                        marginTop: '6px',
                                                    }}
                                                >
                                                    <Links
                                                        href={`/project/show/${fileHash != null &&
                                                            Buffer.from(
                                                                fileHash
                                                            ).toString('base64')
                                                            }`}
                                                        target=""
                                                        style={{
                                                            textDecoration:
                                                                'initial',
                                                            color: 'inherit',
                                                        }}
                                                    >
                                                        <MenuItem>
                                                            Open
                                                        </MenuItem>
                                                    </Links>
                                                    <MenuItem
                                                        onClick={() => {
                                                            showFileDetails()
                                                        }}
                                                    >
                                                        Details
                                                    </MenuItem>
                                                </Menu>
                                            </div>
                                        </Button>
                                    </Grid>
                                ))
                            ) : (
                                <div>
                                    <center>
                                        <CircularProgress
                                            className={classes.progress}
                                        />
                                    </center>
                                </div>
                            )
                        ) : (
                            <Table
                                className={clsx(
                                    'whitespace-pre min-w-800',
                                    classes.productTable
                                )}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell className="px-6" colSpan={2}>
                                            SNo.
                                        </TableCell>
                                        <TableCell className="px-0" colSpan={2}>
                                            Type
                                        </TableCell>
                                        <TableCell className="px-0" colSpan={2}>
                                            File Name
                                        </TableCell>
                                        <TableCell className="px-0" colSpan={2}>
                                            Action
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows &&
                                        rows.map((row, i) => (
                                            <TableRow key={i} hover>
                                                <TableCell
                                                    className="px-0 capitalize"
                                                    align="left"
                                                    colSpan={2}
                                                    index={i}
                                                >
                                                    <div className="flex items-center">
                                                        <p className="m-0 ml-4">
                                                            {i + 1}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell
                                                    className="px-0 capitalize"
                                                    align="left"
                                                    colSpan={2}
                                                >
                                                    {rows[i].extension ==
                                                        'image/jpg' ||
                                                        rows[i].extension ==
                                                        'image/png' ||
                                                        rows[i].extension ==
                                                        'image/jpeg' ||
                                                        rows[i].extension ==
                                                        'image/gif' ? (
                                                        <Photo></Photo>
                                                    ) : rows[i].extension ==
                                                        'text/plain' ? (
                                                        <LibraryBooks></LibraryBooks>
                                                    ) : rows[i].extension ==
                                                        'application/pdf' ? (
                                                        <PictureAsPdf></PictureAsPdf>
                                                    ) : (
                                                        (() => {
                                                            if (rows[i].fileName) {
                                                                var ext = /^.+\.([^.]+)$/.exec(rows[i].fileName);
                                                                return ext == null ? "" : ext[1];
    
                                                            }
                                                        })()
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    className="px-0 capitalize"
                                                    align="left"
                                                    colSpan={2}
                                                >
                                                    <span>
                                                        {rows[i].fileName}
                                                    </span>
                                                </TableCell>
                                                <TableCell
                                                    className="px-0 capitalize"
                                                    align="left"
                                                    colSpan={2}
                                                >
                                                    <div>
                                                        <Icon
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
                                                                    rows[i]
                                                                        .senderName,
                                                                    rows[i]
                                                                        .fileName,
                                                                    Hash[i]
                                                                )
                                                            }
                                                        >
                                                            more_vert
                                                        </Icon>
                                                        <Menu
                                                            id="simple-menu"
                                                            anchorEl={anchorEl}
                                                            open={Boolean(
                                                                anchorEl
                                                            )}
                                                            onClose={
                                                                handleMenuClose
                                                            }
                                                            style={{
                                                                marginLeft:
                                                                    '-60px',
                                                                marginTop:
                                                                    '5px',
                                                            }}
                                                        >
                                                            <Links
                                                                href={`/project/show/${fileHash !=
                                                                    null &&
                                                                    Buffer.from(
                                                                        fileHash
                                                                    ).toString(
                                                                        'base64'
                                                                    )
                                                                    }`}
                                                                target="_"
                                                                style={{
                                                                    textDecoration:
                                                                        'initial',
                                                                    color: 'inherit',
                                                                }}
                                                            >
                                                                <MenuItem>
                                                                    Open
                                                                </MenuItem>
                                                            </Links>
                                                            <MenuItem
                                                                onClick={() => {
                                                                    showFileDetails()
                                                                }}
                                                            >
                                                                Details
                                                            </MenuItem>
                                                        </Menu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        )}
                    </Grid>
                </div>
                <hr></hr>{
                    (() => {
                        if(transferFileStatus && checkData){
                            return(
                                <>
                                <h3>Transferred Files</h3>
                                <Grid item md={2} key={"tfile"}>
                                    <div>
                                        <Link to={{
                                            pathname: "/transfer",
                                            state: transferData // your data array of objects
                                        }}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                            >
                                                <Folder></Folder>
                                                {"Transferred"}
                                            </Button>

                                        </Link>
                                        {/* <Link to="/transfer">
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                            >
                                                <Folder></Folder>
                                                {"Transferred"}
                                            </Button>
                                        </Link> */}

                                    </div>
                                </Grid>
                                </>
                            )
                                
                        }
                    })()
                }
                        
            </div>
        </div>
    )
}
