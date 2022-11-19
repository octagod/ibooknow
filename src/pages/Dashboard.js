import Sidebar from "../components/Sidebar";
// import useMount from "../hooks/useMount";
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { Outlet, useNavigate } from "react-router-dom";
import { blue, grey } from "@mui/material/colors";
import Navbar from "../components/Navbar";
import { Toolbar } from "@mui/material";

const Dashboard = () => {



    //eslint-disable-next-line
    const navigate = useNavigate();




    const menuItem = [ 
        {
            text: 'Dashboard',
            name: 'main',
            icon: <DashboardOutlinedIcon color="secondary" sx={{fontSize: '20px', color: grey[500]}}/>,
            selectedIcon: <DashboardOutlinedIcon color="secondary" sx={{fontSize: '20px', color: blue[500]}}/>,
            path: '/dashboard/main',
            secondary: 'Statistics, Recent emails, Performance',
        },
        {
            text: 'Users',
            name: 'users',
            icon: <SupervisedUserCircleOutlinedIcon  sx={{fontSize: '20px', color: grey[500]}}/>,
            selectedIcon: <SupervisedUserCircleOutlinedIcon  sx={{fontSize: '20px', color: blue[500]}}/>,
            path: '/dashboard/users',
            secondary: 'Total users, Recent Users, User details',
        },
        {
            text: 'Request',
            name: 'requests',
            icon: <AccountTreeOutlinedIcon  sx={{fontSize: '20px', color: grey[500]}}/>,
            selectedIcon: <AccountTreeOutlinedIcon  sx={{fontSize: '20px', color: blue[500]}}/>,
            path: '/dashboard/requests',
            secondary: 'Pending requests, Completed requests, Denied request',
        },
        {
            text: 'Cars',
            name: 'cars',
            icon: <CloudUploadIcon  sx={{fontSize: '20px', color: grey[500]}}/>,
            selectedIcon: <CloudUploadIcon  sx={{fontSize: '20px', color: blue[500]}}/>,
            path: '/dashboard/cars',
            secondary: 'Upload cars, Delete Cars, Booked Cars',
        },
        {
            text: 'Widget',
            name: 'widget',
            icon: <AppRegistrationIcon  sx={{fontSize: '20px', color: grey[500]}}/>,
            selectedIcon: <AppRegistrationIcon  sx={{fontSize: '20px', color: blue[500]}}/>,
            path: '/dashboard/widget',
            secondary: 'Set up widget, Customise widget, Generate iFrame',
        },
        
    ]


    return ( 
        <div style={{padding: '0px !important', display: 'flex', margin: 0, maxWidth: '100%'}}>
            <Sidebar items={menuItem}/>
            <div style={{backgroundColor: '#F9FAFC', width: 'calc(93.5% - 240px)', padding: 20}}>
                <Navbar />
                <Toolbar />
                <Outlet/>
            </div>
        </div>
     );
}
 
export default Dashboard;