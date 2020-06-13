import axios from 'axios';
import config from './config'


export default {
    setupInterceptors: async (store) => {

        // Add a response interceptor
        await axios.interceptors.response.use(
            (response) => { 
                return response 
            },
            async (error) => {
                console.log(error)
                const originalRequest = error.config
                const status = error.response.status
            
                console.log(originalRequest)
            
                if (
                    (status === 401 || status === 403) &&
                    !originalRequest._retry &&
                    originalRequest.url.includes('/users/checkToken')
                ) {
                    console.log('entrei no error 401 ou 403 do interceptor')
            
                    console.log("antes: ", originalRequest.headers.Authorization)
                    
                    // Refresh access token
                    await refreshAccessToken(store).then(token => {
                        originalRequest._retry = true
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        console.log("depois: ", originalRequest.headers.Authorization)

                        return axios(originalRequest)
                    });
            
                } else {            
                    console.log("vou rejeitar")
                    return Promise.reject(error)
                }
            })
    }
};



const refreshAccessToken = async (store) => {
    return axios.post(`${config.endpoint}/users/refreshToken`, {}, {
        withCredentials: true,
    })
    .then(res => {
        store.dispatch({type: 'UPDATE_ACCESSTOKEN', token: res.data.accessToken});
        console.log(res.data.accessToken);
        return res.data.accessToken;
    })
    .catch(err => {
        console.log("aqui 4")
        store.dispatch({type: 'UPDATE_ACCESSTOKEN', token: ""});
        console.error("aqui 4: ", err);
        return null;
    });
}
