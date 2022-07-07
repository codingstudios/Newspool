const express = require("express");
const app = express.Router();
const cache = require('../cache.js');
const news = require('../newsapi.js');
const notFound = '404 Not Found';
const serverError = 'Something Went Wrong';

app.route('/')
.get(async (req,res) => {
    if(cache.get('newsapi'))return res.json(cache.get('newsapi'));
    try {
        const data = await news.allArticle(false);
        cache.set('newsapi', data);
        return res.json(data);
    }catch(e) { 
        console.log(e)
        return res.send(serverError);
    }
})

app.route('/articles')
.get(async (req,res) => {
    var page = req.query.page;
    if(!page || !Number(page)) page = 1;
    var cached = cache.get('newsapi-articles');
    if(cached) {
        if(!cached[page - 1]) return res.send(notFound);
        return res.json({
        page,
        totalPages: cached.length,
        articles: cached[page - 1]
    });
  }
    try {
        const data = await news.allArticle(false);
        const array = [];
        for (let i = 0; i < data.length; i += 10) {
        array.push(data.slice(i, i + 10));
        }
        if(!array[page - 1]) return res.send(notFound);
        cache.set('newsapi-articles', array);
        return res.send({
            page,
            totalPages: array.length,
            articles: array[page - 1]
        });
    }catch(e) { 
        console.log(e)
        return res.send(serverError);
    }
})

app.route('/article/:id')
.get(async (req,res) => {
    var article = await news.getArticle(req.params.id);
    if(!article)return res.send(notFound);
    return res.send(article);
})

module.exports = app;
