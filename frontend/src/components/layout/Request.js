import { Alert, Avatar, Button, Divider, Grid, IconButton, Skeleton, Snackbar, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useEffect, useState } from "react";
import { blue, grey } from "@mui/material/colors";
import { TabContext, TabList, TabPanel } from "@mui/lab";

const Request = () => {

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

    const [requests, setRequests] = useState(null);
    const [declinedReq, setDeclinedReq] = useState(null);
    const [approvedReq, setApprovedReq] = useState(null)
    const [arrayIndex, setIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [carsDetails, setCarsDetails] = useState(null);

    const getRequests = () => {
        fetch('/api/v1/dashboard/requests', {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            if(data.status){
                let arr = data.requests;
                let carDetails = data.cars;
                //check if data.requests have data
                if(arr.length > 0){
                    // filter arr(requests) to get pending, approved and declined requests
                    let pending = arr.filter(req => req['_fieldsProto']['request type'].stringValue === 'pending');
                    setRequests([...pending])

                    let approved = arr.filter(req => req['_fieldsProto']['request type'].stringValue === 'approve');
                    setApprovedReq([...approved]);
                    
                    let declined = arr.filter(req => req['_fieldsProto']['request type'].stringValue === 'decline');
                    setDeclinedReq([...declined]);
                    
                    setCarsDetails([...carDetails]);
                    setLoading(false);
                }else{
                    setRequests([...arr]); // this will allow code to process no data handler
                    setLoading(false);
                }
            }else{
                setMessage(data.error);
                setSeverity('error');
                setOpen(true);
            }
        })
        .catch(err => {
            setMessage(err.message);
            setSeverity('error');
            setOpen(true);
        })
    }

    const convertDate = (timestamp) => {
        let d = new Date(parseInt(timestamp));
        let date = d.toString().substring(0, 16);
        return date;
    }

    const changeDate = (dateString) => {
        let d = new Date(dateString);
        return d.toString().substring(0, 16);
    }
    const [widgetVariables, setWidgetVariables] = useState(null);
    const [toggleRequest, setToggleRequest] = useState(null);
    const getWidgetVariables = () => {
        fetch('/api/v1/dashboard/widget-variables', {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            if(data.status){
                setWidgetVariables(data.variables);
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

    const declineRequest = (reqId) => {
        fetch('/api/v1/dashboard/handle-request',{
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Origin': 'http://localhost:3000'},
            body: JSON.stringify({'request type': 'decline', requestId: reqId})
        }).then(res => res.json())
        .then(data => {
            if(data.status){
                setMessage('Request Delclined')
                setSeverity('success')
                setOpen(true)
                setIndex(null);
                setToggleRequest(Date.now()+'');
            }else{
                setMessage(data.error)
                setSeverity('error')
                setOpen(true) 
            }
        }).catch(err => {
            setMessage(err.message)
            setSeverity('error')
            setOpen(true)
        })
    }

    const approveRequest = (reqId) => {
        fetch('/api/v1/dashboard/handle-request',{
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Origin': 'http://localhost:3000'},
            body: JSON.stringify({'request type': 'approve', requestId: reqId})
        }).then(res => res.json())
        .then(data => {
            if(data.status){
                setMessage('Request Approved')
                setSeverity('success')
                setOpen(true)
                setIndex(null);
                setToggleRequest(Date.now()+'');
            }else{
                setMessage(data.error)
                setSeverity('error')
                setOpen(true) 
            }
        }).catch(err => {
            setMessage(err.message)
            setSeverity('error')
            setOpen(true)
        })
    }



    
    //TAB VARIABLES AND FUNCTION
    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
      setValue(newValue);
    };



    useEffect(()=> {
        getRequests()
        getWidgetVariables()
        //  eslint-disable-next-line
    }, [toggleRequest])


    return ( 
        <div className="main">
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
            <div className="space-box-20 title">
                <Typography fontWeight={900} variant="h4" >Requests</Typography>
            </div>
            <div className="space-box"></div>
            <TabContext value={value}>
                <TabList onChange={handleChange} aria-label="lab API tabs example">
                    <Tab label="Pending Requests" value="1" />
                    <Tab label="Approved Requests" value="2" />
                    <Tab label="Declined Requests" value="3" />
                </TabList>
                <TabPanel value="1">
                    <div className="space-box">
                        {loading ? 
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Skeleton width='100%' height="300px" animation="wave" />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Skeleton width='100%' height="300px" animation="wave" />
                                </Grid>
                            </Grid>
                        :
                            <div>
                                {requests && 
                                    <div>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={8} className="">
                                                <div className="col">
                                                    <div className="title space-box-20">
                                                        <Typography>
                                                            Pending Requests
                                                        </Typography>
                                                    </div>
                                                    <Divider light />
                                                    <div className="space-box-20">
                                                        <TableContainer>
                                                            <Table sx={{minWidth: '100%'}}>
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell sx={{whiteSpace: 'nowrap', fontSize: '12px'}}> Car Name</TableCell>
                                                                        <TableCell sx={{textAlign: 'right', fontSize: '12px'}}> Fullname </TableCell>
                                                                        <TableCell sx={{textAlign: 'right', fontSize: '12px'}}> Email </TableCell>
                                                                        <TableCell sx={{textAlign: 'right', fontSize: '12px'}}> Date </TableCell>
                                                                        <TableCell sx={{textAlign: 'right', fontSize: '12px'}}> Status </TableCell>
                                                                        <TableCell sx={{textAlign: 'right', fontSize: '12px'}}> Action </TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                { requests.length < 1 ? 
                                                                    <TableBody><TableRow>
                                                                        <TableCell sx={{whiteSpace: 'nowrap'}}>
                                                                            There are currently no pending request at this time
                                                                        </TableCell>
                                                                    </TableRow></TableBody>  
                                                                :    <TableBody>
                                                                        {requests.map((req, x) => (
                                                                            <TableRow key={x} sx={{backgroundColor: x%2 === 1 ? grey[200] : 'white' }} className={arrayIndex === x ? 'selected-table' : ''}>
                                                                                <TableCell sx={{whiteSpace: 'nowrap', fontSize: '12px'}}>{carsDetails[x]['car name']}</TableCell>
                                                                                <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right', fontSize: '12px'}}> {req['_fieldsProto']['firstname'].stringValue} { req['_fieldsProto']['lastname'].stringValue} </TableCell>
                                                                                <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right', fontSize: '12px'}}> {req['_fieldsProto']['email'].stringValue}</TableCell>
                                                                                <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right', fontSize: '12px'}}> {convertDate(req['_fieldsProto']['timestamp'].integerValue)}</TableCell>
                                                                                <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right', fontSize: '12px'}}> {req['_fieldsProto']['status'].stringValue}</TableCell>
                                                                                <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right', fontSize: '12px'}}> 
                                                                                    <IconButton onClick={() => setIndex(x)}>
                                                                                        <VisibilityRoundedIcon sx={{color: arrayIndex === x ? blue[400] : grey}}/>
                                                                                    </IconButton>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                }
                                                            </Table>
                                                        </TableContainer>
                                                    </div>
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} md={4} className=''>
                                                <div className='col'>
                                                    <div className="title space-box-20">
                                                        <Typography>
                                                            Request Details
                                                        </Typography>
                                                    </div>
                                                    <Divider light />
                                                    <div className="space-box-20" style={{maxHeight: '60vh', overflowY: 'scroll'}}>
                                                        {arrayIndex !== null ? 
                                                            <div>
                                                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                                    <Avatar sx={{width: 100, height: 100}} src={carsDetails[arrayIndex].images[0]}/>
                                                                </div>
                                                                <div className="space-box"></div>
                                                                <Typography align="center" variant="h6"> {carsDetails[arrayIndex]['car name']} </Typography>
                                                                <Typography align="center" variant="body2" color="text.secondary"> {carsDetails[arrayIndex]['car price']} { widgetVariables['currency']} - {carsDetails[arrayIndex]['per charge']} </Typography>
                                                                <div className="space-box"></div>
                                                                <Divider light > <Typography sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px'}}>Booking Details</Typography> </Divider>
                                                                <div className="flex" style={{justifyContent: 'space-between'}}>
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px'}}> Pickup Date </Typography>
                                                                        <Typography variant="body2" sx={{fontSize: '12px'}}> {changeDate(requests[arrayIndex]['_fieldsProto']['pickup date'].stringValue)} </Typography>
                                                                    </div>
                                                                    <CompareArrowsIcon />
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center'}}> Return Date </Typography>
                                                                        <Typography variant="body2" sx={{fontSize: '12px'}}> {changeDate(requests[arrayIndex]['_fieldsProto']['return date'].stringValue)} </Typography>
                                                                    </div>
                                                                </div>
                                                                <div className="flex" style={{justifyContent: 'space-between'}}>
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px'}}> Pickup Time </Typography>
                                                                        <Typography variant="body2" sx={{fontSize: '12px'}}> {requests[arrayIndex]['_fieldsProto']['pickup time'].stringValue} </Typography>
                                                                    </div>
                                                                    <CompareArrowsIcon />
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center'}}> Return Time </Typography>
                                                                        <Typography variant="body2" sx={{fontSize: '12px'}}> {requests[arrayIndex]['_fieldsProto']['return time'].stringValue} </Typography>
                                                                    </div>
                                                                </div>
                                                                <div className="space-box">
                                                                    <Typography variant="body2" sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center'}}> Pickup Location </Typography>
                                                                    <Typography variant="body2" sx={{fontSize: '12px'}}> {requests[arrayIndex]['_fieldsProto']['pickup location'].stringValue} </Typography>
                                                                </div>
                                                                <div className="space-box"></div>
                                                                <div className="flex" style={{justifyContent: 'space-between', overflowX: 'scroll'}}>
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{whiteSpace: 'nowrap', fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px'}}> Gas Pre-Payment </Typography>
                                                                        <Typography variant="body2" sx={{whiteSpace: 'nowrap', fontSize: '12px', textAlign: 'center', marginTop: '5px'}}> {requests[arrayIndex]['_fieldsProto']['gas pre payment'].booleanValue ? 'Yes' : 'No'}: {widgetVariables['gas pre payment']} {widgetVariables['currency']}</Typography>
                                                                    </div>
                                                                    <Divider orientation="vertical" flexItem variant="middle"/>
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{whiteSpace: 'nowrap', fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'right'}}> Tolls Pre-Payment </Typography>
                                                                        <Typography variant="body2" sx={{whiteSpace: 'nowrap', fontSize: '12px', textAlign: 'center', marginTop: '5px'}}> {requests[arrayIndex]['_fieldsProto']['tolls pre payment'].booleanValue ? 'Yes' : 'No'}: {widgetVariables['tolls pre payment']} {widgetVariables['currency']} </Typography>
                                                                    </div>
                                                                    <Divider orientation="vertical" flexItem variant="middle"/>
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{whiteSpace: 'nowrap', fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'right'}}> Delivery fee One Way </Typography>
                                                                        <Typography variant="body2" sx={{whiteSpace: 'nowrap', fontSize: '12px', textAlign: 'center', marginTop: '5px'}}> {requests[arrayIndex]['_fieldsProto']['delivery fee - one way'].booleanValue ? 'Yes' : 'No'}: {widgetVariables['delivery fee - one way']} { widgetVariables['currency']} </Typography>
                                                                    </div>
                                                                    <Divider orientation="vertical" flexItem variant="middle"/>
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{whiteSpace: 'nowrap', fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'right'}}> Delivery Fee - Round Trip </Typography>
                                                                        <Typography variant="body2" sx={{whiteSpace: 'nowrap', fontSize: '12px', textAlign: 'center', marginTop: '5px'}}> {requests[arrayIndex]['_fieldsProto']['delivery fee - round trip'].booleanValue ? 'Yes' : 'No'}: {widgetVariables['delivery fee - round trip']} {widgetVariables['currency']} </Typography>
                                                                    </div>
                                                                    <Divider orientation="vertical" flexItem variant="middle"/>
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{whiteSpace: 'nowrap', fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'right'}}> Insurance </Typography>
                                                                        <Typography variant="body2" sx={{whiteSpace: 'nowrap', fontSize: '12px', textAlign: 'center', marginTop: '5px'}}> {requests[arrayIndex]['_fieldsProto']['insurance'].booleanValue ? 'Yes' : 'No'}: {widgetVariables['insurance']} {widgetVariables['currency']} </Typography>
                                                                    </div>
                                                                </div>
                                                                <div className="space-box">
                                                                    <Typography variant="body2" sx={{fontSize: '10px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center'}}> Total Cost </Typography>
                                                                    <Typography variant="body2" sx={{fontSize: '16px', textAlign: 'center'}}> {(requests[arrayIndex]['_fieldsProto']['total cost'].integerValue).toLocaleString()} {widgetVariables['currency']} </Typography>
                                                                </div>
                                                                <div className="space-box"></div>
                                                                <Divider light > <Typography sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px'}}>User Info</Typography> </Divider>
                                                                <div >
                                                                    <div className="flex" style={{justifyContent: 'space-between'}}>
                                                                        <div className="space-box">
                                                                            <Typography variant="body2" sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px'}}> First Name </Typography>
                                                                            <Typography variant="body2" sx={{fontSize: '12px'}}> {requests[arrayIndex]['_fieldsProto']['firstname'].stringValue} </Typography>
                                                                        </div>
                                                                        <div className="space-box">
                                                                            <Typography variant="body2" sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center'}}> Last Name </Typography>
                                                                            <Typography variant="body2" sx={{fontSize: '12px'}}> {requests[arrayIndex]['_fieldsProto']['lastname'].stringValue} </Typography>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px'}}> Email </Typography>
                                                                        <Typography variant="body2" sx={{fontSize: '12px'}}> {requests[arrayIndex]['_fieldsProto']['email'].stringValue} </Typography>
                                                                    </div>
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'left'}}> Phone </Typography>
                                                                        <Typography variant="body2" sx={{fontSize: '12px'}}> {requests[arrayIndex]['_fieldsProto']['phone'].stringValue} </Typography>
                                                                    </div>
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'left'}}>Street Address </Typography>
                                                                        <Typography variant="body2" sx={{fontSize: '12px'}}> {requests[arrayIndex]['_fieldsProto']['street'].stringValue} </Typography>
                                                                    </div>
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'left'}}> Location </Typography>
                                                                        <Typography variant="body2" sx={{fontSize: '12px'}}> {requests[arrayIndex]['_fieldsProto']['city'].stringValue}, {requests[arrayIndex]['_fieldsProto']['state'].stringValue}, {requests[arrayIndex]['_fieldsProto']['country'].stringValue} </Typography>
                                                                    </div>
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'left'}}> Driver's License Image </Typography>
                                                                        <div className="DL-holder">
                                                                            <img alt="driver's license" src={requests[arrayIndex]['_fieldsProto']['drivers license'].stringValue}/>
                                                                        </div>
                                                                        <a href={requests[arrayIndex]['_fieldsProto']['drivers license'].stringValue} target="_blank" rel="noreferrer">View DL</a>
                                                                    </div>
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px'}}> Drivers License number </Typography>
                                                                        <Typography variant="body2" sx={{fontSize: '12px'}}> {requests[arrayIndex]['_fieldsProto']['drivers license number'].stringValue} </Typography>
                                                                    </div>
                                                                    <div className="space-box">
                                                                        <Typography variant="body2" sx={{fontSize: '6px', color: grey[400], textTransform: 'uppercase', letterSpacing: '3px'}}> expiration date </Typography>
                                                                        <Typography variant="body2" sx={{fontSize: '12px'}}> {changeDate(requests[arrayIndex]['_fieldsProto']['expiration date'].stringValue)} </Typography>
                                                                    </div>
                                                                    <div className="flex" style={{justifyContent: 'space-between'}}>
                                                                        <Button disableElevation variant="contained" color="error" onClick={() => declineRequest(requests[arrayIndex]['_ref']['_path'].segments[3])}>
                                                                            Decline
                                                                        </Button>
                                                                        <Button disableElevation variant="contained" color="primary" onClick={() => approveRequest(requests[arrayIndex]['_ref']['_path'].segments[3])}>
                                                                            Resolve
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div> 
                                                            : 
                                                            <div>
                                                                <Typography>Select a table cell to view details</Typography>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </Grid>
                                        </Grid>
                                    </div>    
                                }
                            </div>
                        }
                    </div>
                </TabPanel>
                <TabPanel value="2">
                    <div className="space-box-20">
                    {loading ? 
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Skeleton width='100%' height="300px" animation="wave" />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Skeleton width='100%' height="300px" animation="wave" />
                                </Grid>
                            </Grid>
                        :
                            <div>
                                {approvedReq &&
                                    <div>
                                        <div className="col">
                                            <div className="title space-box-20">
                                                <Typography>
                                                    Approved Requests
                                                </Typography>
                                            </div>
                                            <Divider light />
                                            <div className="space-box-20">
                                                <TableContainer>
                                                    <Table sx={{minWidth: '100%'}}>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell sx={{whiteSpace: 'nowrap', fontSize: '12px'}}> Car Name</TableCell>
                                                                <TableCell sx={{textAlign: 'right', fontSize: '12px'}}> Fullname </TableCell>
                                                                <TableCell sx={{textAlign: 'right', fontSize: '12px'}}> Email </TableCell>
                                                                <TableCell sx={{textAlign: 'right', fontSize: '12px'}}> Date </TableCell>
                                                                <TableCell sx={{textAlign: 'right', fontSize: '12px'}}> Status </TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        {  approvedReq.length < 1 ? <TableBody><TableRow>
                                                                <TableCell>
                                                                    There are currently no approved request at this time
                                                                </TableCell>
                                                            </TableRow></TableBody>  
                                                           : <TableBody>
                                                                {approvedReq.map((req, x) => (
                                                                    <TableRow key={x} sx={{backgroundColor: x%2 === 1 ? grey[200] : 'white' }} className={arrayIndex === x ? 'selected-table' : ''}>
                                                                        <TableCell sx={{whiteSpace: 'nowrap', fontSize: '12px'}}>{carsDetails[x]['car name']}</TableCell>
                                                                        <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right', fontSize: '12px'}}> {req['_fieldsProto']['firstname'].stringValue} { req['_fieldsProto']['lastname'].stringValue} </TableCell>
                                                                        <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right', fontSize: '12px'}}> {req['_fieldsProto']['email'].stringValue}</TableCell>
                                                                        <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right', fontSize: '12px'}}> {convertDate(req['_fieldsProto']['timestamp'].integerValue)}</TableCell>
                                                                        <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right', fontSize: '12px'}}> {req['_fieldsProto']['status'].stringValue}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        }    
                                                    </Table>
                                                </TableContainer>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                    }
                    </div>   
                </TabPanel>
                <TabPanel value="3">
                    <div className="space-box-20">
                        {loading ? 
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Skeleton width='100%' height="300px" animation="wave" />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Skeleton width='100%' height="300px" animation="wave" />
                                </Grid>
                            </Grid>
                        :
                            <div>
                                {declinedReq &&
                                    <div>
                                        <div className="col">
                                            <div className="title space-box-20">
                                                <Typography>
                                                    Declined Requests
                                                </Typography>
                                            </div>
                                            <Divider light />
                                            <div className="space-box-20">
                                                <TableContainer>
                                                    <Table sx={{minWidth: '100%'}}>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell sx={{whiteSpace: 'nowrap', fontSize: '12px'}}> Car Name</TableCell>
                                                                <TableCell sx={{textAlign: 'right', fontSize: '12px'}}> Fullname </TableCell>
                                                                <TableCell sx={{textAlign: 'right', fontSize: '12px'}}> Email </TableCell>
                                                                <TableCell sx={{textAlign: 'right', fontSize: '12px'}}> Date </TableCell>
                                                                <TableCell sx={{textAlign: 'right', fontSize: '12px'}}> Status </TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        {  declinedReq.length < 1 ? <TableBody><TableRow>
                                                                <TableCell>
                                                                    There are currently no declined request at this time
                                                                </TableCell>
                                                            </TableRow></TableBody>  
                                                           : <TableBody>
                                                                {declinedReq.map((req, x) => (
                                                                    <TableRow key={x} sx={{backgroundColor: x%2 === 1 ? grey[200] : 'white' }} className={arrayIndex === x ? 'selected-table' : ''}>
                                                                        <TableCell sx={{whiteSpace: 'nowrap', fontSize: '12px'}}>{carsDetails[x]['car name']}</TableCell>
                                                                        <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right', fontSize: '12px'}}> {req['_fieldsProto']['firstname'].stringValue} { req['_fieldsProto']['lastname'].stringValue} </TableCell>
                                                                        <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right', fontSize: '12px'}}> {req['_fieldsProto']['email'].stringValue}</TableCell>
                                                                        <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right', fontSize: '12px'}}> {convertDate(req['_fieldsProto']['timestamp'].integerValue)}</TableCell>
                                                                        <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'right', fontSize: '12px'}}> {req['_fieldsProto']['status'].stringValue}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        }    
                                                    </Table>
                                                </TableContainer>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                </TabPanel>
            </TabContext>
        </div>
     );
}
 
export default Request;