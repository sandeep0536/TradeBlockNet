import * as React from 'react';
import { styled } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { makeStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import {
    CardContent,
    Grid
} from '@material-ui/core';
import { useEffect } from 'react';
import { Breadcrumb } from 'app/components';
import history from 'history.js';
import UploadFile from './filecomponents/UploadFile'
import { API_URL } from 'ServerConfig';
var fs = require('browserify-fs');

const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1),
    },
    input: {
        display: 'none',
    },
    cardroot: {
        width: "150px !important",
        height: "150px !important",
        backgroundColor: "#F0E68C",
        marginTop: "15px",
        marginLeft: "15px"
    }
}))

export default function RecipeReviewCard() {
    const classes = useStyles()
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [allFolders, setAllFolders] = React.useState(null);
    const [index, setIndex] = React.useState(null);
    const [uploadComponents, setUploadComponents] = React.useState(false);
    const open = Boolean(anchorEl);
    const handleClose = () => {
        setAnchorEl(null);
    };
    const uploadFile = (i) => {
        setIndex(i);
        setUploadComponents(true);
    };
    const handleExpandClick = (event, i) => {
        setIndex(i);
        setAnchorEl(event.currentTarget);
    };
    const removeProject = (dir) => {
        const opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({ "dir": dir })
        }
        fetch(`${API_URL}/removedir`, opts)
            .then(res => {
                if (res.status == "200") {
                    const response = res.json();
                    response.then(res => {
                    })
                }
            })
    };
    useEffect(() => {
        const opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
        }
        fetch("http://localhost:3001/readdir", opts)
            .then(res => {
                if (res.status == "200") {
                    const response = res.json();
                    response.then(res => {
                        setAllFolders(res)
                    })
                }
            })

    });
    return (
        <div className="m-sm-30">

            {uploadComponents ?
                <UploadFile
                    projectname={allFolders[index]}
                    upload={() => setUploadComponents(false)}
                />
                :
                <div>
                    <div className="mb-sm-30">
                        <Breadcrumb
                            routeSegments={[
                                { name: 'Project', path: '/material' },
                                { name: 'All Projects' },
                            ]}
                        />
                    </div>
                    <Grid container spacing={1}>
                        {allFolders != null && allFolders.map((row, i) => (
                            <Grid item md={2} key={i}>
                                <Card className={classes.cardroot} >
                                    <CardHeader
                                        action={
                                            <IconButton aria-label="settings">
                                                <MoreVertIcon onClick={(event) => {
                                                    handleExpandClick(event, i)
                                                }} />
                                            </IconButton>
                                        }
                                    />
                                    <div onClick={() => uploadFile(i)}>
                                        <CardContent>
                                            <span style={{
                                                position: "absolute",
                                                width: "100px",
                                                height: "100px",
                                                textAlign: "center",
                                                marginTop: "-40px",
                                                wordBreak: "break-word",
                                                overflow: "hidden"
                                            }}>
                                                {allFolders[i]}
                                            </span>
                                        </CardContent>
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={open}
                                            onClose={handleClose}
                                            onClick={handleClose}
                                            style={{ marginTop: "36px" }}
                                            PaperProps={{
                                                elevation: 0,
                                                sx: {
                                                    overflow: 'visible',
                                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                                    mt: 1.5,
                                                    '& .MuiAvatar-root': {
                                                        width: 32,
                                                        height: 12,
                                                        ml: -0.5,
                                                        mr: 1,
                                                    },
                                                    '&:before': {
                                                        content: '""',
                                                        display: 'block',
                                                        position: 'absolute',
                                                        top: 0,
                                                        right: 14,
                                                        width: 10,
                                                        height: 10,
                                                        bgcolor: 'background.paper',
                                                        transform: 'translateY(-50%) rotate(45deg)',
                                                        zIndex: 0,
                                                    },
                                                },
                                            }}
                                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                        >
                                            <MenuItem onClick={() => removeProject(allFolders[index])}>
                                                Delete project
                                            </MenuItem>
                                        </Menu>
                                    </div>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </div>
            }
        </div>
    );
}
