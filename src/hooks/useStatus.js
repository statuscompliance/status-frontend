import { useEffect, useState } from 'react'
import { statusApi } from '../api/statusApi'

export const useStatus = (catalogId) => {
    const [ catalogs, setCatalogs ] = useState([]);
    const [ mashups, setMashups ] = useState([]);

    useEffect(() => {
        getCatalogs();
        getMashups();
    }, [])

    const getCatalogs = async() => {
        const resp = await statusApi.get('http://localhost:3001/api/catalog');
        setCatalogs( resp.data );
    }

    const getMashups = async() => {
        const resp = await statusApi.get('http://localhost:3001/api/mashup');
        setMashups( resp.data );
    }

    return {
        catalogs,
        mashups
    }
}