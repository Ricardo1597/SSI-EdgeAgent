import axios from 'axios';
import config from './config'
import apiAxios from './axiosInstances'

export default {

    setupInterceptors: (store) => {
        
        // Add a request interceptor (ready to use; not in use for now)
        // apiAxios.interceptors.request.use(
        //     conf => {
        //         const token = store.getState().accessToken;
        //         if (token) {
        //             conf.headers['Authorization'] = 'Bearer ' + token;
        //         }
        //         // conf.headers['Content-Type'] = 'application/json';
        //         return conf;
        //     },
        //     error => {
        //         Promise.reject(error)
        //     }
        // );

        // Add a response interceptor
        axios.interceptors.response.use(
            (response) => { 
                return response 
            },
            async (error) => {
                return new Promise((resolve, reject) => {
                    const originalRequest = error.config
                    const status = error.response.status
                
                    if (
                        (status === 401 || status === 403) &&
                        !originalRequest._retry &&
                        !originalRequest.url.includes('/users/refresh-token')
                    ) {           
                        console.log("vou dar refresh")             
                        // Refresh access token
                        let res = refreshAccessToken(store)
                        .then(token => {
                            console.log("aqui11")
                            if(!token) {
                                console.log("aqui12")
                                return Promise.reject(new Error("Unable to refresh token."));
                            }
                            originalRequest._retry = true
                            originalRequest.headers.Authorization = `Bearer ${token}`

                            return axios(originalRequest)
                        })
                        .catch(error => {
                            console.log("aqui13: ", error)
                            return Promise.reject(error)
                        });
                        console.log("antes do resolve")
                        console.log(res)
                        resolve(res);
                    } 
                        
                    reject(error)
                })
            }
        );
    }
};



const refreshAccessToken = async (store) => {
    return axios.post(`${config.endpoint}/users/refresh-token`, {}, {
        withCredentials: true,
    })
    .then(res => {
        console.log("aqui14: ", res)
        store.dispatch({type: 'UPDATE_ACCESSTOKEN', token: res.data.accessToken});
        return res.data.accessToken;
    })
    .catch(error => {
        console.log("aqui14: ", error)
        store.dispatch({type: 'UPDATE_ACCESSTOKEN', token: ""});
        return null;
    });
}
