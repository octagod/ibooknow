import { Box, Divider, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material"
import { useLocation, useNavigate } from "react-router-dom";
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { grey } from "@mui/material/colors";
import { useEffect } from "react";
// import { useState } from "react";


const Sidebar = ({items}) => {
    const drawerWidth = 280;
    
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    //Get Day difference
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    // a and b are javascript Date objects
    function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    // const [user, setUser] = useState(null);

    const getUserDetails = () => {
        fetch('/api/v1/dashboard/get-user-details', {
            credentials: 'include'
        }).then(res => res.json())
        .then(data => {
            if(data.status){
                let userDetails = data.user;
                let user_timestamp = data.user.timestamp //get user timestamp
                let today_timestamp = Date.now() // get today's timestamp

                let user_ = new Date(user_timestamp); // get date of registration
                let today = new Date(today_timestamp); // get today's date

                const dayDifference = dateDiffInDays(user_, today); //get the difference between today and the day the user registered

                if(dayDifference > 14){
                    // 14-Day trial exceeded
                    // check if user has subscribed
                    if(userDetails.subscribed){
                        // do nothing
                    }else{
                        // Send user to the expired page
                        navigate('/expired');
                    }
                }else{
                    console.log('still under free trial');
                    console.log(dayDifference);
                }

            }else{
                console.log(data.error);
            }
        }).catch(err => {
            console.log(err.message);
        })
    }



    const logOut = () => {
        fetch('/api/logout',{credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            navigate('/');
        })
        .catch(err => {
            console.log(err.message)
        })
    }

    useEffect(() => {
        getUserDetails();
        // eslint-disable-next-line
    }, [])

    return ( 
        <div>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                      width: drawerWidth,
                      boxSizing: 'border-box',
                    },
                }}
                PaperProps={{
                    sx: {
                        backgroundColor: '#111827',
                        color: 'white'
                    }
                }}
                variant="permanent"
                anchor="left"
                className="drawer"
            >
                <div className="logo-div">
                    <img src="/logo.png" alt="" style={{width: '20%'}}/>
                </div>
                <Box sx={{textAlign: "center", 
                            backgroundColor: 'rgba(255,255,255,0.05)', 
                            padding: '5px 10px 10px 5px', 
                            margin: '2px auto', 
                            width: '70%',
                            borderRadius: '10px'
                        }}
                >
                    <Typography variant="h6">
                        iBookNow
                    </Typography>
                    <Typography variant="body2">
                        ...start automating
                    </Typography>        
                </Box>         
                <div className="space-box-20"></div>
                <Divider style={{background: grey[400], opacity: 0.3}}/>
                <div className="space-box"></div>
                <List sx={{padding: '10px'}}>
                    {items.map((item, index) => (
                            <ListItem button key={index}
                                onClick={() => navigate(`${item.path}`)}
                                // eslint-disable-next-line
                                sx={ pathname.includes(item.name) ? 
                                    {backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', paddingTop: '5px', paddingBottom: '5px'} :
                                    {borderRight: 'none', paddingTop: '5px', paddingBottom: '5px'}}
                            >
                                <ListItemIcon>
                                    {pathname.includes(item.name) ? item.selectedIcon : item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text}  secondary={
                                    <Typography style={{color: grey[400], fontSize: '10px'}} variant="body2"> {item.secondary} </Typography>
                                }/>
                            </ListItem>
                    ))}
                    <div className="space-box-20"></div>
                    <Divider style={{background: grey[400], opacity: 0.3}}/>
                    <div className="space-box"></div>
                    <ListItem button onClick={logOut}>
                        <ListItemIcon>
                            <LogoutOutlinedIcon color="error" sx={{fontSize: '20px'}}/>
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItem>
                    <div className="space-box-20"></div>
                    <Typography sx={{letterSpacing: '3px', opacity: 0.3, textAlign: 'center', fontSize: '12px'}}>
                        BY OCTAKODE
                    </Typography>
                </List>
            </Drawer>
        </div>
     );
}
 
export default Sidebar;