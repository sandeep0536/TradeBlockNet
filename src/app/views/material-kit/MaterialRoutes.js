import React from 'react'
// const pathproject = localStorage.getItem("path");
const materialRoutes = [
    {
        path: '/material/table',
        component: React.lazy(() => import('./tables/AppTable')),
    },
    {
        path: '/material/buttons',
        component: React.lazy(() => import('./buttons/AppButton')),
    },
    {
        path: '/material/icons',
        component: React.lazy(() => import('./icons/AppIcon')),
    },
    {
        path: '/material/progress',
        component: React.lazy(() => import('./AppProgress')),
    },
    {
        path: '/material/menu',
        component: React.lazy(() => import('./menu/AppMenu')),
    },
    {
        path: '/material/checkbox',
        component: React.lazy(() => import('./checkbox/AppCheckbox')),
    },
    {
        path: '/material/autocomplete',
        component: React.lazy(() => import('./auto-complete/AppAutoComplete')),
    },
    {
        path: '/material/dialog',
        component: React.lazy(() => import('./dialog/AppDialog')),
    },
    {
        path: '/material/snackbar',
        component: React.lazy(() => import('./snackbar/AppSnackbar')),
    },
    {
        path: '/project/createproject',
        component: React.lazy(() => import('./projecttest/CreateProject')),
    },
    {
        path: '/project/allprojects',
        component: React.lazy(() => import('./projecttest/ShowProjects')),
    },
    {
        path: '/project/wallet',
        component: React.lazy(() => import('./projecttest/CreateWallet')),
    },
    {
        path: '/project/show',
        component: React.lazy(() => import('./projecttest/ShowFile')),
    },
    {
        path: '/project/showowner',
        component: React.lazy(() => import('./projecttest/ShowshOwnerFile')),
    },
    {
        path: '/project/viewfile',
        component: React.lazy(() => import('./projecttest/RecievedFiles')),
    },
    {
        path: '/sendmail',
        component: React.lazy(() => import('./projecttest/SendMail')),
    },
    {
        path: '/savecontact',
        component: React.lazy(() => import('./projecttest/SaveContact')),
    },
    {
        path: '/createxml',
        component: React.lazy(() => import('./projecttest/XmlDoc')),
    },
    {
        path: '/xmldocupload',
        component: React.lazy(() => import('./projecttest/XmlDocUpload')),
    },
    {
        path: '/e-BOL',
        component: React.lazy(() => import('./projecttest/EBOL')),
    },
    {
        path: '/e-LC',
        component: React.lazy(() => import('./projecttest/ELC')),
    },
    {
        path: '/ebol-upload',
        component: React.lazy(() => import('./projecttest/EBOLUpload')),
    },
    {
        path: '/elc-upload',
        component: React.lazy(() => import('./projecttest/ELCUpload')),
    },
    {
        path: '/einvoicingupload',
        component: React.lazy(() => import('./projecttest/EinvoicingUpload')),
    },
    {
        path: '/did',
        component: React.lazy(() => import('./projecttest/TestDid')),
    },
    {
        path: '/e-invoicing',
        component: React.lazy(() => import('./projecttest/EInvoicing')),
    },

    {
        path: '/upload',
        component: React.lazy(() => import('./projecttest/filecomponents/UploadFile')),
    },
    {
        path: '/web-of-things',
        component: React.lazy(() => import('./projecttest/WOT')),
    },
    {
        path: '/subscription',
        component: React.lazy(() => import('./projecttest/Subscription')),
    },
    {
        path: '/profile',
        component: React.lazy(() => import('./projecttest/Profile')),
    },
    {
        path: '/mycompany',
        component: React.lazy(() => import('./projecttest/MyCompany')),
    },
    {
        path: '/wot-upload',
        component: React.lazy(() => import('./projecttest/WOTUpload')),
    },
    {
        path: '/transfer',
        component: React.lazy(() => import('./projecttest/TransferredFiles')),
    },
    {
        path: '/explorefile',
        component: React.lazy(() => import('./projecttest/ExploreFile')),
    },
    {
        path: '/roles/manageroles',
        component: React.lazy(() => import('./projecttest/roles/ManageRoles')),
    },
    {
        path: '/project/trace',
        component: React.lazy(() => import('./projecttest/tracing/Trace')),
    }
]

export default materialRoutes
