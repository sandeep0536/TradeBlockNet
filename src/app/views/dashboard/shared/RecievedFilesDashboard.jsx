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

import clsx from 'clsx'
import Web3 from "web3";
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS } from 'ServerConfig';
import { CircularProgress } from '@material-ui/core';
import { useState } from 'react';
import { getAllDIDData } from 'app/views/material-kit/projecttest/StoreDataDid';
import { CheckSubscription } from 'app/views/material-kit/projecttest/CheckSubscription';
import $ from 'jquery'
import "datatables.net-dt/js/dataTables.dataTables"
import "datatables.net-dt/css/jquery.dataTables.min.css"
import moment from 'moment'
import { useLocation } from 'react-router'
import MessageDashboard from './MessageDashboard'
import PaymentsDashboard from './PaymentsDashboard'
import TopSellingTable from './TopSellingTable';


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
const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));

let rows = [];
let uploadDID = [];
let shareDID = [];
let sharerows = [];

const RecievedFilesDashboard = () => {
    const classes = useStyles();
    const [wallet, setWallet] = useState(true);
    const [status, setStatus] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [row, setRow] = useState([])
    const [shared, setShared] = useState([])
    const { pathname } = useLocation()
    useEffect(() => {
        (async () => {
            try {
                await CheckSubscription();
                /**
                 * checking user did's
                 */
                if (localStorage.getItem("did_data") == null || localStorage.getItem("did_data") == "undefined" || localStorage.getItem("did_data") == "empty" || localStorage.getItem("did_data") == undefined) {
                    /**
                     * function to get user did
                     */
                    const data = await getAllDIDData();
                    if (data == "empty" || data == undefined) {
                        setWallet(false)
                        setStatus(true)
                    } else {
                        localStorage.setItem("did_data", data)
                        setWallet(false)
                        setStatus(true)
                    }
                } else {
                    const data = JSON.parse(localStorage.getItem("did_data"));
                    /**
                     * store user wallet
                     */
                    const wallet = data.wallet;
                    // console.log("rows",sharerows.length)


                    if (rows.length == 0 || sharerows.length == 0) {
                        try {
                            /**
                             * create contract instance and
                             * fetch all file which is upload and 
                             * shared by user
                             */
                            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                                from: wallet.walletaddress,
                                gasLimit: "0x200b20",
                            });
                            await contract.methods.getFileHashForReciever(wallet.walletaddress).call()
                                .then((res) => {
                                    for (let i = 0; i < res.length; i++) {
                                        contract.methods.getFileIdByShareHash(res[i]).call({
                                            from: wallet.walletaddress
                                        })
                                            .then((response) => {
                                                // console.log("did",response);
                                                // setShared(response)
                                                // shareDID = shareDID.filter((item, index) => shareDID.indexOf(item) === index)

                                                shareDID.push(response)
                                                shareDID = [...new Set(shareDID)]

                                            })
                                        contract.methods.getParticularFile(res[i]).call({
                                            from: wallet.walletaddress,
                                        })
                                            .then((response) => {
                                                // console.log("response",response);
                                                // setRow(response)
                                                // rows = rows.filter((item, index) => rows.indexOf(item) === index)

                                                rows.push(response)
                                                rows = [...new Set(rows)]
                                            })

                                    }

                                })

                            // setStatus(true)
                            setTimeout(function () {
                                try {
                                    setStatus(true)
                                } catch (e) { }
                            }, 10000)
                            setTimeout(() => {
                                $('#datatable').dataTable({
                                    bDestroy: true,
                                    autoWidth: false,
                                    scrollX: true,
                                    columnDefs: [
                                        { "type": "date", "targets": 3 }
                                    ],
                                });
                            }, 10000)
                            // console.log("rowsss",rows.length,shareDID.length)


                            /**
                             * change simple table into DataTable
                             */
                        } catch (e) {
                            console.log(e)
                            // console.log("in catch")
                        }
                    }
                }
            } catch (e) {
                console.log(e)
            }
        })();
    }, [])

    /**
     * function to get fetch data from contract 
     * when user click on refresh icon
     */
    const handleRefresh = async () => {
        rows = [];
        shareDID = []
        sharerows = [];
        // setStatus(true)
        setRefresh(true)
        const wallet = JSON.parse(localStorage.getItem("did_data"))
        // console.log('wallet', wallet)
        await getRefreshData(wallet.wallet)
    }
    setInterval(function () {
        if (localStorage.getItem("did_data") == "empty") {
            setStatus(true)
        }
    }, 100)
    const getRefreshData = async (wallet) => {
        try {
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                from: wallet.walletaddress,
                gasLimit: "0x200b20",
            });
            contract.methods.getFileHashForReciever(wallet.walletaddress).call()
                .then((res) => {
                    // console.log("res",res.length)
                    for (let i = 0; i < res.length; i++) {
                        contract.methods.getFileIdByShareHash(res[i]).call({
                            from: wallet.walletaddress
                        })
                            .then((response) => {
                                // console.log("did",response);
                                // setShared(response)
                                // shareDID = shareDID.filter((item, index) => shareDID.indexOf(item) === index)

                                shareDID.push(response)
                                // shareDID = [...new Set(shareDID)]

                            })

                        contract.methods.getParticularFile(res[i]).call({
                            from: wallet.walletaddress,
                        })
                            .then((response) => {
                                // console.log("rree",response);
                                rows.push(response)
                            })
                    }
                })
            setRefresh(false)
        } catch (e) {
            console.log(e)
        }

    }
    // console.log("long",rows,shareDID)
    return (
        <div className="analytics m-sm-30 mt-6">
            {/* {pathname == '/dashboard/myfiles' || pathname == '/dashboard' && <TopSellingTable />}
            {pathname == '/dashboard/messages' && <MessageDashboard />}
            {pathname == '/dashboard/payments' && <PaymentsDashboard />} */}
            {(pathname == '/dashboard/receivedfiles') && (
                <Card elevation={3} className="pt-5 mb-6">
                    <div className="flex justify-between items-center px-6 mb-3">
                        <span className="card-title">Received Files
                            <Icon style={{
                                position: "absolute",
                                marginLeft: "20px",
                            }}
                                variant="outlined"
                                onClick={handleRefresh}
                            >refresh</Icon>
                        </span>
                        <Select size="small" defaultValue="this_month" disableUnderline>
                            <MenuItem value="this_month">This Month</MenuItem>
                            <MenuItem value="last_month">Last Month</MenuItem>
                        </Select>
                    </div>
                    <Table
                        id="datatable"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ whiteSpace: "nowrap" }}>
                                    SNo.
                                </TableCell>
                                <TableCell style={{ whiteSpace: "nowrap" }}>
                                    File Name
                                </TableCell>
                                <TableCell style={{ width: "100px " }}>
                                    Status(Received/Revoked/Deleted/Archived)
                                </TableCell>
                                <TableCell style={{ whiteSpace: "nowrap" }}>
                                    Timestamp
                                </TableCell>
                                {/* <TableCell style={{ whiteSpace: "nowrap" }}>
                                    Format
                                </TableCell> */}
                                <TableCell style={{ whiteSpace: "nowrap" }}>
                                    Type
                                </TableCell>
                                <TableCell style={{ whiteSpace: "nowrap" }}>
                                    Size
                                </TableCell>
                                <TableCell style={{ whiteSpace: "nowrap" }}>
                                    DID
                                </TableCell>
                                <TableCell style={{ whiteSpace: "nowrap" }}>
                                    Issuer name
                                </TableCell>
                                <TableCell style={{ whiteSpace: "nowrap" }}>
                                    Recipient name
                                </TableCell>
                                <TableCell style={{ whiteSpace: "nowrap" }}>
                                    Revocation
                                </TableCell>
                                <TableCell style={{ whiteSpace: "nowrap" }}>
                                    Comments
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        {refresh || !status ? (
                            <div>
                                <center>
                                    <CircularProgress className={classes.progress} />
                                </center>
                            </div>
                        ) : (
                            <TableBody>
                                {shareDID ?
                                    shareDID.map((item, i) => (
                                        <TableRow key={i} hover>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{ whiteSpace: "nowrap" }}
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
                                            // style={{ whiteSpace: "nowrap" }}
                                            >
                                                {/* {rows[i].fileName} */}
                                                {
                                                    (() => {
                                                        if (rows[i].fileName.length > 100) {
                                                            return (
                                                                <div>
                                                                    {`${rows[i].fileName.slice(0, 4) + "..."}`}
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
                                            // style={{ whiteSpace: "nowrap" }}
                                            >
                                                Received
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            >
                                                {new moment(rows[i].time * 1000).format()}
                                            </TableCell>
                                            {/* <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                                style={{ whiteSpace: "nowrap" }}
                                            > */}
                                            {/* {rows[i].extension} */}
                                            {/* {
                                                    (() => {
                                                        if (rows[i].extension.length > 12) {
                                                            return (
                                                                <div>
                                                                    {`${rows[i].extension.slice(0, 3) + "..."}`}
                                                                    <Tooltip title={rows[i].extension}>
                                                                        <span>
                                                                            <Button size='small' color='primary' >more</Button>
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            rows[i].extension
                                                        );

                                                    })()
                                                } */}

                                            {/* </TableCell> */}
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{ whiteSpace: "nowrap" }}
                                            >
                                                {"N/A"}
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{ whiteSpace: "nowrap" }}
                                            >
                                                {"N/A"}
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{ whiteSpace: "nowrap" }}
                                            >
                                                {/* {shareDID[i].replace( /(.{9})..+/,  "$1..." )} */}
                                                {/* {shareDID[i].replace(/(.{12})..+/, "$1...")} */}
                                                {(() => {
                                                    if (shareDID[i].length > 200) {
                                                        return (
                                                            <div>
                                                                {`${shareDID[i].slice(0, 3) + "..."}`}
                                                                <Tooltip title={shareDID[i]}>
                                                                    <span>
                                                                        <Button size='small' color='primary' >more</Button>
                                                                    </span>
                                                                </Tooltip>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        shareDID[i]
                                                    );

                                                })()}
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{ whiteSpace: "nowrap" }}
                                            >
                                                {/* {rows[i].senderName} */}
                                                {
                                                    (() => {
                                                        if (rows[i].senderName.length >= 100) {
                                                            return (
                                                                <div>
                                                                    {`${rows[i].senderName.slice(0, 3) + "..."}`}

                                                                    <Tooltip title={rows[i].senderName}>
                                                                        <span>
                                                                            <Button size='small' color='primary'>more</Button>
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            rows[i].senderName
                                                        );

                                                    })()
                                                }
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{ whiteSpace: "nowrap" }}
                                            >
                                                {localStorage.getItem("userName")}
                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            >
                                                {/* {rows[i].date} */}
                                                {new moment(rows[i].date * 1000).format()}

                                            </TableCell>
                                            <TableCell
                                                className="px-4 capitalize"
                                                align="left"
                                            // style={{ whiteSpace: "nowrap" }}
                                            >
                                                {/* {rows[i].comment} */}
                                                {
                                                    (() => {
                                                        if (rows[i].comment.length > 100) {
                                                            return (
                                                                <div>
                                                                    {`${rows[i].comment.slice(0, 3) + "..."}`}
                                                                    <Tooltip title={rows[i].comment}>
                                                                        <span>
                                                                            <Button size='small' color='primary' >more</Button>
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            rows[i].comment
                                                        );

                                                    })()
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    :
                                    wallet &&
                                    <div>
                                        <center>
                                            <CircularProgress className={classes.progress} />
                                        </center>
                                    </div>
                                }
                            </TableBody>
                        )}
                    </Table>
                </Card>
            )}
        </div>
    )
}

export default RecievedFilesDashboard
