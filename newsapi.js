const axios = require("axios");
const { Readability } = require("@mozilla/readability");
const { JSDOM } = require('jsdom');
const fs = require('fs')
const english = /^[a-zA-Z0-9]+$/;

const queries = []
const countries = [];
const createDOMPurify = require('dompurify');
const apiKeys = [];
const getURL = (data) => `https://newsapi.org/v2/${data?.category}?sortBy=publishedAt&apiKey=${apiKeys[Math.floor(Math.random() * apiKeys.length)]}${data?.query ? `&domains=${data.query}` : ''}${data?.country ? `&country=${data.country}` : ''}`;
const cache = require('./cache.js');

const baseURL = '';

const contentFilter = (link, contentData) => {
    try {
    let dom = new JSDOM(contentData, {
      url: link
    });
    let article = new Readability(dom.window.document).parse();
    const DOMPurify = createDOMPurify(new JSDOM('').window);
    const finalContent = DOMPurify.sanitize(article.textContent);
    return `${finalContent.replace(/\s+/g, " ").replace(/(<([^>]+)>)/gi, "")}`;
  }catch(e) {}
  }
  
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  const allArticle = async (doCache = true, {n = 100} = {}) => {
    var allData = [];
     for(URL in queries) {
      var content = (await axios.get(getURL({ category: 'everything', query: queries[URL] }))).data;
      var data = content["articles"]
      for(i in data) {
        if(!english.test(data[i]?.title?.split(" ").join("-"))) {
        cache.set(`${data[i]?.title?.split(" ").join("-")}`, `${data[i].url}`);
        data[i] = {
          ...data[i],
          source: undefined,
          description: undefined,
          content: undefined,
          author: undefined,
          urlToImage: undefined,
          link: `${baseURL}/article/${data[i]?.title?.split(" ").join("-")}`
      }
    }
      }
    allData = allData.concat(data);

      if(allData && doCache) {
        for(i in allData) {
          try {
          await wait(5000);
          var contentRaw = await axios.get(allData[i].url);
          cache.set(`${data[i]?.title?.replace(" ").join("-")}`, `${contentFilter(allData[i].url, contentRaw.data)}`);
          }catch(e) {}
        }
      }
    };


    return allData;
  };
  
  const getArticle = async (id) => {
    try {
    var data = cache.get(id);
    if(!data)return undefined;
    if(data.startsWith('https://')){
      if(!english.test(id)) {
        const content = await axios.get(`${data}`);
        const articleContent = contentFilter(data, content.data);
        cache.set(`${id}`, `${articleContent}`);
        return articleContent;
      }
    }else {
      return data;
    }
  }catch(e) {}
  }
  

module.exports = { allArticle, getArticle };
