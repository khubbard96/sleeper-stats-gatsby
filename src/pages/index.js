import * as React from "react"
import { graphql, Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import { Seo } from "../components/seo"

const IndexPage = props => {
  return (
    <Layout>
      <section className="py-5 text-center container">
        <div className="row py-lg-5">
          <div className="col-lg-6 col-md-8 mx-auto">
            <h1 className="fw-light">Hello</h1>
            <p className="lead text-muted">
              {" "}
              Welcome to the dynasty league advanced metrics app.
            </p>
            <StaticImage
              src="../images/gatsby-astronaut.png"
              width={300}
              quality={95}
              formats={["AUTO", "WEBP"]}
              alt="A Gatsby astronaut"
              className="img-fluid"
            />
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default IndexPage

export const Head = () => <Seo />

