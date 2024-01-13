import {Alert, Avatar, Button, Card, CardHeader, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from "react-router-dom";
import Masonry from "react-masonry-css";
import { useEffect } from "react";
import { useState } from "react";
import { blue, grey } from "@mui/material/colors";
import ClearIcon from '@mui/icons-material/Clear';


const Booked = () => {

    const [carId, setCarId] = useState(null);

    const navigate = useNavigate();

    const breakpoint = {
        default: 2,
        1100: 1,
        700: 1
    }

    const [bookedCarsTimestamp, setBookedCarsTimestamp] = useState(null)
    const [cars, setCars] = useState(null)
    
    
    
    //snackbar variables and functions
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('error');
    const closeSnackbar = () => {
        setOpen(false);
    }

    // Dialog variables and function
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogContent, setDialogContent] = useState('');
    const closeDialog = () => {
        setOpenDialog(false);
    }
    
    const getBookedCars = () => {
        fetch('/api/booked-cars', {
            mode: 'cors',
            method: 'GET',
            credentials: 'include',
            headers: {"Content-type": "application/json", "Accept": "application/json", "Origin": "http://localhost:3000"}
        })
        .then(res => res.json())
        .then(data => {
            if(data.status){
                let arr = data.cars;
                let ray = data.booked_car_col_for_timeline;
                setCars([...arr]);
                setBookedCarsTimestamp([...ray]);
            }else{
                setMessage(data.error);
                setSeverity('error');
                setOpen(true);
            }
        }).catch(err => {
            setMessage(err.message)
            setSeverity('error')
            setOpen(true)
        })
    }

    const getDate = (timestamp) => {
        let d = new Date(parseInt(timestamp));
        let date = d.toString().substring(0, 24);
        return date;
    }

    useEffect(() => {
        getBookedCars();
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if(carId){
            getBookedCarUsers();
        }
        // eslint-disable-next-line
    }, [carId]);



    //everything about the booked users including variables and functions

    const [userDetails, setUserDetails] = useState(null)
    const [userId, setUserId] = useState(null) //used to delete user doc
    const [car_iD, setCar_ID] = useState(null) // this is used for the purpose of deleting the user
    const [updateCarUsers, setUpdateCarUsers] = useState(null); // for the purpose of re rendering the booked user list

    // for re rending the booked users list
    useEffect(() => {
        if(updateCarUsers){
            getBookedCarUsers();
        }
        // eslint-disable-next-line
    }, [updateCarUsers]);

    const getBookedCarUsers = () => {
        fetch('/api/booked-cars-details',{
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Origin': 'http://localhost:3000'},
            body: JSON.stringify({carId: carId})
        }).then(res => res.json())
        .then(data => {
            if(data.status){
                //get back list of users
                let arr = data.users;
                setUserDetails([...arr]);
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
    const handleDelete = (id,carId) => {
        setUserId(id);
        setCar_ID(carId);
        setOpenDialog(true);
        setDialogTitle('Remove User ?');
        setDialogContent('Are you sure you want to delete this user? \nDeleted item can not be recovered. ')
    }

    const removeUser = (id, severity, msg, carId, nav) => {

        fetch('/api/delete-booked-user', {
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Origin': 'http://localhost:3000'},
            body: JSON.stringify({userId: id, carId: carId})
        }).then(res => res.json())
        .then(data => {
            if(data.status){
                setOpenDialog(false);
                setMessage(msg);
                setSeverity(severity);
                setOpen(true);
                setUpdateCarUsers(Date.now()+''); //to re render the booked users list
                nav ? navigate('/dashboard/requests') : console.log('');
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

    const moveToRequest = (id, carId) => {
        removeUser(id,'success', 'Transfering to Process Request...', carId, true);

    }


    return ( 
        <div className="main">
            <Snackbar onClose={closeSnackbar} autoHideDuration={6000} open={open}>
                <Alert onClose={closeSnackbar} severity={severity} sx={{width: '100%'}}>
                    {message}
                </Alert>
            </Snackbar>
            <Dialog
                open={openDialog}
                onClose={closeDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle>
                    {dialogTitle}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        {dialogContent}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Close</Button>
                    <Button onClick={() => removeUser(userId, 'success', 'User deleted successfully', car_iD)}>Yes</Button>
                </DialogActions>
            </Dialog>
            <div>
                <IconButton onClick={() => navigate('/dashboard/cars')}>
                    <ChevronLeftIcon />
                </IconButton>
            </div>
            <div className="space-box"></div>
            <Masonry
                breakpointCols={breakpoint}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
            >
                <div className="col">
                    <div className="title space-box-20">
                        <Typography>
                            Booked Cars
                        </Typography>
                    </div>
                    <Divider />
                    {cars && 
                        <div>
                            {cars.length === 0 ? <Typography variant="body2">There are no booked Cars at this time</Typography> 
                                : cars.map((car, index) => (
                                    <div key={index}>
                                        <Card elevation={0} className="clickable" onClick={() => setCarId(bookedCarsTimestamp[index]['_ref']['_path'].segments[3])}
                                            sx={{borderLeft: carId === bookedCarsTimestamp[index]['_ref']['_path'].segments[3] ? '3px solid '+blue[300] : 'none', borderRadius: '0px' }}
                                        >
                                            <CardHeader 
                                                avatar={
                                                    <Avatar alt={car['car name']} src={car.images[0]}/>
                                                }
                                                title={car['car name']}
                                                subheader={getDate(bookedCarsTimestamp[index]['_fieldsProto']['timestamp'].integerValue)}
                                            />
                                        </Card>
                                        <Divider light variant="middle"/>
                                    </div>
                                ))}
                        </div>
                    }
                </div>
                <div className="col">
                    <div className="title space-box-20">
                        <Typography>
                            Users
                        </Typography>
                    </div>
                    <Divider light/>
                    <div className="content space-box-20">
                        {userDetails &&
                            <div>
                                {userDetails.length < 1 ? <Typography>There are currently no booked activites on this car</Typography> :
                                    <TableContainer>
                                        <Table sx={{minWidth: 400}} arial-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>
                                                        Fullname
                                                    </TableCell>
                                                    <TableCell sx={{textAlign: 'right'}}> Email </TableCell>
                                                    <TableCell sx={{textAlign: 'right'}}> Phone </TableCell>
                                                    <TableCell sx={{textAlign: 'right'}}> Status </TableCell>
                                                    <TableCell sx={{textAlign: 'right'}}> Delete </TableCell>
                                                    <TableCell sx={{textAlign: 'right'}}> Resolve </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {userDetails.map((user, index) => (
                                                    <TableRow 
                                                        key={index}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, backgroundColor: index%2 === 1 ? grey[100] : 'white' }}
                                                        
                                                    >
                                                        <TableCell component="th" scope="row" sx={{whiteSpace: 'nowrap'}}> {user['_fieldsProto']['fullname'].stringValue}</TableCell>
                                                        <TableCell align="right" sx={{whiteSpace: 'nowrap'}}>{user['_fieldsProto']['email'].stringValue}</TableCell>
                                                        <TableCell align="right">{user['_fieldsProto']['phone'].stringValue}</TableCell>
                                                        <TableCell align="right">{user['_fieldsProto']['status'].stringValue}</TableCell>
                                                        <TableCell align="right"> <IconButton onClick={() => handleDelete(user['_ref']['_path'].segments[5], carId)}><ClearIcon color="error" /></IconButton> </TableCell>
                                                        <TableCell align="right"> 
                                                            <IconButton onClick={() => moveToRequest(user['_ref']['_path'].segments[5], carId)}>
                                                                <ChevronRightIcon color="success" />
                                                            </IconButton> 
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                }
                            </div>
                        }
                    </div>
                </div>
            </Masonry>
        </div>
     );
}
 
export default Booked;