import React, { Fragment } from 'react'
import { Grid } from '@material-ui/core'
import TopSellingTable from './shared/TopSellingTable'
import RecievedFilesDashboard from './shared/RecievedFilesDashboard'
const Analytics = () => {
    return (
        <Fragment>
            <div className="analytics m-sm-30 mt-6">
                <Grid container spacing={3}>
                    <Grid item >
                        {/* Top Selling Products */}
                        <TopSellingTable />
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    )
}

export default Analytics
