import axios from "axios";

const baseURL = "http://10.0.0.5:5000"
//const burl = "localhost:5000"

const AxiosSingleton = (function(){
    var instance;
    function createInstance() {
        return axios.create({baseURL})
    }
    return {
        getInstance: function () {
            if (!instance)
                instance = createInstance();
            return instance;
        }
    }
})()

export default function RunAxios(method, path, data, options = {}) {
    return AxiosSingleton.getInstance()({ method, url: (path[0] == "/" ? "" : "/") + path, data: data || null, withCredentials: true, headers: options.headers })
}