import axios from "axios";

const burl = "http://10.0.0.83:5000"
//const burl = "localhost:5000"
export default function Axios(method, path, data) {
    return axios({ method, url: burl + (path[0] == "/" ? "" : "/") + path, data: data || null, withCredentials: true })
}