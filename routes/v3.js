const express = require('express');
const app = express.Router();
const news = require('../other.js');
const cache = require('../cache.js');

const notFound = '404 Not Found';
const serverError = 'Something Went Wrong';

app.route('/')
.get(async (req,res) => {
    try {
        const data = await news.topic(false);
        res.send(data);
    }catch(e) {
        res.send(serverError);
    }
})

app.route('/articles')
.get(async (req,res) => {
    try {
        var page = req.query.page;
        if(!page || !Number(page)) page = 1;
        const data = await news.topic(false);
        const array = [];
        for (let i = 0; i < data.length; i += 10) {
        array.push(data.slice(i, i + 10));
        }
        if(!array[page - 1]) return res.send(notFound);
        res.send({
            page,
            totalPages: array.length,
            articles: array[page - 1]
        });
    }catch(e) {
        console.log(e)
        res.send(serverError);
    }
})

app.route('/:id')
.get(async (req,res) => {
    try {
        const data = await news.topic(false, req.params.id);
        res.send(data);
    }catch(e) {
        res.send(serverError);
    }
})

app.route('/:id/articles')
.get(async (req,res) => {
    try {
        var page = req.query.page;
        if(!page || !Number(page)) page = 1;
        const data = await news.topic(false, req.params.id);
        const array = [];
        for (let i = 0; i < data.length; i += 10) {
        array.push(data.slice(i, i + 10));
        }
        if(!array[page - 1]) return res.send(notFound);
        res.send({
            page,
            totalPages: array.length,
            articles: array[page - 1]
        });
    }catch(e) {
        console.log(e)
        res.send(serverError);
    }
})

app.route('/article/:id')
.get(async (req,res) => {
    var article = await news.getArticle(req.params.id);
    if(!article)return res.send(notFound);
    return res.send(article);
})


module.exports = app;
