import axios from "axios";

const baseURL = "https://10.0.0.5:5000/api/"
//const burl = "localhost:5000"

const AxiosSingleton = (function(){
    var instance;
    var filial;
    function createInstance(filial = '0101') {
        return axios.create({baseURL: baseURL + filial})
    }
    return {
        getInstance: function () {
            if (!instance)
                instance = createInstance();
            return instance;
        },
        setFilial: function (new_filial) {
            if (filial != new_filial)
                instance = createInstance(new_filial)
        }
    }
})()

const setFilial = AxiosSingleton.setFilial

export default function RunAxios(method, path, data, options = {}) {
    return AxiosSingleton.getInstance()({ method, url: (path[0] == "/" ? "" : "/") + path, data: data || null, withCredentials: true, headers: options.headers })
}

export {setFilial};