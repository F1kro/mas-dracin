const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://sapi.dramabox.be',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
      onProxyReq: (proxyReq, req, res) => {
        // Tambahkan header jika perlu
        proxyReq.setHeader('Origin', 'https://sapi.dramabox.be');
      }
    })
  );
};