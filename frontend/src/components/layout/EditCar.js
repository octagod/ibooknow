import { Alert, Button, CircularProgress, Divider, Grid, IconButton, Skeleton, Snackbar, TextField, Typography } from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Masonry from "react-masonry-css";
import { useEffect } from "react";
import { grey, red } from "@mui/material/colors";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const EditCar = () => {
    //get car id from localhost
    const carId = localStorage.getItem('carId');


    const [car, setCar] = useState(null);
    const [carName, setCarName] = useState('');
    const [carPrice, setCarPrice] = useState('');
    const [door, setCarDoor] = useState('');
    const [transmission, setTransmission] = useState('');
    const [capacity, setCapacity] = useState('');
    const [description, setDescription] = useState('');
    const [perCharge, setPerCharge] = useState('');
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(false);
    const [genLoading, setGenLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(false);

    const [updateState, setUpdateState] = useState('');

    //snackbar variables and functions
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('error');
    const closeSnackbar = () => {
        setOpen(false);
    }


    const getCarInfo = () => {
        fetch('/api/get-car', {
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Origin': 'http://localhost:3000'},
            body: JSON.stringify({carId: carId})
        }).then(res => res.json())
        .then(data => {
            if(data.status){
                let obj = data.car;
                addCarData(obj);
                setCar(obj);
                setGenLoading(false)
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

    const addCarData = (data) => {
        setCarName(data['car name']);
        setCarPrice(data['car price']);
        setDescription(data.description);
        setPerCharge(data['per charge']);
        setTransmission(data.transmission)
        setCarDoor(data.doors);
        setCapacity(data.capacity)
        let imageArr = data.images;
        setImages([...imageArr]);
    }

    const navigate = useNavigate();

    const breakpoint ={
        default: 2,
        1100: 1,
        700: 1
    }

    useEffect(() => {
        getCarInfo();
        // eslint-disable-next-line
    }, [updateState])


    const handleSubmit = () => {
        if(carName !== '' && carPrice !== '' && description !== '' && perCharge !== '' && capacity !== '' && transmission !== ''){
            setLoading(true);
            fetch('/api/update-car', {
                mode: 'cors',
                method: 'POST',
                credentials: 'include',
                headers: {'Content-Type': 'application/json', 'Accept':'application/json', 'Origin':'http://localhost:3000'},
                body: JSON.stringify({
                    car_name: carName,
                    car_price: carPrice,
                    description: description,
                    capacity: capacity,
                    per_charge: perCharge,
                    transmission: transmission,
                    doors: door,
                    carId: carId
                })
            }).then(res => res.json())
            .then(data => {
                if(data.status){
                    setMessage('Car details updated successfully');
                    setSeverity('success');
                    setOpen(true);
                    setLoading(false)
                    setUpdateState(Date.now()+'');
                }else{
                    setMessage(data.error);
                    setSeverity('error');
                    setOpen(true);
                    setLoading(false)
                }
            }).catch(err => {
                setMessage(err.message);
                setSeverity('error');
                setOpen(true);
                setLoading(false)
            })
        }else{
            setMessage('Leave No field Empty');
            setSeverity('error');
            setOpen(true);
        }
    }

    //images variab;es and functions
    const [updatedImages, setUpdatedImages] = useState([]);

    const selectImage = (index, img) => {
        //check if image exist in updatedImages array
        if(!updatedImages.includes(images[index])){
            setUpdatedImages([...updatedImages, images[index]]);
        }else{
            setMessage('Image can\'t be selected twice');
            setSeverity('error');
            setOpen(true);
        }

    }

    const clearSelection = () => {
        setUpdatedImages([]);
    }

    const updateImages = () => {
        //eslint-disable-next-line
        if(updatedImages.length == images.length){

            setImageLoading(false)
            fetch('/api/update-car-images', {
                mode:'cors',
                method: 'POST',
                credentials: 'include',
                headers: {'Content-Type': 'application/json', 'Accept':'application/json', 'Origin':'http://localhost:3000'},
                body: JSON.stringify({images: updatedImages, carId: carId})
            }).then(res => res.json())
            .then(data => {
                if(data.status){
                    setMessage('Images sort updated successfully');
                    setSeverity('success');
                    setOpen(true);
                    setImageLoading(false)
                    setUpdateState(Date.now()+''); // this allows use effect to run again and re renders the state which updates the fetch requests
                    setUpdatedImages([]); // clear the updated images image
                }else{
                    setMessage(data.error);
                    setSeverity('error');
                    setOpen(true);
                    setImageLoading(false)
                }
            }).catch(err => {
                setMessage(err.message);
                setSeverity('error');
                setOpen(true);
                setImageLoading(false)
            })
        }else{
            setMessage('It seems you haven\'t selected all the images');
            setSeverity('error');
            setOpen(true);
        }
    }

    const removeImage = (img) => {
        let updateImges = updatedImages.filter( image => image !== img );
        setUpdatedImages([...updateImges]);
    }


    //add new images
    const [newImages, setNewImages] = useState(null);
    const [uploading, setUploading] = useState(false);

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
            setNewImages([...arr]);
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
    const removeNewImage = (img) => {
        let uparr = newImages.filter( image => image !== img );
        setNewImages([...uparr])
    }

    //upload images
    const uploadImages = () => {
        if( newImages !== null && newImages !== [] && newImages.length > 0){
            setUploading(true);
            //add data to formData
            let formData = new FormData();

            formData.append('carId', carId);
            for(let x = 0; x < newImages.length; x++){
                formData.append(`image${x}`, newImages[x]);
            }

            fetch('/api/upload-car-images', {
                mode: 'cors',
                method: 'POST',
                credentials: 'include',
                //headers: {"Content-Type": "multipart/form-data", "Accept": "multipart/form-data", "Origin":"http://localhost:3000"},
                body: formData
            }).then(res => res.json())
            .then(data => {
                if(data.status){
                    setMessage('Images uploaded successfully');
                    setSeverity('success');
                    setOpen(true);

                    setUpdateState(Date.now()+'');
                    //clear all fields
                    setNewImages([]); 
                    setUploading(false);
                }else{
                    setMessage(`${data.error}`);
                    setSeverity('error');
                    setOpen(true);
                    setUploading(false);
                }
            }).catch(err => {
                setMessage(`${err.message}`);
                setSeverity('error');
                setOpen(true);
                setUploading(false);
            })

        }else{
            setMessage('Can not upload empty images');
            setSeverity('error');
            setOpen(true);
        }
    }

    return ( 
        <div className="main">
            <Snackbar onClose={closeSnackbar} autoHideDuration={6000} open={open}>
                <Alert onClose={closeSnackbar} severity={severity} sx={{width: '100%'}}>
                    {message}
                </Alert>
            </Snackbar>
            <div className="left">
                <IconButton onClick={() => navigate('/dashboard/cars')}>
                    <ChevronLeftIcon />
                </IconButton>
            </div>
            <Masonry
                breakpointCols={breakpoint}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
            >
            {genLoading ? <div className="col space-box-20" style={{ marginTop: '20px'}}><Skeleton animation="wave" width="100%" height="60vh" variant="rectangle" sx={{borderRadius: '20px'}}/></div> : 
                <div className="col" style={{ marginTop: '20px'}}>
                    <div className="title space-box-20">
                        <Typography>
                            Edit Car
                        </Typography>
                    </div>
                    <Divider light/>
                    <div className="content space-box-20">
                        {car && 
                            <div>
                                <TextField
                                fullWidth value={carName} onChange={(e) => setCarName(e.target.value)}
                                variant="standard" label="Car Name" required margin="normal" />
                                <Grid container spacing={2}>
                                    <Grid item sm={12} md={6}>
                                        <TextField
                                        fullWidth value={carPrice} onChange={(e) => setCarPrice(e.target.value)}
                                        variant="standard" label="Car Price" required margin="normal" />
                                    </Grid>
                                    <Grid item sm={12} md={6}>
                                        <TextField
                                        fullWidth value={transmission} onChange={(e) => setTransmission(e.target.value)}
                                        variant="standard" label="Car transmission" required margin="normal" />
                                    </Grid>
                                    <Grid item sm={12} md={6}>
                                        <TextField
                                        fullWidth value={door} onChange={(e) => setCarDoor(e.target.value)}
                                        variant="standard" label="Car Doors" required margin="normal" />
                                    </Grid>
                                    <Grid item sm={12} md={6}>
                                        <TextField
                                        fullWidth value={capacity} onChange={(e) => setCapacity(e.target.value)}
                                        variant="standard" label="Car Capacity" required margin="normal" />
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
                                    onChange={(e) => setDescription(e.target.value)}
                                    multiline required label="Description" variant="standard" margin="normal" fullWidth row={4}
                                />
                                <Button variant="contained" sx={{width: '100%', marginTop: '20px'}} disableElevation onClick={handleSubmit}>
                                    {loading ? <CircularProgress sx={{color: 'white'}}/> : 'MAKE CHANGES'}
                                </Button>
                            </div>
                        }
                    </div>
                </div>
            }
                <div className="col" style={{marginTop: '20px'}}>
                        <div className="title space-box-20">
                            <Typography>
                                Car Images
                            </Typography>
                        </div>
                        <Divider light />
                        { genLoading ? <div className="col space-box-20" style={{ marginTop: '20px'}}><Skeleton animation="wave" width="100%" height="10" variant="rectangle" sx={{borderRadius: '20px'}} /> <div className="space-box-20"></div><Skeleton animation="wave" width="100%" height="120px" variant="rectangle" sx={{borderRadius: '20px'}} /> </div> :
                            <div className="content space-box-20">
                                <Typography>Arrange Image order</Typography>
                                <div className="space-box"></div>
                                {images && 
                                    <Grid container spacing={2}>
                                        {images.map((img, index) => (
                                            <Grid item key={index} xs={12} md={6}>
                                                <div style={{width: '100%', backgroundImage: `url('${img}')`}} className="image-preview clickable"
                                                    onClick={() => selectImage(index, img)}
                                                >
                                                    <div className="number" style={{textAlign: 'left'}}>
                                                        
                                                    </div>
                                                </div>
                                            </Grid>
                                        ))}
                                    </Grid>
                                }
                                <div className="space-box-20">
                                    <Typography>Sorted Result</Typography>
                                </div>
                                {updatedImages && 
                                    <Grid container spacing={2}>
                                        {updatedImages.map((img, index) => (
                                            <Grid item key={index} xs={12} md={6}>
                                                <div style={{width: '100%', backgroundImage: `url('${img}')`}} className="image-preview clickable">
                                                    <div className="delete-image" style={{textAlign: "right"}} >
                                                        <HighlightOffIcon color="error" sx={{cursor: 'pointer'}} onClick={() => removeImage(img)}/>
                                                    </div>
                                                </div>
                                            </Grid>
                                        ))}
                                    </Grid>
                                }
                                <div className="space-box-20"></div>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Button color="error" variant="contained" onClick={() => clearSelection()} disableElevation sx={{width: '100%'}}>RESET SELECTION</Button>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Button color="primary" variant="contained" onClick={() => updateImages()} disableElevation sx={{width: '100%'}}>
                                            {imageLoading ? <CircularProgress sx={{color: 'white'}}/> : 'UPDATE IMAGES'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </div>
                        }
                </div>
                <div className="">

                </div>
                <div className="col" style={{marginTop: '20px'}}>
                    <div className="title space-box-20">
                       <Typography>
                        Upload Images
                       </Typography>
                    </div>
                    <Divider />
                    <div className="content space-box-20">
                        <Typography color="text.secondary">NOTE: Uploading new images will override existing images</Typography>
                        <div className="file-container">
                            <input type="file" name="images" id="images" onChange={fileHandler} multiple/>
                        </div>
                        <Typography variant="body2" sx={{fontSize: '10px', color: red[400]}}>
                            Max number of 4 images | Max. image size of 4MB
                        </Typography>
                        {newImages && 
                            <div style={{ overflowX: 'scroll', display: 'flex', maxWidth: '100%'}}>
                                {newImages.map((img, index) => (
                                    <div key={index} style={{margin: '10px'}}>
                                        <div className="image-preview" style={{backgroundImage: `url(${URL.createObjectURL(img)})`}}>
                                                <div className="delete-image" style={{textAlign: "right"}} >
                                                    <HighlightOffIcon color="error" sx={{cursor: 'pointer'}} onClick={() => removeNewImage(img)}/>
                                                </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                        <div className="space-box-20"></div>
                        <Button variant="contained" disableElevation onClick={uploadImages} sx={{width: '100%'}}>
                            {uploading ? <CircularProgress sx={{color: 'white'}}/> : 'UPLOAD IMAGES'}
                        </Button>
                    </div>
                </div>
            </Masonry>
        </div>
     );
}
 
export default EditCar;