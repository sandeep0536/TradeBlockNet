import React from 'react'
import { authRoles } from '../../auth/authRoles'
const dashboardRoutes = [
    {
        path: '/dashboard',
        component: React.lazy(() => import('./shared/TopSellingTable')),
        auth: authRoles.sa,
    },
]
export default dashboardRoutes
