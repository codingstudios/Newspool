const express = require("express");
const helmet = require("helmet");
const v1 = require("./routes/v1.js");
const v2 = require("./routes/v2.js");
const { getArticle } = require('./gnews.js');
const path = require('path');
const app = express();

app.use(helmet());
app.use('/v1', v1);
app.use('/v2', v2);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, './public')));

app.get('/article/:id', async (req, res) => {
    try {
    const article = await getArticle(req.url.slice(9));
    if(!article) return res.render('content', {
        title: "404 Not Found"
    })
    res.render('content', {
        article,
        description: article.length > 200 ? `${article.substring(0, 200).split(`"`).join("'")}...` : article.split(`"`).join("'"),
        title: req?.params?.id.split("-").join(" ")
    });
}catch(e) {
    return res.render('content',{
        title: "Server Error"
    })
} 
})

app.listen(3000);
