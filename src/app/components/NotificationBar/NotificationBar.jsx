import React, { Fragment,useState, useEffect } from 'react'

import {
    Icon,
    Badge,
    Card,
    IconButton,
    Drawer,
    Button
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import useSettings from 'app/hooks/useSettings'
import Web3 from "web3";
import { getAllDIDData } from 'app/views/material-kit/projecttest/StoreDataDid';
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS, API_URL } from "ServerConfig";
import { result } from 'lodash'
let rows = [];
let wallet;
let notifications;
const useStyles = makeStyles(({ palette, ...theme }) => ({
    notification: {
        width: 'var(--sidenav-width)',
        '& .notification__topbar': {
            height: 'var(--topbar-height)',
        },
    },
    notificationCard: {
        '&:hover': {
            '& .delete-button': {
                cursor: 'pointer',
                display: 'unset',
                right: 0,
                marginTop: 6,
                top: 0,
                zIndex: 2,
            },
            '& .card__topbar__time': {
                display: 'none',
            },
        },
        '& .delete-button': {
            display: 'none',
            position: 'absolute',
            right: 0,
            marginTop: 9,
        },
        '& .card__topbar__button': {
            borderRadius: 15,
            opacity: 0.9,
        },
    },
}))
const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));

const NotificationBar = ({ container }) => {
    const [panelOpen, setPanelOpen] = React.useState(false)
    const [count, setCount] = React.useState(0)
    const [clear, setClear] = React.useState(true)
    const [notifications, setNotifcations] = useState([])
    const classes = useStyles()
    const { settings } = useSettings()


    const handleDrawerToggle = () => {
        setCount(0)
        setPanelOpen(!panelOpen)
    }
    setInterval(function () {
        setCount(rows.length)
    }, 100)
    useEffect(() => {
        (async () => {
            try {
                const data = JSON.parse(localStorage.getItem("did_data"));
                wallet = data.wallet;
                await getNotification();
                // if (localStorage.getItem("did_data") === null || localStorage.getItem("did_data") === "empty" || localStorage.getItem("did_data") === undefined) {
                //     const data = await getAllDIDData();
                //     if (data !== "empty")
                //         localStorage.setItem("did_data", data)
                // } else {
                //     const data = JSON.parse(localStorage.getItem("did_data"));
                //     wallet = data.wallet;
                // }
                // const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
                //     from: wallet.walletaddress,
                //     gasLimit: "0x200b20",
                // });
                // contract.methods.getFileHashForReciever(wallet.walletaddress).call()
                //     .then((res) => {
                //         for (let i = 0; i < res.length; i++) {
                //             contract.methods.getParticularFile(res[i]).call({
                //                 from: wallet.walletaddress,
                //             })
                //                 .then((result) => {
                //                     rows.push(result)
                //                     setCount(rows.length)
                //                 })
                //         }
                //     })

                // console.log(notifications)
            } catch (e) {

            }
        })()
    }, rows)
    async function getNotification() {
        const opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": localStorage.getItem("userEmail"),
                "address": wallet.walletaddress
            }),
        }
        const response = await fetch(`${API_URL}/getnotifications`, opts);
        await response.json()
            .then((res) => {
                if (res.status) {
                    const key = 'time';
                    setNotifcations([...new Map(res.data.map(item =>
                        [item[key], item])).values()])
                    // notifications = res.data;
                }
            })
    }
    async function clearSingleNotification(id) {
        const opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": localStorage.getItem("userEmail"),
                "id": id
            }),
        }
        const response = await fetch(`${API_URL}/clearNotification`, opts);
        setClear(false)
    }
    const notification = setInterval(async () => {
        try {
            // await getNotification();
            // setClear(true)
            // clearInterval(notification)
        } catch (e) { }
    }, 2000)
    return (
        <Fragment>
            <IconButton onClick={handleDrawerToggle}>
                <Badge color="secondary" badgeContent={notifications && Object.keys(notifications).length}>
                    <Icon>notifications</Icon>
                </Badge>
            </IconButton>

            <ThemeProvider theme={settings.themes[settings.activeTheme]}>
                <Drawer
                    width={'100px'}
                    container={container}
                    variant="temporary"
                    anchor={'right'}
                    open={panelOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                >
                    <div className={classes.notification}>
                        <div className="notification__topbar elevation-z6 flex items-center p-4 mb-4">
                            <Icon color="primary">notifications</Icon>
                            <h5 className="ml-2 my-0 font-medium">
                                Notifications
                            </h5>
                        </div>

                        {notifications && Object.keys(notifications).map((notification, i) => (
                            <div
                                key={notification}
                                className={clsx(
                                    'relative',
                                    classes.notificationCard
                                )}
                            >
                                <IconButton
                                    size="small"
                                    className="delete-button bg-light-gray mr-6"
                                >
                                    <Icon
                                        className="text-muted"
                                        fontSize="small"
                                        onClick={() => clearSingleNotification(notifications[i].id)}
                                    >
                                        clear
                                    </Icon>
                                </IconButton>
                                {clear &&
                                    <Card className="mx-4 mb-6" elevation={3}>
                                        <div className="card__topbar flex items-center justify-between p-2 bg-light-gray">
                                            <div className="flex items-center">
                                                <div className="card__topbar__button flex items-center justify-between h-24 w-24 overflow-hidden">
                                                    <Icon
                                                        className="card__topbar__icon"
                                                        fontSize="small"
                                                    >
                                                        notifications
                                                    </Icon>
                                                </div>
                                            </div>
                                            <small className="card__topbar__time text-muted">
                                                {new Date(notifications[i].time * 1000).toLocaleString('en-GB')}
                                                {' '}
                                            </small>
                                        </div>
                                        <div className="px-4 pt-2 pb-4">
                                            <p className="m-0">
                                                {notifications[i].to == wallet.walletaddress ?
                                                    <Link
                                                        to={`/transfer`}
                                                        onClick={handleDrawerToggle}
                                                    >
                                                        {`Congrats you are the new owner of (${notifications[i].filename}) file transferred from ${notifications && notifications[i].to}`}
                                                    </Link>
                                                    :
                                                    <Link
                                                        to={`/project/recievedfiles`}
                                                        onClick={handleDrawerToggle}
                                                    >
                                                        {`File(${notifications[i].filename}) recieved from ${notifications && notifications[i].from}`}
                                                    </Link>
                                                }
                                            </p>
                                        </div>

                                    </Card>
                                }
                            </div>
                        ))}
                        {notifications && Object.keys(notifications).length > 0 ?
                            <div className="text-center m-8">
                                <Button
                                    className="w-full"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => clearSingleNotification(0)}
                                >
                                    Clear All
                                </Button>
                            </div>
                            :
                            <center>No notifications</center>
                        }
                    </div>
                </Drawer>
            </ThemeProvider>
        </Fragment>
    )
}

export default NotificationBar
