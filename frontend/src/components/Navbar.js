import { AppBar, Avatar, Toolbar, Typography } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import { useState } from "react";
import { useEffect } from "react";

const Navbar = () => {

    //save user name
    const [username, setUsername] = useState(null);
    let uid = localStorage.getItem("uid");


    const getUsername = () => {
        fetch('/api/get-user', {
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            headers: {"Content-Type": "application/json","Accept":"application/json","Origin":"http://localhost:3000"},
            body: JSON.stringify({uid})
        }).then(res => res.json())
        .then(data => {
            if(data.status){
                let fname = data.user.firstname;
                let lname = data.user.lastname;
                setUsername(fname[0]+''+lname[0]);
            }else{
                console.log(data.error);
            }
        })
    }


    useEffect(() => {
        getUsername();
        // eslint-disable-next-line
    }, [])

    return ( 
        <AppBar sx={{backgroundColor: 'white', width: 'calc(100% - 280px)'}} elevation={0}>
            <Toolbar>
                <Typography variant="h6" sx={{flexGrow: 1, color: grey[600]}}>
                    Dashboard
                </Typography>
                { username &&
                    <Avatar sx={{backgroundColor: blue[500]}}>
                        <Typography>
                            {username}
                        </Typography>
                    </Avatar>
                }
            </Toolbar>
        </AppBar>
     );
}
 
export default Navbar;