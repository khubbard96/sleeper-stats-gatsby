/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */

// You can delete this file if you're not using it
const path = require("path");

exports.onCreatePage = async ({page, actions}) =>{
    const {createPage} = actions
    console.log('Page - ' + page.page);
    if(page.path.match(/^\/app\/year/)){
        createPage({
            path: "/app/year",
            matchPath: "/app/year/:year",
            component: path.resolve("src/pages/app/year.js")
        })
    }
}