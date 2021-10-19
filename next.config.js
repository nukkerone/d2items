module.exports = {
  images: {
    domains: ['diablo2.io'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/uniques',
        permanent: true
      }
    ]
  }
}