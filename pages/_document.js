import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="stylesheet" href="https://use.typekit.net/mch6lui.css" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <script src="https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js"></script>

        </body>
      </Html>
    )
  }
}

export default MyDocument