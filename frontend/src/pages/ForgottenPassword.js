import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Avatar, Box, Button, CircularProgress, Container, TextField, Typography } from "@mui/material";
import { blue } from '@mui/material/colors';
import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";


const ForgottenPassword = () => {

    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false);   
    const [info, setInfo] = useState('');   
    
    
    const navigate = useNavigate();

    const handleClick = () => {
        setLoading(true);
        setError('');
        if(email !== ''){
            fetch('/api/forgotten-password', {
                mode: 'cors',
                method: 'POST',
                credentials: 'include',
                headers: {"Content-Type": "application/json","Accept":"application/json","Origin":"http://localhost:3000"},
                body: JSON.stringify({
                    email: email
                })
            })
            .then(res => res.json())
            .then(data => {
                if(data.status){
                    setLoading(false);
                    setInfo('Your link has been sent to your email address');
                    setTimeout(() => {
                        navigate('/')
                    }, 3000);
                }else{
                    setLoading(false);
                    setError(data.error);
                }
            })
            .catch(err => {
                setLoading(false);
                setError(err.message);
            })
        }else{
            setError('Enter valid email');
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
                {info && <Alert sx={{ width: '90%'}} severity="success">{info}</Alert>}
                <TextField 
                    label="Email"
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    value={email}
                    onChange={(e) => {setEmail(e.target.value)}}
                />

                <Button variant="contained" onClick={handleClick} sx={{width: '100%', margin: '10px auto'}} 
                    disableElevation focusRipple={true} 
                >
                    {loading ? <CircularProgress sx={{color: 'white !important'}} /> : 'Send password reset link'}
                </Button>
                <Box sx={{width: '100%'}}>
                    <Link to="/" style={{textDecoration: 'none', color: 'grey'}}>Back to login</Link>
                </Box>
            </Box>
        </Container> 
     );
}
 
export default ForgottenPassword;