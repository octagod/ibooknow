import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Avatar, Box, Button, CircularProgress, Container, TextField, Typography } from "@mui/material";
import { blue } from '@mui/material/colors';
import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";


const ResetPassword = () => {
    const {email} = useParams()
    const [pass, setPass] = useState('');
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false);

    // native javascript url params 
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get('id');


    const navigate = useNavigate();


    const handleClick = () => {
        setLoading(true);

        if(pass === confirm){
            fetch('/api/reset-password', {
                mode: 'cors',
                method: 'POST',
                credentials: 'include',
                headers: {"Content-Type": "application/json","Accept":"application/json","Origin":"http://localhost:3000"},
                body: JSON.stringify({
                    email: email,
                    password: pass,
                    uid: uid
                })
            }).then(res => res.json())
            .then(data => {
                if(data.status){
                    //send user to login screen
                    navigate('/');
                }else{
                    setLoading(false);
                    setError(data.error);
                }
            }).catch(err => {
                setLoading(false);
                setError(err.message);
            })
        }else{
            setLoading(false)
            setError('Password Mismatch!')
        }
    }


    return ( 
        <Container maxWidth="xs">
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 8
            }}>
                <Avatar sx={{backgroundColor: blue[500]}}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography variant="h6">
                    Reset Password
                </Typography>
                {error && <Alert sx={{ width: '90%'}} severity="error">{error}</Alert>}
                <TextField 
                    label="Password"
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    type="password"
                    value={pass}
                    onChange={(e) => {setPass(e.target.value)}}
                />
                <TextField
                    label="Confirm Password"
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    type="password"
                    value={confirm}
                    onChange={(e)=> setConfirm(e.target.value)}
                />
                <Button variant="contained" onClick={handleClick} sx={{width: '100%', margin: '10px auto'}} 
                    disableElevation focusRipple={true}
                >
                    {loading ? <CircularProgress sx={{color: 'white !important'}} /> : 'Reset Password'}
                </Button>
            </Box>
        </Container>
     );
}
 
export default ResetPassword;