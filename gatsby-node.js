const path = require(`path`);
const { createFilePath } = require(`gatsby-source-filesystem`);
var fs = require('fs');

let comicData = [];
let charSettData = [];
fs.readFile(`./src/data/comicData.json`, 'utf8', function (err, data) {
  if (err) throw err;
  comicData = JSON.parse(data);
});
fs.readFile(`./src/data/characterSettingData.json`, 'utf8', function (err, data) {
  if (err) throw err;
  charSettData = JSON.parse(data);
});

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions  
    // Create pages for each COMIC entry.
    const template = path.resolve(`./src/templates/comic-page.js`);
    comicData.forEach(( chapter ) => {
      const comicNames = [
        "Heroine Rises",
        "One Shots",
        "FireStarter"
      ]
  
      const comicNameURL = [
        "heroine-rises",
        "one-shots",
        "firestarter"
      ]
  
      let chapterTitle = chapter.title;
      let comicId = comicNameURL[chapter.comicId];
      let chapterId = chapter.chapter;
      let chapterPages = chapter.pages;
      let comicName = comicNames[chapter.comicId];
      let comicSeriesID = chapter.comicId;
  
      let filteredData = comicData.filter((dataObj) => {
        return dataObj.comicId === comicSeriesID;
      });
  
      if(filteredData.length > 20){
        filteredData = filteredData.slice(-20);
      }
  
      filteredData.reverse();
  
      for (let i = 0 ; i<chapterPages ; i++){
        let pathName = `${comicId}/${chapterId}/${i}`
        console.log(pathName);
        let currentPage = i;
        createPage({
          path:pathName,
          component: template,
  
          // Send additional data to page from JSON (or query inside template)
          context: {
            comicData:filteredData,
            slug:pathName,
            chapterTitle,
            comicName,
            chapterPages,
            chapterId,
            currentPage,
            comicId: comicSeriesID,
          }
        });
      }
      
      });
      let harbourComicFiltered = comicData.filter((dataObj)=>{
        return dataObj.comicId === 0;
      })

      let oneShotsFiltered = comicData.filter((dataObj)=>{
        return dataObj.comicId === 1;
      })

      let fireStarterFiltered = comicData.filter((dataObj)=> {
        return dataObj.comicId === 2;
      })

      createPage({
        path: `heroine-rises-chapters`,
        component:path.resolve(`./src/templates/comic-overview.js`),
        context:{
          comicData: harbourComicFiltered,
          comicId:0,
          comicTitle:"Heroine Rises"
        }
      })
      createPage({
        path:'one-shots-chapters',
        component:path.resolve(`./src/templates/comic-overview.js`),
        context:{
          comicData:oneShotsFiltered,
          comicId:1,
          comicTitle:"One Shots"
        }
      })
      createPage({
        path:'firestarter-chapters',
        component:path.resolve(`./src/templates/comic-overview.js`),
        context:{
          comicData:fireStarterFiltered,
          comicId:2,
          comicTitle:"FireStarter"
        }
      })

  const infoTemplate = path.resolve(`src/templates/info-page.js`)
  const result = graphql(`
    {
      allMarkdownRemark(
        filter: {frontmatter: {path: {ne:null}}}
        sort: { order: ASC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              path
            }
          }
        }
      }
    }
  `).then(result => {
    console.log(result);
    if (result.errors) {
      reporter.panicOnBuild(`Error while running GraphQL query.`)
      return
    }
    result.data.allMarkdownRemark.edges.forEach(({ node },i) => {
      console.log(node.frontmatter.path, i);
      createPage({
        path: node.frontmatter.path,
        component: infoTemplate,
        context: {
          stats: charSettData[i].stats,
          physical: charSettData[i].physical,
        }, // additional data can be passed via context
      })
    })
  })

      return graphql(
        `
        {
          allContentfulBlogPost {
            edges {
              node {
                slug
                coverImage {
                  resize(width: 300) {
                    src
                  }
                }
                childContentfulBlogPostContentRichTextNode {
                  json
                }
                publishDate
                title
              }
            }
          }
        }
        `
      ).then(result => {
        if(result.errors){
          throw result.errors
        }
        const blogTemplate = path.resolve(`./src/templates/blog-post.js`);
        result.data.allContentfulBlogPost.edges.forEach((post)=>{
          createPage({
            path:'blog/' + post.node.slug,
            component: blogTemplate,
            context:{
              slug:post.node.slug,
            }
          })
        })
      })
}

/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
