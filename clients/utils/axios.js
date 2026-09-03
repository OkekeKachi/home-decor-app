import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // allows cookies if you decide to use httpOnly tokens
});

export default api;
