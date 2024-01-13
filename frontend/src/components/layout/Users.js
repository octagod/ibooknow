import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, Skeleton, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material"
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import { useEffect } from "react";
import download from 'downloadjs';
import { grey } from "@mui/material/colors";
import { Delete } from "@mui/icons-material";

const Users = () => {

    // Dialog variables and function
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogContent, setDialogContent] = useState('');
    const closeDialog = () => {
        setOpenDialog(false);
    }
    // Dialog2 variables and function
    const [openDialog2, setOpenDialog2] = useState(false);
    const [dialogTitle2, setDialogTitle2] = useState('');
    const [dialogContent2, setDialogContent2] = useState('');
    const closeDialog2 = () => {
        setOpenDialog2(false);
    }
    // Dialog3 variables and function
    const [openDialog3, setOpenDialog3] = useState(false);
    const [dialogTitle3, setDialogTitle3] = useState('');
    const [dialogContent3, setDialogContent3] = useState('');
    const closeDialog3 = () => {
        setOpenDialog3(false);
    }


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


    // PAGINATION VARIABLES AND FUNCTIONS
    const numberOfDataToDisplay = 20;
    let numberOfButtons;
    // const [buttons, setButtons] = useState(null);

    function renderPagination(data) {
        numberOfButtons = data.length/numberOfDataToDisplay;
        console.log(numberOfButtons);
        createButtons(numberOfButtons,data); // creates button based on numberOfButtons number
    
        renderData(data);
    }
    
    function createButtons(number,data) {
        for(let x = 0; number > x; x++){
            let button = document.createElement('button');
            button.innerHTML = x+1;
    
            document.querySelector('div#buttons').appendChild(button);
    
            button.onclick = () => {
                //get selected button
                let selected = document.querySelector('#buttons button.selected');
                
                if(selected){
                    selected.classList.remove('selected');
                }

                // Add selected to selected button
                button.classList.add('selected');
                
                //  numberOfDataToDisplay * x = starting number, numberOfDataToDisplay * (x+1) gets ending number         
                renderData(data, numberOfDataToDisplay * x, numberOfDataToDisplay * (x+1))
            }
        }
    }

    function renderData(data, start, end){
        
        if(start && end) {
            setUsers([...data.slice(start, end)]);
        }else{
            setUsers([...data.slice(0, 20)]);
        }
    }

    const [searchText, setSearchText] = useState('');
    const [users, setUsers] = useState(null);
    const [dataList, setDataList] = useState(null); // general data holder
    // const [reducedData, setReducedData] = useState(null); // used to store sliced data
    const [loading, setLoading] = useState(true);

    const getUsers = () => {
        fetch('/api/v1/dashboard/users', {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            if(data.status){
                let u = data.users;
                setDataList([...u]);
                renderPagination(u);
                setLoading(false);
            }else{
                setMessage(data.error)
                setSeverity('error')
                setOpen(true);
                setLoading(false);
            }
        }).catch(err => {
            setMessage(err.message)
            setSeverity('error')
            setOpen(true);
        });
    }

    const downloadCompletedList = () => {
        fetch('/api/v1/download/completed.csv', {credentials: 'include'})
        .then(res => res.blob())
        .then(blob => {
            setOpenDialog(false);
            download(blob, 'completed.csv', 'text/plain');
            setMessage('download successfully');
            setSeverity('success');
            setOpen(true);
        }).catch(err => {
            setMessage(err.message);
            setSeverity('error');
            setOpen(true); 
        })
    }

    const downloadEmptyCartList = () => {
        fetch('/api/v1/download/empty_cart.csv',{credentials: 'include'})
        .then(res => res.blob())
        .then(blob => {
            setOpenDialog(false);
            download(blob, 'empty_cart.csv', 'text/plain');
            setMessage('download Successful');
            setSeverity('success');
            setOpen(true);
        }).catch(err => {
            setMessage(err.message);
            setSeverity('error');
            setOpen(true);
        })
    }

    const checkList = () => {
        if(users !== null && users.length > 0){
            setDialogTitle('Export List');
            setDialogContent('You are about to export your users list, Lists will be divided into two csv files which will be Empty cart and Completed with regards to the user\'s status. Kindly select the file you\'d like to export');
            setOpenDialog(true);

        }else{
            setMessage('You have no users')
            setSeverity('error');
            setOpen(true);
        }
    }

    
    const convertDate = (timestamp) => {
        let d = new Date(parseInt(timestamp));
        let date = d.toString().substring(0, 16);
        return date;
    }

    // SEARCH RESULT VARIABLES AND FUCNTION
    const [showingResult, setShowingRes] = useState(false);
    const [searchRes, setSearchRes] = useState(null);
    const filterUsers = (query) => {
        //eslint-disable-next-line
        setSearchRes(dataList.filter(obj => (obj['_fieldsProto']['firstname'].stringValue).toLowerCase() == query.toLowerCase()));
        setShowingRes(true);
    }

    const clearSearch = () => {
        setShowingRes(false);
        setSearchRes([]);
        setSearchText('');
    }

    const [customerId, setCustomerId] = useState(null);
    const [rerender, setRerender] = useState(null);

    const editUser = (customerId, firstname) => {
        setCustomerId(customerId);
        setDialogTitle2(`Edit ${firstname}'s status`)
        setDialogContent2(`Change ${firstname}'s status to either COMPLETED or EMPTY CART depending on whether or not ${firstname} has made payment for their booking`)
        setOpenDialog2(true);
    }

    const updateUser = (customerId, status) => {
        fetch('/api/v1/dashboard/update-user', {
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json', 'Accept':'application/json', 'Origin': 'http://localhost:3000'},
            body: JSON.stringify({customerId, status})
        }).then(res => res.json())
        .then(data => {
            if(data.status){
                setMessage('User status updated successfully')
                setSeverity('success');
                setOpen(true);
                setRerender(Date.now()+'')
                setOpenDialog2(false);
            }else{
                setMessage(data.error)
                setSeverity('error');
                setOpen(true)
            }
        }).catch(err => {
            setMessage(err.message)
            setSeverity('error');
            setOpen(true)
        })
    }

    const deleteUser = (customerId) => {
        setCustomerId(customerId);
        setDialogTitle3(`Delete User`)
        setDialogContent3(`Deleted users can not be recovered. Are you sure you want to delete this user?`)
        setOpenDialog3(true);
    }

    const deleteSelectedUser = () => {
        fetch('/api/v1/dashboard/delete-user',{
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json', 'Accept':'application/json', 'Origin': 'http://localhost:3000'},
            body: JSON.stringify({customerId})   
        }).then(res => res.json())
        .then(data => {
            if(data.status){
                setMessage('User Deleted')
                setSeverity('success');
                setOpen(true);
                setRerender(Date.now()+'')
                setOpenDialog3(false);
            }else{
                setMessage(data.error)
                setSeverity('error');
                setOpen(true)
            }
        }).catch(err => {
            setMessage(err.message)
            setSeverity('error');
            setOpen(true)
        })
    }




    useEffect(()=> {
        getUsers()
        // eslint-disable-next-line
    }, [rerender]);

    return ( 
        <div className="main">
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
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
                    <Button onClick={downloadEmptyCartList}>Empty Cart</Button>
                    <Button onClick={downloadCompletedList}>Completed</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openDialog2}
                onClose={closeDialog2}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle>
                    {dialogTitle2}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        {dialogContent2}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog2}>Close</Button>
                    <Button onClick={() => updateUser(customerId, 'empty cart')}>Empty Cart</Button>
                    <Button onClick={() => updateUser(customerId, 'completed')}>Completed</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openDialog3}
                onClose={closeDialog3}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle>
                    {dialogTitle3}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        {dialogContent3}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog3}>Close</Button>
                    <Button onClick={() => deleteSelectedUser(customerId)}>Yes</Button>
                </DialogActions>
            </Dialog>
            <div className="title space-box-20" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Typography variant="h4" fontWeight="900">
                    Customers
                </Typography>
                <Button onClick={checkList} color="primary" startIcon={<DownloadForOfflineIcon />}>
                    Download List
                </Button>
            </div>
            <div className="space-box-20"></div>
            <div className="col space-box-20">
                <Grid container spacing={2}>
                    <Grid item xs={11}>
                        <TextField 
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            variant="standard"
                            label="Search Users First name"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={1}>
                        {showingResult ? 
                            <IconButton onClick={clearSearch}>
                                <ClearIcon />
                            </IconButton> 
                         : <div> 
                             {users && 
                                <IconButton onClick={() => filterUsers(searchText)}>
                                    <SearchIcon />
                                </IconButton>}
                         </div>   
                        }
                    </Grid>
                </Grid>
            </div> 
            <div className="space-box-20"></div>
            {loading && <Skeleton animation="wave" height={300} width="80%" sx={{margin: '10px auto'}}/>}
            <div className="col space-box-20">
                {users && 
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{fontSize: '12px'}}>
                                        NAME
                                    </TableCell>
                                    <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}>EMAIL</TableCell>
                                    <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}>PHONE</TableCell>
                                    <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}>LOCATION</TableCell>
                                    <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}>ZIP CODE</TableCell>
                                    <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}>REGISTERED ON</TableCell>
                                    <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}>STATUS</TableCell>
                                    <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}>CHANGE STATUS</TableCell>
                                    <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}>DELETE USER</TableCell>
                                </TableRow>
                            </TableHead>
                            {showingResult ? 
                                
                                <TableBody>
                                    {searchRes.length < 1 ? <TableRow> <TableCell> There are no users with the name {searchText} </TableCell> </TableRow> :
                                        searchRes.map((user, index) => (
                                            <TableRow key={index} sx={{backgroundColor: index%2 === 1 ? grey[200] : 'white'}}>
                                                <TableCell sx={{fontSize: '12px', whiteSpace: 'nowrap'}}> {user['_fieldsProto']['firstname'].stringValue} {user['_fieldsProto']['lastname'].stringValue}</TableCell>
                                                <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}> {user['_fieldsProto']['email'].stringValue} </TableCell>
                                                <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}> {user['_fieldsProto']['phone'].stringValue} </TableCell>
                                                <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}> {user['_fieldsProto']['city'].stringValue}, {user['_fieldsProto']['country'].stringValue} </TableCell>
                                                <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}> {user['_fieldsProto']['zip code'].stringValue} </TableCell>
                                                <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}> {convertDate(user['_fieldsProto']['timestamp'].integerValue)} </TableCell>
                                                <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}> {user['_fieldsProto']['status'].stringValue} </TableCell>
                                                <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}>  <IconButton onClick={() => editUser(user['_ref']['_path'].segments[3], user._fieldsProto.firstname.stringValue)}> <EditIcon />  </IconButton> </TableCell>
                                                <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}>  <IconButton onClick={() => deleteUser(user['_ref']['_path'].segments[3])}> <Delete sx={{color: 'red'}}/>  </IconButton> </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            :
                            <TableBody> 
                                {users.length < 1 ? <TableRow> <TableCell> There are no data at this time </TableCell> </TableRow> :
                                    users.map((user, index) => (
                                        <TableRow key={index} sx={{backgroundColor: index%2 === 1 ? grey[200] : 'white'}}>
                                            <TableCell sx={{fontSize: '12px', whiteSpace: 'nowrap'}}> {user['_fieldsProto']['firstname'].stringValue} {user['_fieldsProto']['lastname'].stringValue}</TableCell>
                                            <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}> {user['_fieldsProto']['email'].stringValue} </TableCell>
                                            <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}> {user['_fieldsProto']['phone'].stringValue} </TableCell>
                                            <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}> {user['_fieldsProto']['city'].stringValue}, {user['_fieldsProto']['country'].stringValue} </TableCell>
                                            <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}> {user['_fieldsProto']['zip code'].stringValue} </TableCell>
                                            <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}> {convertDate(user['_fieldsProto']['timestamp'].integerValue)} </TableCell>
                                            <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}> {user['_fieldsProto']['status'].stringValue} </TableCell>
                                            <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}>  <IconButton onClick={() => editUser(user['_ref']['_path'].segments[3], user._fieldsProto.firstname.stringValue)}> <EditIcon />  </IconButton> </TableCell>
                                            <TableCell sx={{textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap'}}>  <IconButton onClick={() => deleteUser(user['_ref']['_path'].segments[3])}> <Delete sx={{color: 'red'}}/>  </IconButton> </TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>}
                        </Table>
                </TableContainer>
            }
                <Divider light/>
                <div className="space-box"></div>
                <div id="buttons" className="pagination_buttons">
                    {/* Pagination Buttons will populate this area */}
                </div>
            </div>   
        </div>
     );
}
 
export default Users;