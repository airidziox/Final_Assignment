module.exports =  {
    get: (url) => {
        return new Promise(resolve => {

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    resolve(data)
                })

        })
    },
    post: (url, data) => {
        return new Promise(resolve => {

            const options = {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(data)
            }

            fetch(url, options)
                .then(res => res.json())
                .then(data => {
                    resolve(data)
                })

        })
    },
    getToken: (url) => {
        return new Promise(resolve => {

            const options = {
                method: "GET",
                headers: {
                    authorization: localStorage.getItem('token'),
                    "content-type": "application/json"
                }
            }

            fetch(url, options)
                .then(res => res.json())
                .then(data => {
                    resolve(data)
                })

        })
    },
    postToken: (url, data) => {
        return new Promise(resolve => {

            const options = {
                method: "POST",
                headers: {
                    authorization: localStorage.getItem('token'),
                    "content-type": "application/json"
                },
                body: JSON.stringify(data)
            }

            fetch(url, options)
                .then(res => res.json())
                .then(data => {
                    resolve(data)
                })

        })
    }
}