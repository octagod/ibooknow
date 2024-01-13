import { useState } from "react";
import {Alert, Box, Button, CircularProgress, Container, TextField} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {

    const [email, setEmail] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [company, setCompany] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const [severity, setSeverity] = useState('error');

    const navigate = useNavigate()


    const handleSignUp = () => {
        if(firstname !== '' && lastname !== '' && company !== '' && email !== '' && password !== ''){
            setLoading(true);
            fetch('/api/signup', {
                mode: 'cors',
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Origin': 'http://localhost:3000'},
                body: JSON.stringify({
                    firstname, lastname, company, password, email
                })
            }).then(res => res.json())
            .then(data => {
                if(data.status){
                    setMsg('Account Created Successfully')
                    setSeverity('success');
                    setOpen(true);
                    setLoading(false);
                    setTimeout(() => {
                        navigate('/');
                    }, 4000);
                }else{
                    setMsg(data.error)
                    setSeverity('error');
                    setOpen(true);
                    setLoading(false);
                    setTimeout(() => {
                        setOpen(false);
                    }, 4000);
                }
            }).catch(err => {
                setMsg(err.message);
                setSeverity('error');
                setOpen(true);
                setLoading(false);
                setTimeout(() => {
                    setOpen(false);
                }, 4000);
            })
        }else{
            setMsg('All fields are required');
            setSeverity('error');
            setOpen(true);
            setLoading(false);
            setTimeout(() => {
                setOpen(false);
            }, 4000);
        }
    }

    return ( 
        <Container maxWidth="xs">
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: 8
            }}>
                <h3>
                    Create An Account
                </h3>
                {open && 
                    <Alert severity={severity} sx={{width: '90%'}}>
                        {msg}
                    </Alert>
                }
                <TextField
                    id="firstname" 
                    variant="outlined"
                    label="First Name"
                    required
                    fullWidth
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    margin="normal"
                />
                <TextField
                    id="lastname" 
                    variant="outlined"
                    label="Last Name"
                    required
                    fullWidth
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    margin="normal"
                />
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
                    fullWidth
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                />
                <TextField
                    id="company" 
                    variant="outlined"
                    label="Company Name"
                    required
                    fullWidth
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    margin="normal"
                />
                <Button variant="contained" color="primary" sx={{width: '100%', margin: '20px auto'}}
                    disableElevation
                    onClick={handleSignUp}    
                >
                   {loading ? <CircularProgress sx={{color: 'white !important'}}/> : 'Create Account' }
                </Button>
                <Box sx={{width: '100%'}}>
                    <Link to="/" style={{textDecoration: 'none', color: 'grey'}}>Already have an account</Link>
                </Box>
            </Box>
        </Container>
     );
}
 
export default SignUp;