const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();
const getRss = async (url) => await parser.parseURL(url);
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const cache = require('./cache.js');
const createDOMPurify = require('dompurify');

const CUSTOM_RSS    = {
  ["NAME"]: 'RSS'
};
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
  
const topic = async (doCache = true, custom, {n = 100} = {}) => {
    var allData = [];
    var data = [];
  if(!custom) {
    for(i in CUSTOM_RSS) {
      try {
      var customData = (await getRss(CUSTOM_RSS[i])).items.slice(0, Math.max(0, n));
      data = data.concat(customData);
      }catch(e) {}
    }
}
  if(custom && CUSTOM_RSS[custom]){
    try {
    var customData = (await getRss(CUSTOM_RSS[custom])).items.slice(0, Math.max(0, n));
    data = data.concat(customData);
    }catch(e) {}
  }else if(custom && !CUSTOM_RSS[custom]) {
    return []
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
  
  module.exports = { topic, getArticle };
