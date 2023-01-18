const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require('express-rate-limit')
const axios = require("axios");

const app = express();

const PORT = 8004;
const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
})


app.use(morgan("combined"));
app.use(limiter);
app.use("/bookingservice", async (req, res, next) => {

    try{
        const response = await axios.get("http://localhost:8001/api/v1/isAuthenticated", {
        headers: {
            "x-access-token": req.headers["x-access-token"]
        }
        });
        if(response.data.success){
            next();
        }
        else{
            res.status(401).json({
                message: "Unauthorised"
            })
        }
    }catch(error){
        res.status(401).json({
            message: "Unauthorised"
        })
    }
})
app.use("/bookingservice", createProxyMiddleware({ target: "http://localhost:8002/", changeOrigin: true}));

app.get("/home", (req, res) => {
    res.json({
        message: "OK"
    });
});

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});