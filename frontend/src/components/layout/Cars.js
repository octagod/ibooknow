import { Alert, Avatar, Button, Card, CardActions, CardContent, CardHeader, CardMedia, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Skeleton, Snackbar, TextField, Typography } from "@mui/material";
import { blue, grey, red } from "@mui/material/colors";
import { useState } from "react";
import Masonry from "react-masonry-css";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useEffect } from "react";
import {Link, useNavigate} from 'react-router-dom'

const Cars = () => {

    //masonry breakpoints
    const breakpoint2 = {
        default: 2,
        1100: 1,
        700: 1
    }

    const navigate = useNavigate();

    const [carName, setCarName] = useState('');
    const [carPrice, setCarPrice] = useState('');
    const [door, setCarDoor] = useState('4');
    const [transmission, setTransmission] = useState('Automatic');
    const [capacity, setCapacity] = useState('4');
    const [description, setDescription] = useState('');
    const [perCharge, setPerCharge] = useState('');
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(false);
    
    // useEffect for rendering cars variable
    const [carUpdated, setCarUpdated] = useState('no');

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

    // Dialog variables and function
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogContent, setDialogContent] = useState('');
    const closeDialog = () => {
        setOpenDialog(false);
    }

    // file handler
    const fileHandler = (e) => {
        let arr = e.target.files;

        let maxSize = 4000000;
        
        //get all images size
        let imagesSize = getImagesSize(arr);


        if(arr.length > 4){
            setMessage('Maximum number of image should be 4');
            setSeverity('error');
            setOpen(true);
        }else if(maxSize < imagesSize){
            setMessage('Total image size exceeds 4MB, Reduce Image sizes and try again');
            setSeverity('error');
            setOpen(true);
        }else{
            setImages([...arr]);
        }
    }

    //get images size
    const getImagesSize = (arr) => {
        let totalSize = 0;
        for(let x = 0; arr.length > x; x++){
            totalSize += arr[x].size;
        }

        return totalSize;
    }

    //remove image
    const removeImage = (img) => {
        let updatedImages = images.filter( image => image !== img );
        setImages([...updatedImages])
    }

    //handle car submit
    const handleSubmit = () => {
        //check if no field is empty
        if(carName !== '' && carPrice !== '' && images.length > 0 && description !== '' && perCharge !== ''){
            setLoading(true);
            //add data to formData
            let formData = new FormData();
            
            formData.append('car_name', carName);
            formData.append('car_price', carPrice);
            formData.append('per_charge', capWord(perCharge));
            formData.append('description', description);
            formData.append('car_door', door);
            formData.append('capacity', capacity);
            formData.append('transmission', transmission);
            for(let x = 0; x < images.length; x++){
                formData.append(`image${x}`, images[x]);
            }


            fetch('/api/add-car', {
                mode: 'cors',
                method: 'POST',
                credentials: 'include',
                //headers: {"Content-Type": "multipart/form-data", "Accept": "multipart/form-data", "Origin":"http://localhost:3000"},
                body: formData
            }).then(res => res.json())
            .then(data => {
                if(data.status){
                    setMessage('Car added successfully');
                    setSeverity('success');
                    setOpen(true);

                    setCarUpdated(Date.now()+'');
                    //clear all fields
                    setCarPrice(''); setCarName(''); setDescription(''); setImages([]); setCapacity(''); setCarDoor(''); setPerCharge('')
                    setLoading(false);
                }else{
                    setMessage(`${data.error}`);
                    setSeverity('error');
                    setOpen(true);
                    setLoading(false);
                }
            }).catch(err => {
                setMessage(`${err.message}`);
                setSeverity('error');
                setOpen(true);
                setLoading(false);
            })
        }else{
            setMessage('Ensure no field is empty');
            setSeverity('error');
            setOpen(true);
        }
    }
    
    // Get cars function and variables
    const [cars, setCars] = useState(null);
    const [carLoading, setCarLoading] = useState(true);
    const getCars = () => {
       fetch('/api/get-cars', {
           mode: 'cors',
           method: 'GET',
           credentials: 'include',
           headers: {"Content-type": "application/json", "Accept": "application/json", "Origin": "http://localhost:3000"}
       }).then(res => res.json())
       .then(data => {
            if(data.status){
                let arr = data.cars;
                setCars([...arr]);
                setCarLoading(false);
            }else{
                setMessage(data.error);
                setSeverity('error');
                setOpen(true);
                setCarLoading(false)
            }
       }).catch(err => {
           setMessage(err.message);
           setSeverity('error');
           setOpen(true);
           carLoading(false);
       })
   }

   const [carId, setCarId] = useState('');

   const callDialog = (id) => {
       setCarId(id);
       setDialogTitle('Delete Car Listing ?');
       setDialogContent('Are you sure you want to delete this car from your listing? Deleted cars can not be recovered.');
       setOpenDialog(true);
   }

   const handleDelete = () => {
        //delete car
        fetch('/api/delete-car', {
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Origin': 'http://localhost:3000'},
            body: JSON.stringify({carId: carId})
        }).then(res => res.json())
        .then(data => {
            if(data.status){
                setOpenDialog(false);
                setMessage('Car deleted successfully');
                setSeverity('success');
                setOpen(true);
                setCarUpdated(carId);
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

   const editCar = (id) => {
        //save car id to loaclstorage
        localStorage.setItem('carId', id);

        //navigate to edit car
        navigate('/dashboard/cars/edit');
   }

   //booked cars variables and function
   const [bookedCars, setBookedCars] = useState(null);
   const [bookedCarsTimestamp, setBCT] = useState(null);
   const [bookedCarLoading, setBCL] = useState(true);
   //get booked cars
   const getBookedCars = () => {
       fetch('/api/booked-cars-3', {
           credentials: 'include',
        }).then(res => res.json())
        .then(data => {
            if(data.status){
                let arr = data.cars;
                let ray = data.booked_car_col_for_timeline;
                setBookedCars([...arr]);
                setBCT([...ray]);
                setBCL(false);
            }else{
                setMessage(data.error)
                setSeverity('error')
                setOpen(true);
                setBCL(false);
            }
        }).catch(err => {
            setMessage(err.message)
            setSeverity('error')
            setOpen(true);
            setBCL(false);
        })
   }

   const getDate = (timestamp) => {
       let d = new Date(parseInt(timestamp));
       let date = d.toString().substring(0, 24);
       return date;
   }



   useEffect(() => {
        getCars();
        getBookedCars();
        //eslint-disable-next-line
   }, [carUpdated]);

//    UTILITIES FUNCTION
   function capWord(word) {
       let first = word[0].toUpperCase();
       let newWord = first+word.substring(1, word.length).toLowerCase();
       return newWord;
   }

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
                    <Button onClick={handleDelete}>Yes</Button>
                </DialogActions>
            </Dialog>
            <Masonry
                breakpointCols={breakpoint2}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
            >
                <div className="col">
                    <div className="title space-box-20">
                        <Typography>
                            Upload Car
                        </Typography>
                    </div>
                    <Divider light/>
                    <div className="content space-box-20">
                        <TextField 
                            value={carName}
                            onChange={(e) => setCarName(e.target.value)}
                            type="text" required variant="standard"
                            label="Car name" fullWidth margin="normal"/>
                        <Grid container spacing={2}>
                            <Grid item sm={12} md={6}>
                                <TextField
                                    value={carPrice}
                                    onChange={(e) => setCarPrice(e.target.value)} fullWidth
                                    required label="Car price" variant="standard" margin="normal"/>
                            </Grid>
                            <Grid item sm={12} md={6}>
                                <TextField
                                    value={transmission}
                                    onChange={(e) => setTransmission(e.target.value)} fullWidth
                                    required label="Car transmission" variant="standard" margin="normal"/>
                            </Grid>
                            <Grid item sm={12} md={6}>
                                <TextField
                                    value={door}
                                    onChange={(e) => setCarDoor(e.target.value)} fullWidth
                                    required label="Number of doors" variant="standard" margin="normal"/>
                            </Grid>
                            <Grid item sm={12} md={6}>
                                <TextField
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)} fullWidth
                                    required label="Car capacity" variant="standard" margin="normal"/>
                                <Typography variant="body2" sx={{fontSize: '10px', color: grey[400]}}>
                                    Amount of passengers car can carry
                                </Typography>
                            </Grid>
                            <Grid item sm={12} md={6}>
                                <TextField
                                    value={perCharge}
                                    onChange={(e) => setPerCharge(e.target.value)} fullWidth
                                    required label="Charge method" variant="standard" margin="normal"/>
                                <Typography variant="body2" sx={{fontSize: '10px', color: grey[400]}}>
                                    What method of billing is associated with this car e.g "Per day" or "Per hour"
                                </Typography>
                            </Grid>
                        </Grid>

                        <TextField 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)} row={4}
                            multiline required label="Description" variant="standard" margin="normal" fullWidth
                        />

                        <div className="file-container">
                            <input type="file" name="images" id="images" onChange={fileHandler} multiple/>
                        </div>
                        <Typography variant="body2" sx={{fontSize: '10px', color: red[400]}}>
                           Max number of 4 images | Max. image size of 4MB
                        </Typography>
                        {images && 
                            <div style={{ overflowX: 'scroll', display: 'flex', maxWidth: '100%'}}>
                                {images.map((img, index) => (
                                    <div key={index} style={{margin: '10px'}}>
                                        <div className="image-preview" style={{backgroundImage: `url(${URL.createObjectURL(img)})`}}>
                                                <div className="delete-image" style={{textAlign: "right"}} >
                                                    <HighlightOffIcon color="error" sx={{cursor: 'pointer'}} onClick={() => removeImage(img)}/>
                                                </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                        <Button variant="contained" sx={{width: '100%', marginTop: '20px'}} disableElevation onClick={handleSubmit}>
                            {loading ? <CircularProgress sx={{color: 'white'}}/> : 'ADD CAR TO FLEET'}
                        </Button>
                    </div>
                </div>
                <div className="col" >
                    <div className="title space-box-20">
                        <Typography>
                            Available Cars
                        </Typography>
                    </div>
                    {/* <Divider light/> */}
                    <div className="content space-box-20" style={{maxHeight: '50vh', overflowY: 'scroll'}}>
                        {/* FOR THE SKELETON */}
                        {carLoading && 
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Skeleton variant="rectangle" animation="wave" width={200} height={200} sx={{borderRadius: '10px' }}/>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Skeleton variant="rectangle" animation="wave" width={200} height={200} sx={{borderRadius: '10px' }}/>
                                </Grid>
                            </Grid>
                        }
                        {/* LOADING SKELETON ENDS */}
                        {cars && 
                            <Grid container spacing={2}>
                                {cars.length === 0 ?  <div className="space-box-20"><Typography> Seems you have no cars available</Typography></div>
                                : cars.map((car, index) => (
                                    <Grid item key={index} xs={12} md={6}>
                                        <Card sx={{maxWidth: 200, width: 200, borderRadius: '10px', border: 'solid 1px '+blue[300]}} elevation={0}>
                                            <CardMedia
                                                component="img"
                                                alt={car['_fieldsProto']['car name'].stringValue}
                                                height="100"
                                                image={car['_fieldsProto']['images']['arrayValue']['values'][0].stringValue}
                                            />
                                            <CardContent>
                                                <Typography variant="h6" noWrap={true}>
                                                    {car['_fieldsProto']['car name'].stringValue}
                                                </Typography>
                                                <Typography variant='body2' color="text.secondary" noWrap={true} sx={{fontSize: '10px', color: grey[400]}}>
                                                    {car['_fieldsProto']['description'].stringValue}
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Button size="small" onClick={() => editCar(car['_ref']['_path']['segments'][3])}>Edit</Button>
                                                <Button size="small" sx={{color: red[400]}} onClick={() => callDialog(car['_ref']['_path']['segments'][3])}> Delete </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        }
                    </div>
                </div>
                <div className="col">

                </div>
                <div className="col">
                    <div className="title space-box-20" style={{display: 'flex'}}>
                        <Typography sx={{flexGrow:1}}>
                            Recently Booked Cars
                        </Typography>
                        {bookedCars && 
                            <Link to="/dashboard/cars/booked">
                                {bookedCars.length > 0 ? 'See More' : ''}
                            </Link>
                        }
                        
                    </div>
                    <div className="content space-box-20">
                        {/* SKELETON LOADING STARTS */}
                        {bookedCarLoading && 
                            <div>
                                <Card elevation={0}>
                                    <CardHeader
                                        avatar={
                                            <Skeleton variant="circular" width={40} height={40} animation="wave"/>
                                        }
                                        title={(<Skeleton height={10}  width="80%" animation="wave" style={{marginButtom: "10px"}}/>)}
                                        subheader={(<Skeleton height={10}  width="30%" animation="wave"/>)}
                                    />
                                </Card>
                                <Card elevation={0}>
                                    <CardHeader
                                        avatar={
                                            <Skeleton variant="circular" width={40} height={40} animation="wave"/>
                                        }
                                        title={(<Skeleton height={10}  width="80%" animation="wave" style={{marginButtom: "10px"}}/>)}
                                        subheader={(<Skeleton height={10}  width="30%" animation="wave"/>)}
                                    />
                                </Card>

                            </div>
                        }
                        {/* LOADING ENDS */}
                        {bookedCars && 
                            <div>
                                {bookedCars.length === 0 ? <Typography variant="body2">There are no booked Cars at this time</Typography> 
                                    : bookedCars.map((bookedCar, index) => (
                                    <div key={index}>
                                        <Card elevation={0}>
                                            <CardHeader
                                                avatar={
                                                    <Avatar alt={bookedCar['car name']} src={bookedCar.images[0]}/>
                                                }
                                                title={bookedCar['car name']}
                                                subheader={getDate(bookedCarsTimestamp[index]['_fieldsProto']['timestamp'].integerValue)}
                                            />
                                        </Card>
                                    </div>  
                                ))}
                            </div>
                        }
                    </div>
                </div>
            </Masonry>
        </div>
     );
}
 
export default Cars;