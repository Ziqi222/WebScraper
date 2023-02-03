const puppeteer = require('puppeteer');

// create a async function to get the response from the web link
(async () => {

  // launch the browser and goto the web page
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://www.amplifiedintelligence.com.au/archive/');

  // function to collect all of the articles' urls
  const fetchArchives = await page.evaluate(() => {
    let archivesArr = [];

    // get the html of the document
    const archives = document.querySelectorAll('.dgbm_post_item.v2');

    // loop through each article and select the urls
    archives.forEach((archive)=>{
      const info = archive.querySelectorAll('div');
      const mainInfo = info[1];
      const URL = mainInfo.querySelector('div > a').getAttribute('href');

      // store the url into the array
      archivesArr.push(URL);
    });
    return archivesArr;
  });

  // access each article page
  for (const url of fetchArchives)
  {
    await page.goto(url);

    // function to collect all the info from each article
    const fetchArticles = await page.evaluate(() => {
      let articleArr = [];

      // get the html of the document
      const article = document.querySelector('article');
      const title = article.querySelector('h1').innerText;
      const publishDate = article.querySelector('span.published').innerText;
      const pDate = new Date(publishDate);
      const publishedDate = new Date(pDate.setMinutes(pDate.getMinutes() + 22.5*60)).toISOString();
      const cDate = new Date();
      const collectDate = new Date(cDate.setMinutes(cDate.getMinutes() + 22.5*60)).toISOString();
      const articleUrl = document.querySelector('link[rel="canonical"]').getAttribute('href');
      const bodyInfo =  document.body.innerText;

      // select the article id as the key 
      const idValue = article.id;

      // store and format the data
      articleArr.push({Key: idValue, Title: title, CollectingDate: collectDate, PublishedDate: publishedDate, Url: articleUrl, Body: bodyInfo});
      
      return articleArr;
    });
    
    // function to save the articles' data to separate JSON files
    const fs = require('fs');
    const path = require('path');
    const saveData = (articles)=>{
      const finished = (error) =>{
        if(error){
          console.error(error);
          return;
        }
      }
      const dictString = JSON.stringify(articles);
      fs.writeFile(`${articles.Key}.json`, dictString, finished);
      
      // returns the details of the path
      let pathObj = path.parse(`${articles.Key}.json`);
      console.log(pathObj);
    };
    saveData(fetchArticles[0]);
  }

  // close the browsers when finish collecting the data
  await browser.close();
})();

