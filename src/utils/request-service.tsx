import { useState, useEffect } from 'react';
import axios from 'axios';
import {RequestProps} from "../types";

axios.defaults.baseURL = 'http://178.63.13.157:8090/mock-api/api';



export const UseRequest = (axiosParams:RequestProps) => {
    const [response, setResponse] = useState(undefined);
    const [error, setError] = useState<any>('');
    const [loading, setLoading] = useState(true);
    let  result;
    const fetchData = async (params:RequestProps) => {
      try {
        result = await axios.request(params);
       setResponse(result.data);
       } catch( error ) {
         setError(error);
       } finally {
         setLoading(false);
       }
    };

    useEffect(() => {
        fetchData(axiosParams);
    }, []); // execute once only

    return {fetchData,  response, error, loading };
};

export const SendRequest = (params:RequestProps)=>{
    let  result =  axios.request(params);
        return result.then(function(response){
                        return result;
                    })
                    .catch(function(error){
                        return result;
                    })

}
