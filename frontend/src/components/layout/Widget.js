import { ChevronRight } from "@mui/icons-material";
import { Alert, Button, CircularProgress, Divider, Grid, IconButton, Snackbar, TextField, Typography } from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import { SketchPicker } from "react-color";

const Widget = () => {

    // get user id from localStorage
    const userID = localStorage.getItem('uid');

    // snack bar variable & function
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const handleClose = (event, reason) => {
        if(reason === 'clickaway'){
            return;
        
        }
        setOpen(false);
    }

    // widget variables
    const [deliveryOne, setDeliveryOne] = useState('');
    const [deliveryRoundTrip, setDeliveryRT] = useState('');
    const [gasPrepayment, setGasPP] = useState('');
    const [insurance, setInsurance] = useState('');
    const [tollsPrePayment, setTollsPP] = useState('');
    const [locations, setLocations] = useState('')
    const [currency, setCurrency] = useState('USD');
    const [widgets, setWidgetVariables] = useState(null);
    const [toggleRender, setToggleRender] = useState('');
    const [loading, setLoading] = useState(false);


    const getWidgetVariables = () => {
        fetch('/api/v1/dashboard/widget-variables', {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            if(data.status){
                let variables = data.variables;
                setWidgetVariables(data.variables);
                setCurrency(variables['currency'])
                setGasPP(variables['gas pre payment'])
                setDeliveryOne(variables['delivery fee - one way'])
                setDeliveryRT(variables['delivery fee - round trip'])
                setTollsPP(variables['tolls pre payment'])
                setInsurance(variables['insurance'])
                setLocations(variables['locations']);
            }else{
                setMessage(data.error);
                setSeverity('error')
                setOpen(true);    
            }
        }).catch(err => {
            setMessage(err.message);
            setSeverity('error')
            setOpen(true);
        })
    }
    const updateTheme = () => {
        fetch('/api/v1/dashboard/update-theme', {
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Origin': 'http://localhost:3000'},
            body: JSON.stringify({'primary color': color}) 
        }).then(res => res.json())
        .then(data => {
            if(data.status){
                setMessage('Theme Color updated');
                setSeverity('success');
                setOpen(true);
                setToggleRender(Date.now()+'');
            }else{
                setMessage(data.error);
                setSeverity('error');
                setOpen(true);
            }
        }).catch(err => {
            setMessage(err.message);
            setSeverity('error');
            setOpen(true);
        })
    }
    
    const updateVariables = () => {
        setLoading(true);
        if(insurance !== '' && deliveryRoundTrip !== '' && deliveryOne !== '' && gasPrepayment !== '' &
            tollsPrePayment !== '' && currency !== '' && locations !== ''
        ){
            fetch('/api/v1/dashboard/update-variables', {
                mode: 'cors',
                method: 'POST',
                credentials: 'include',
                headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Origin': 'http://localhost:3000'},
                body: JSON.stringify({
                    'insurance' : insurance, 
                    'delivery fee - one way' : deliveryOne,
                    'delivery fee - round trip' : deliveryRoundTrip,
                    'gas pre payment': gasPrepayment,
                    'tolls pre payment': tollsPrePayment,
                    'currency': currency,
                    'locations': locations
                })
            }).then(res => res.json())
            .then(data => {
                if(data.status){
                    setMessage('Variables updated successfully');
                    setSeverity('success');
                    setOpen(true);
                    setToggleRender(Date.now()+'');
                    setLoading(false);
                }else{
                    setMessage(data.error);
                    setSeverity('error');
                    setOpen(true);
                    setLoading(false);
                }
            }).catch(err => {
                setMessage(err.message);
                setSeverity('error');
                setOpen(true);
                setLoading(false);
            })
        }else{
            setMessage('Ensure all fields are filled');
            setSeverity('error')
            setOpen(true);
            setLoading(false);
        }
    }
    

    // COLOR PICKER VARIABLE
    const [color, setColor] = useState('#4a90e2');



    useEffect(() => {
        getWidgetVariables();
        getPrimaryColor();
        // eslint-disable-next-line
    }, [toggleRender]);

    const [widgetURL, setWidgetURL] = useState(null);
    const [iframeLink, setIframeLink] = useState(null);
    // render preview url from user's existing primary color
    const getPrimaryColor = () => {
        fetch('/api/v1/widget/get-variables',{
            mode: 'cors',
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Origin': 'http://localhost:3000'},
            body: JSON.stringify({userId: userID})
        }).then(res => res.json())
        .then(data => {
            if(data.status){
                setWidgetURL(`https://widget.ibooknow.digital?id=${userID}&c=${data.variables['primary color']}`);
            }else{
                setMessage(data.error);
                setSeverity('error')
                setOpen(true);
            }
        }).catch(err => {
            setMessage(err.message);
            setSeverity('error')
            setOpen(true);
        })
    }

    const copyText = (word) => {
        navigator.clipboard.writeText(word);
        setMessage('Copied to clipboard');
        setSeverity('success');
        setOpen(true);
    }
 
    return ( 
        <div className="main">
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
            <div className="space-box-20">
                <Typography variant="h4" fontWeight={900}>
                    Setup Widget
                </Typography>
            </div>
            <div className="col">
                <div className="title space-box-20">
                    <Typography>Widget Variables</Typography>
                </div>
                <Divider light />
                <div className="space-box-20 content">
                    {widgets && 
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Typography >VARIABLES</Typography>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth value={deliveryOne} onChange={(e) => setDeliveryOne(e.target.value)}
                                    variant="standard" label="Delivery Fee - One way" required margin="normal" />
                                <TextField
                                    fullWidth value={deliveryRoundTrip} onChange={(e) => setDeliveryRT(e.target.value)}
                                    variant="standard" label="Delivery Fee - Round Trip" required margin="normal" />
                                <TextField
                                    fullWidth value={insurance} onChange={(e) => setInsurance(e.target.value)}
                                    variant="standard" label="Insurance Fee" required margin="normal" />
                                <TextField
                                    fullWidth value={gasPrepayment} onChange={(e) => setGasPP(e.target.value)}
                                    variant="standard" label="Gas Pre Payment Fee" required margin="normal" />
                                <TextField
                                    fullWidth value={tollsPrePayment} onChange={(e) => setTollsPP(e.target.value)}
                                    variant="standard" label="Tolls Pre Payment Fee" required margin="normal" />
                                <TextField
                                    fullWidth value={locations} onChange={(e) => setLocations(e.target.value)}
                                    variant="standard" label="Tolls Pre Payment Fee" required margin="normal" helperText="your different pickup locations should be seperated by ' - ' e.g san francisco, California - Chicago, Illinois"/>
                                <TextField
                                    fullWidth value={currency} onChange={(e) => setCurrency(e.target.value)}
                                    variant="standard" label="Prefered Currency" required margin="normal" helperText="enter your prefered currency: e.g USD"/>
                                <div className="space-box"></div>
                                <Button disableElevation variant="contained" color="primary" sx={{width: '100%'}} onClick={updateVariables}>
                                    {loading ? <CircularProgress sx={{color: 'white'}} /> : 'Save Variables'}
                                </Button>
                            </Grid>
                        </Grid>
                    }
                </div>
            </div>
            <div className="space-box-20"></div>
            <div className="col">
                <div className="title space-box-20">
                    <Typography>
                        Widget Theme Color
                    </Typography>
                </div>
                <Divider light />
                <div className="space-box-20 content">
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Typography>
                                Select Widget primary color
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <SketchPicker 
                                color={color}
                                onChangeComplete={cr => {
                                    setColor(`rgb(${cr.rgb.r},${cr.rgb.g},${cr.rgb.b})`);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography>Color Preview</Typography>
                            <div className="space-box"></div>
                            <div className="col" style={{transition: 'ease .5s' ,backgroundColor: color, height: '200px', width: '200px', borderRadius: '10px' }}></div>
                            <div className="space-box"></div>
                            <Button style={{ width: '100%'}} variant="contained" disableElevation onClick={updateTheme}>
                                Update Primary Color
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </div>
            <div className="space-box-20"></div>
            <div className="col">
                <div className="title space-box-20">
                    <Typography>
                        Widget Preview
                    </Typography>
                </div>
                <Divider light/>
                <div className="content space-box-20">
                    {widgetURL && <div>
                        <Typography> Live Link </Typography>
                        <div className="space-box"></div>
                        {/* Live Link */}
                        <div className="live_link-container flex">
                            <div>
                                {widgetURL} 
                            </div>
                            <IconButton onClick={() => window.open(widgetURL)}>
                                <ChevronRight />
                            </IconButton>
                        </div>
                        <div className="space-box-20">
                            <Divider light/>
                        </div>
                        {iframeLink && <div style={{backgroundColor: 'rgb(228, 228, 228)', borderRadius: '10px', textAlign: 'center'}} className=" flex space-box-20 clickable" onClick={() => copyText(iframeLink)}>
                                {iframeLink}
                            </div>
                        }
                        <div className="space-box"></div>
                        <Button variant="contained" disableElevation onClick={() => setIframeLink(`<iframe src="${widgetURL}" frameborder="0" width="100%" height="600" title="ibooknow"></iframe>`)}>
                            Generate iFrame Code
                        </Button>
                        <div className="space-box-20">
                            <Divider light/>
                        </div>
                        <div className="space-box"></div>
                        {/* IFrame */}
                        <iframe src={widgetURL+'&dev=true'} frameborder="0" width="100%" height='600' title="widget_preview"></iframe>    
                    </div>}
                </div>
            </div>
        </div>
     );
}
 
export default Widget;