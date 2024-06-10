# Macro Calculator

Electron app that runs a hosted react web app locally.
Add your food intake and calculate your macro destribution.

## Screenshots

![Screenshot](<Macro-calc Screenshot 2024-06-10 132457.png>)

## Features

- Add food intake.
- Calculate macro destribution.
- Delete food intake.
- Low carb and high carb mode

## Data

Change `public/static_products.json` file to you're own food macro data.

Example. Macros data is always pr 100g.

```
    {
        "category": "ULC",
        "name": "Bacon",
        "macrosPrHundred": {
            "fat": 0.28,
            "protein": 0.14,
            "carbs": 0
        }
    }
```

## Technologies

- Electron.js
- Node.js
- React.js
- Bootstrap.js

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
