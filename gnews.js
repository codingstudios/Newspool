const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();
const getRss = async (url) => await parser.parseURL(url);
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const cache = require('./cache.js');
const createDOMPurify = require('dompurify');
 
const TOPICS_RSS    = 'https://news.google.com/news/rss/headlines/section/topic/';
const SEARCH_RSS    = 'https://news.google.com/rss/search?q=';
const CUSTOM_RSS    = [];
const TOPICS = ['TECHNOLOGY', 'ENTERTAINMENT', 'SPORTS', 'SCIENCE'];
const URL = ``;

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

const topic = async (doCache = true, topicName, {n = 100} = {}) => {
  var allData = [];
  var data = [];
  var topics = TOPICS;
  if(topicName && !TOPICS.includes(topicName))return [];
  if(topicName) topics = [`${topicName}`];
   for(tName in topics) {
    try {
    const url = TOPICS_RSS + `${topicName ? topicName : topics[tName]}`;
    data = data.concat((await getRss(url)).items.slice(0, Math.max(0, n)));
  }catch(e) {}
}
if(Array.isArray(CUSTOM_RSS) && CUSTOM_RSS.length > 0) {
  for(i in CUSTOM_RSS) {
    try {
    var customData = (await getRss(CUSTOM_RSS[i])).items.slice(0, Math.max(0, n));
    data = data.concat(customData);
    }catch(e) {}
  }
}
  for(i in data) {
    cache.set(`${data[i]?.title?.split(" ").join("-")}`, `${data[i].link}`);
    data[i] = {
      ...data[i],
      content: undefined,
      description: data[i]?.contentSnippet ? data[i]?.contentSnippet?.replace('View Full coverage on Google News', '') : '',
      contentSnippet: undefined,
      comments: undefined,
      guid: undefined,
      url: `/article/${data[i]?.title?.split(" ")?.join("-")}`,
      link: `${URL}/article/${data[i]?.title.split(" ")?.join("-")}`
  }
  }
  
    if(data && doCache) {
      for(i in data) {
        try {
        await wait(5000);
        var contentRaw = await axios.get(data[i].link);
        cache.set(`${data[i]?.title?.split(" ").join("-")}`, `${contentFilter(data[i], contentRaw.data)}`);
        }catch(e) {}
      }
    }
    allData = allData.concat(data);
  return allData;
};

const search = async (query, { n = 100 }={}) => {
    const url = SEARCH_RSS + encodeURIComponent(query);
    var data = (await getRss(url)).items.slice(0, Math.max(0, n));
    for(i in data) {
      cache.set(`${data[i]?.title?.split(" ").join("-")}`, `${data[i]?.link}`);
      data[i] = {
        ...data[i],
        content: undefined,
        contentSnippet: undefined,
        guid: undefined,
        url: `/article/${data[i]?.title?.split(" ")?.join("-")}`,
        link: `${URL}/article/${data[i]?.title?.split(" ")?.join("-")}`
    }
    }
    if(data && doCache) {
      for(i in data) {
        try {
        await wait(5000);
        var contentRaw = await axios.get(data[i].link);
        cache.set(`${data[i].title?.split(" ").join("-")}`, `${contentFilter(data[i], contentRaw.data)}`);
        }catch(e) {}
      }
    }
    return data;
}; 

const getArticle = async (id) => {
  try {
  var data = cache.get(id);
  if(!data)return undefined;
  if(data.startsWith('https://')){
      const content = await axios.get(`${data}`);
      const articleContent = contentFilter(data, content.data);
      cache.set(`${id}`, `${articleContent}`);
      return articleContent;
  }else {
    return data;
  }
}catch(e) {}
}

module.exports = { search, topic, getArticle };
