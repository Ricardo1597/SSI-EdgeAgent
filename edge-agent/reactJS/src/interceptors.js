import axios from 'axios';
import config from './config';
// import apiAxios from './axiosInstances';

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
        return response;
      },
      (error) => {
        console.log(JSON.stringify(error));
        return new Promise((resolve, reject) => {
          const originalRequest = error.config;
          const status = error.response.status;

          if (
            (status === 401 || status === 403) &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/users/refresh-token')
          ) {
            // Invalid credentials
            if (error.response.data.error === 'Invalid credentials') {
              return reject({ status: 401, message: 'Invalid credentials' });
            }
            // Refresh access token
            let res = refreshAccessToken(store)
              .then((token) => {
                if (!token) {
                  return Promise.reject({ status: 401, message: 'Unable to refresh token.' });
                }
                originalRequest._retry = true;
                originalRequest.headers.Authorization = `Bearer ${token}`;

                return axios(originalRequest);
              })
              .catch((error) => {
                console.log('Error resending request: ', error);
                return Promise.reject(error);
              });
            resolve(res);
          }
          reject(error);
        });
      }
    );
  },
};

const refreshAccessToken = async (store) => {
  return axios
    .post(
      `${config.endpoint}/users/refresh-token`,
      {},
      {
        withCredentials: true,
      }
    )
    .then((res) => {
      store.dispatch({ type: 'UPDATE_ACCESS_TOKEN', token: res.data.accessToken });
      return res.data.accessToken;
    })
    .catch((error) => {
      store.dispatch({ type: 'UPDATE_ACCESS_TOKEN', token: '' });
      return null;
    });
};
