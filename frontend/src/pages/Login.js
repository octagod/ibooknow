import { useEffect, useState } from "react";
import {Link, useNavigate} from "react-router-dom"
import useMount from "../hooks/useMount";
import {Alert, Avatar, Box, Button, Checkbox, CircularProgress, Container, FormControlLabel, TextField, Typography} from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { blue } from "@mui/material/colors";

const Login = () => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [checked, setChecked] = useState(false);

    const navigate = useNavigate();

    const isMounted = useMount();


    const handleLogin = () => {
        setIsLoading(true);

        if(email !== '' && pass !== ''){
            fetch('/api/login', 
                {   mode: "cors",
                    method: 'POST', 
                    credentials: 'include',
                    headers: {"Content-Type": "application/json","Accept":"application/json","Origin":"http://localhost:3000"},
                    body: JSON.stringify({
                        email: email,
                        password: pass,
                        "remember_me": checked
                    })
                })
            .then(res => res.json())
            .then(data => {
                if(data.status){
                    //save uid to localStorage
                    localStorage.setItem('uid', data.uid);
                    navigate('/dashboard/main');
                    
                }else{
                    setIsLoading(false);
                    setError(data.error);
                }
            })
            .catch(err => {
                setIsLoading(false);
                setError(err.message);
            });

        }else{
            console.log('Error');
            setIsLoading(false);
        }
    }

    const onAuth = () => {
        fetch('/api/isAuthenticated',
            {credentials: 'include'}
        )
        .then(res => res.json())
        .then(data => {
            if(data.status){
                navigate('/dashboard/main');
            }else{
                console.log(data.error);
            }
        }).catch(err => {
            console.log(err.message)
        })
    }


    useEffect(()=>{
        //check if user is logged in
        onAuth();
        // eslint-disable-next-line
    }, [isMounted]);




    return ( 
        <Container maxWidth="xs">
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: 8
            }}>
                <Avatar sx={{ backgroundColor: blue[500] }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography variant="h6">
                    Sign in
                </Typography>
                {error && 
                    <Alert severity="error" sx={{width: '90%'}}>
                        {error}
                    </Alert>
                }
                <TextField
                    id="email" 
                    variant="outlined"
                    label="Email"
                    required
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                />
                <TextField 
                    id="password"
                    variant="outlined"
                    label="Password"
                    required
                    type="password"
                    fullWidth
                    value={pass}
                    onChange={(e)=> setPass(e.target.value)}
                    margin="normal"
                />
                {/* Checkbox */}
                <div style={{width: '100%'}}>
                    <FormControlLabel control={<Checkbox checked={checked} onChange={(e)=> setChecked(e.target.checked)}/>} label="Remember me"/>
                </div>
                <Button variant="contained" color="primary" sx={{width: '100%', margin: '20px auto'}}
                    disableElevation
                    onClick={handleLogin}    
                >
                   {isLoading ? <CircularProgress sx={{color: 'white !important'}}/> : 'login' }
                </Button>
                <Box sx={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
                    <Link to="/sign-up" style={{textDecoration: 'none', color: 'grey'}}> Sign Up </Link>
                    <Link to="/forgotten-password" style={{textDecoration: 'none', color: 'grey'}}>Forgotten password</Link>
                </Box>
            </Box>
        </Container>
     );
}
 
export default Login;