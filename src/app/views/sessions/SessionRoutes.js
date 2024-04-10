import NotFound from './NotFound'
import ForgotPassword from './ForgotPassword'
import JwtLogin from '../login/JwtLogin'
import HomePage from '../home/Home'

const sessionRoutes = [
    {
        path: '/signin',
        component: JwtLogin,
    },
    {
        path: '/session/forgot-password',
        component: ForgotPassword,
    },
    {
        path: '/home',
        component: HomePage,
    },
    {
        path: '/session/404',
        component: NotFound,
    },
]

export default sessionRoutes
