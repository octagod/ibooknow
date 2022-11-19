import {useEffect, useState} from 'react';

const useFetchGet = ({url}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let controller = new AbortController();


        fetch(url, {signal: controller.signal,
            mode: 'cors',
            method: 'GET',
            credentials: 'include',
            headers: {"Content-Type": "application/json","Accept":"application/json","Origin":"http://localhost:3000"},
        })
        .then(response => {
            return response.json();
        }).then(data => {
            if(data.status){
                setData(data);
                console.log(data);
                setLoading(false);
            }else{
                setError(data.error);
                setLoading(false);
            }
        })
        .catch( err => {
            if(err.message === 'AbortError'){
                //do nothing
            }else{
                setError(err.message);
                setLoading(false);
            }
        });

        return () => controller.abort();
    }, [url]);

    return {data, loading, error}
}

export default useFetchGet;
