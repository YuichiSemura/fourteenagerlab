module.exports = {
  // mode: "development",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { url: false },
          },
        ],
      },
      {
        test: /\.scss/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { url: false },
          },
          {
            loader: "sass-loader",
            options: {},
          },
        ],
      },
    ],
  },
};
