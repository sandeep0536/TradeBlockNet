import React, { useEffect } from 'react'
import {
    Card,
    Icon,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    MenuItem,
    Select,
    Button,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@mui/material/Tooltip';
import moment from 'moment'
import clsx from 'clsx'
import Web3 from 'web3'
import { API_URL, INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS } from 'ServerConfig'
import { CircularProgress } from '@material-ui/core'
import { useState } from 'react'
import {
    checkLoginStatus,
    getAllDIDData,
} from 'app/views/material-kit/projecttest/StoreDataDid'
import { CheckSubscription } from 'app/views/material-kit/projecttest/CheckSubscription'
import 'datatables.net-dt/js/dataTables.dataTables'
import 'datatables.net-dt/css/jquery.dataTables.min.css'
import $ from "jquery";
import { useLocation } from 'react-router'
import RecievedFilesDashboard from './RecievedFilesDashboard'
import MessageDashboard from './MessageDashboard'
import PaymentsDashboard from './PaymentsDashboard'
import history from 'history.js'
import QrPopup from './QrPopup'
const useStyles = makeStyles(({ palette, ...theme }) => ({
    productTable: {
        '& small': {
            height: 15,
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

/**
 * create instance of web3 with infura provider
 */
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL))

let rows = []
let sharerows = []
let sharehash = []
let allhash = []
let sharer = []
let keys;



const TopSellingTable = (props) => {
    const classes = useStyles()
    const [wallet, setWallet] = useState(true)
    const [status, setStatus] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [loading, setLoading] = useState(false)
    const [viewMoreHash, setViewMoreHash] = useState('')
    const [fileId, setFileId] = useState(null)
    const [fileSize, setFileSize] = useState(null)
    const [fileStatus, setFileStatus] = useState(null)
    const { pathname } = useLocation()
    const [hashStatus, setHashStatus] = useState(null)
    const [transactionTx, setTransactionTx] = useState(null)
        // const [rows,setRows] = useState([])

        ; (async () => {
            try {
                const didData = localStorage.getItem('did_data');
                const isDIDDataEmpty =
                    didData === null ||
                    didData === 'undefined' ||
                    didData === 'empty' ||
                    didData === undefined;

                if (isDIDDataEmpty) {
                    const data = await getAllDIDData();
                    if (data === 'empty' || data === undefined) {
                        setWallet(false);
                        setStatus(true);
                    } else {
                        localStorage.setItem('did_data', data);
                        setWallet(false);
                        setStatus(true);
                    }
                } else {
                    const data = JSON.parse(localStorage.getItem('did_data'));
                    const wallet = data.wallet;

                    try {
                        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                            from: wallet.walletaddress,
                            gasLimit: '0x200b20',
                        });

                        allhash = await contract.methods
                            .getAllFilesUploadedByUser(wallet.walletaddress)
                            .call({ from: wallet.walletaddress });

                        const uniqueRows = await Promise.all(
                            allhash.map(async (hash) => {
                                const key = 'uploadTime';
                                return await contract.methods.getFileMetaData(hash).call({
                                    from: wallet.walletaddress,
                                });
                            })
                        );

                        const key = 'uploadTime'; // Define key here

                        rows = [...new Map(uniqueRows.map((item) => [item[key], item])).values()];

                        sharehash = await contract.methods
                            .getAllSharedHash(wallet.walletaddress)
                            .call({ from: wallet.walletaddress });

                        if (sharerows.length === 0) {
                            sharerows = await Promise.all(
                                sharehash.map(async (hash) => {
                                    return await contract.methods.getFileDetails(hash).call({
                                        from: wallet.walletaddress,
                                    });
                                })
                            );
                        }

                        setStatus(true);
                        setTimeout(() => {
                            $('#dataTable').dataTable({
                                bDestroy: true,
                                autoWidth: false,
                                scrollX: true,
                                columnDefs: [{ "type": "date", "targets": 3 }],
                            });
                        }, 1000);
                    } catch (e) {
                        setStatus(true);
                        console.log(e);
                    }
                }
            } catch (e) {
                console.log(e);
            }
        })();

    // useEffect(()=>{

    //     let Timestamp = document.querySelector('.time-sort')
    //     delete Timestamp.ariaSort
    //     Timestamp.addEventListener('click',()=>{
    //        rows.sort((a,b)=>{
    //         return new Date(b.uploadTime) - new Date(a.uploadTime);
    //        })
    //        console.log(rows)
    //     })

    // },[])
    async function viewMore(hash, action) {
        setHashStatus(hash);

        if (hash) {
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                from: wallet.walletaddress,
                gasLimit: '0x200b20',
            });

            if (action === 'upload') {
                const [id, status, size] = await Promise.all([
                    contract.methods.getFileIdByUploadHash(hash).call({ from: wallet.walletaddress }),
                    contract.methods.getFileStatus(hash).call({ from: wallet.walletaddress }),
                    contract.methods.getFileSize(hash).call({ from: wallet.walletaddress }),
                ]);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "filehash": hash,
                    }),
                };

                const resTransactionReciept = await fetch(`${API_URL}/getTransactionReciept`, opts);
                const transactionTx = await resTransactionReciept.json().then((response) => response.data[0].transaction_hash).catch((err) => {
                    console.log(err);
                });

                setFileId(id);
                setFileSize(size);
                setFileStatus(status);
                setTransactionTx(transactionTx);
            } else {
                const [id, status] = await Promise.all([
                    contract.methods.getFileIdByShareHash(hash).call({ from: wallet.walletaddress }),
                    contract.methods.getFileStatus(hash).call({ from: wallet.walletaddress }),
                ]);

                setFileId(id);
                setFileStatus(status);
                setFileSize(null);
            }
        }
    }

    async function handleQrPopup(hash, action) {
        if (hash === '') {
            setViewMoreHash(!viewMoreHash);
            setTransactionTx("undefined");
        } else {
            setLoading(true);
            viewMore(hash, action)
                .then(() => {
                    setLoading(false);
                    setViewMoreHash(!viewMoreHash);
                })
                .catch((error) => {
                    setLoading(false);
                    console.log(error);
                });
        }
    }


    /**
     * function to get fetch data from contract
     * when user click on refresh icon
     */
    const handleRefresh = async () => {
        rows = []
        sharerows = []
        // setStatus(true)
        setRefresh(true)
        const wallet = JSON.parse(localStorage.getItem('did_data'))
        // console.log('wallet', wallet)
        await getRefreshData(wallet.wallet)
    }
    setInterval(function () {
        if (localStorage.getItem('did_data') == 'empty') {
            setStatus(true)
        }
    }, 100)
    const getRefreshData = async (wallet) => {
        try {
            const contract = new web3.eth.Contract(
                CONTRACT_ABI,
                CONTRACT_ADDRESS,
                {
                    from: wallet.walletaddress,
                    gasLimit: '0x200b20',
                }
            );

            allhash = await contract.methods.getAllFilesUploadedByUser(wallet.walletaddress).call({
                from: wallet.walletaddress,
            });

            const fileMetaDataPromises = allhash.map(async (hash) => {
                return contract.methods.getFileMetaData(hash).call({
                    from: wallet.walletaddress,
                });
            });

            rows = (await Promise.all(fileMetaDataPromises)).map((item) => item['uploadTime']);

            //    sharehash = await contract.methods.getAllSharedHash(wallet.walletaddress).call({
            //     from: wallet.walletaddress,
            //   });

            //   const fileDetailsPromises = sharehash.map(async (hash) => {
            //     return contract.methods.getFileDetails(hash).call({
            //       from: wallet.walletaddress,
            //     });
            //   });

            //   sharerows = await Promise.all(fileDetailsPromises);
            sharehash = await contract.methods
                .getAllSharedHash(wallet.walletaddress)
                .call({ from: wallet.walletaddress });

            if (sharerows.length === 0) {
                sharerows = await Promise.all(
                    sharehash.map(async (hash) => {
                        return await contract.methods.getFileDetails(hash).call({
                            from: wallet.walletaddress,
                        });
                    })
                );
            }

            setRefresh(false);
        } catch (e) {
            console.log(e);
        }
    };


    return (
        <div className="analytics m-sm-30 mt-6">
            {viewMoreHash != '' ? (
                <QrPopup
                    status={viewMoreHash}
                    close={() => handleQrPopup('', '')}
                    filelink={hashStatus}
                    fileTx={transactionTx}
                    fileId={fileId}
                    size={Number(fileSize) / 1000 + ' KB'}
                    filestatus={fileStatus}
                />
            ) : (
                ''
            )}
            {pathname == '/dashboard/receivedfiles' && (
                <RecievedFilesDashboard />
            )}
            {pathname == '/dashboard/messages' && <MessageDashboard />}
            {pathname == '/dashboard/payments' && <PaymentsDashboard />}
            {(pathname == '/dashboard/myfiles' || pathname == '/dashboard') && (
                <Card elevation={3} className="pt-5 mb-6">
                    <div className="flex justify-between items-center px-6 mb-3">
                        <span className="card-title">
                            Upload/Shared/Transfer Files
                            <Icon
                                style={{
                                    position: 'absolute',
                                    marginLeft: '20px',
                                }}
                                variant="outlined"
                                onClick={handleRefresh}
                            >
                                refresh
                            </Icon>
                        </span>
                        <Select
                            size="small"
                            defaultValue="this_month"
                            disableUnderline
                        >
                            <MenuItem value="this_month">This Month</MenuItem>
                            <MenuItem value="last_month">Last Month</MenuItem>
                        </Select>
                    </div>
                    <Table id="dataTable">
                        {/* style="margin-left: 0px;width: 1531px;" */}
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ whiteSpace: 'nowrap' }}>
                                    SNo.
                                </TableCell>
                                <TableCell style={{ whiteSpace: 'nowrap' }}>
                                    Project
                                </TableCell>
                                <TableCell style={{ whiteSpace: 'nowrap' }}>
                                    File Name
                                </TableCell>
                                <TableCell style={{ whiteSpace: "nowrap" }}>
                                    Timestamp
                                </TableCell>
                                {/* <TableCell style={{ whiteSpace: 'nowrap' }}>
                                    Format
                                </TableCell> */}
                                <TableCell style={{ whiteSpace: 'nowrap' }}>
                                    Issuer name
                                </TableCell>
                                <TableCell style={{ whiteSpace: 'nowrap' }}>
                                    Recipient name
                                </TableCell>
                                <TableCell style={{ whiteSpace: 'nowrap' }}>
                                    Revocation
                                </TableCell>
                                <TableCell style={{ whiteSpace: 'nowrap' }}>
                                    Comments
                                </TableCell>
                                <TableCell style={{ whiteSpace: 'nowrap' }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        {refresh || !status ? (
                            <div>
                                <center>
                                    <CircularProgress
                                        className={classes.progress}
                                    />
                                </center>
                            </div>
                        ) : (
                            <TableBody>
                                {/**
                                 * shown all uploaded data
                                 */}
                                {rows
                                    ? rows.map((item, i) => (
                                        <TableRow key={i} hover>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{
                                            //     whiteSpace: 'nowrap',
                                            // }}
                                            >
                                                <div className="flex items-center">
                                                    <p className="m-0 ml-4">
                                                        {i + 1}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{
                                            //     whiteSpace: 'nowrap',
                                            // }}
                                            >
                                                {(() => {
                                                    if (rows[i].project > 100) {
                                                        return (
                                                            <div>
                                                                {`${rows[i].project.slice(0, 3) + "..."}`}
                                                                <Tooltip title={rows[i].project}>
                                                                    <span>
                                                                        <Button size='small' color='primary' >more</Button>
                                                                    </span>
                                                                </Tooltip>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        rows[i].project
                                                    );

                                                })()}
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{
                                            //     whiteSpace: 'nowrap',
                                            // }}
                                            >

                                                {
                                                    (() => {
                                                        if (rows[i].fileName.length > 100) {
                                                            return (
                                                                <div>
                                                                    {`${rows[i].fileName.slice(0, 3) + "..."}`}
                                                                    <Tooltip title={rows[i].fileName}>
                                                                        <span>
                                                                            <Button size='small' color='primary' >more</Button>
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            rows[i].fileName
                                                        );

                                                    })()
                                                }

                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            >

                                                {new moment(
                                                    rows[i].uploadTime * 1000
                                                ).format()}
                                            </TableCell>

                                            {/* <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                                style={{
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {
                                                    (() => {
                                                        if (rows[i].fileExt.length >= 13) {
                                                            return (
                                                                <div>
                                                                    {`${rows[i].fileExt.slice(0, 3) + "..."}`}

                                                                    <Tooltip title={rows[i].fileExt}>
                                                                        <span>
                                                                            <Button size='small' color='primary'>more</Button>
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            rows[i].fileExt
                                                        );

                                                    })()
                                                }

                                            </TableCell> */}
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{
                                            //     whiteSpace: 'nowrap',
                                            // }}
                                            >
                                                {
                                                    (() => {
                                                        if (rows[i].uploadedBy.length >= 100) {
                                                            return (
                                                                <div>
                                                                    {`${rows[i].uploadedBy.slice(0, 3) + "..."}`}

                                                                    <Tooltip title={rows[i].uploadedBy}>
                                                                        <span>
                                                                            <Button size='small' color='primary'>more</Button>
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            rows[i].uploadedBy
                                                        );

                                                    })()
                                                }
                                            </TableCell>

                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{
                                            //     whiteSpace: 'nowrap',
                                            // }}
                                            >
                                                {'N/A'}
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{
                                            //     whiteSpace: 'nowrap',
                                            // }}
                                            >
                                                {'N/A'}
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{
                                            //     whiteSpace: 'nowrap',
                                            // }}
                                            >
                                                {'N/A'}
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{
                                            //     whiteSpace: 'nowrap',
                                            // }}
                                            >
                                                <Button
                                                    variant="outlined"
                                                    onClick={() =>
                                                        handleQrPopup(
                                                            rows[i].hash,
                                                            'upload'
                                                        )
                                                    }
                                                >
                                                    View More
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    : wallet && (
                                        <div>
                                            <center>
                                                <CircularProgress
                                                    className={
                                                        classes.progress
                                                    }
                                                />
                                            </center>
                                        </div>
                                    )}
                                {/**
                                 * shown shared data
                                 */}

                                {sharerows
                                    ? sharerows.map((item, j) => (
                                        <TableRow key={j} hover>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            >
                                                <div className="flex items-center">
                                                    <p className="m-0 ml-4">
                                                        {rows.length +
                                                            (j + 1)}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            >
                                                {'-'}
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{
                                            //     whiteSpace: 'nowrap',
                                            // }}
                                            >
                                                {
                                                    (() => {
                                                        if (sharerows[j].fileName.length > 100) {
                                                            return (
                                                                <div>
                                                                    {`${sharerows[j].fileName.slice(0, 3) + "..."}`}
                                                                    <Tooltip title={sharerows[j].fileName}>
                                                                        <span>
                                                                            <Button size='small' color='primary'>more</Button>
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            sharerows[j].fileName
                                                        );

                                                    })()
                                                }
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"

                                            >
                                                {new moment(
                                                    sharerows[j].shareTime *
                                                    1000
                                                ).format()}
                                            </TableCell>
                                            {/* <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                                style={{
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {
                                                    (() => {
                                                        if (sharerows[j].ext.length > 12) {
                                                            return (
                                                                <div>
                                                                    {`${sharerows[j].ext.slice(0, 3) + "..."}`}
                                                                    <Tooltip title={sharerows[j].ext}>
                                                                        <span>
                                                                            <Button size='small' color='primary'>more</Button>
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            sharerows[j].ext
                                                        );

                                                    })()
                                                }
                                            </TableCell> */}

                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{
                                            //     whiteSpace: 'nowrap',
                                            // }}
                                            >
                                                {
                                                    (() => {
                                                        if (sharerows[j].from.length > 100) {
                                                            return (
                                                                <div>
                                                                    {`${sharerows[j].from.slice(0, 3) + "..."}`}
                                                                    <Tooltip title={sharerows[j].from}>
                                                                        <span>
                                                                            <Button size='small' color='primary'>more</Button>
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            sharerows[j].from
                                                        );

                                                    })()
                                                }
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{
                                            //     whiteSpace: 'nowrap',
                                            // }}
                                            >
                                                {
                                                    (() => {
                                                        if (sharerows[j].to.length > 100) {
                                                            return (
                                                                <div>
                                                                    {`${sharerows[j].to.slice(0, 3) + "..."}`}
                                                                    <Tooltip title={sharerows[j].to}>
                                                                        <span>
                                                                            <Button size='small' color='primary'>more</Button>
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            sharerows[j].to
                                                        );

                                                    })()
                                                }
                                                {/* {sharerows[j].to} */}
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"

                                            >
                                                {new moment(
                                                    sharerows[j].date * 1000
                                                ).format()}
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            >
                                                {
                                                    (() => {
                                                        if (sharerows[j].comment.length >= 100) {
                                                            return (
                                                                <div>
                                                                    {`${sharerows[j].comment.slice(0, 3) + "..."}`}
                                                                    <Tooltip title={sharerows[j].comment}>
                                                                        <span>
                                                                            <Button size='small' color='primary'>more</Button>
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            sharerows[j].comment
                                                        );

                                                    })()
                                                }
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{
                                            //     whiteSpace: 'nowrap',
                                            // }}
                                            >
                                                <Button
                                                    variant="outlined"
                                                    onClick={() =>
                                                        handleQrPopup(
                                                            sharehash[j],
                                                            'share'
                                                        )
                                                    }
                                                >
                                                    View More
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    : ''}
                            </TableBody>
                        )}
                    </Table>
                </Card>
            )}
        </div>
    )
}

export default TopSellingTable
