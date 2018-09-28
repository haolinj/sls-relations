# sls relations

If you have multiple serverless services (https://serverless.com/) that belong to one project and they have dependencies to each other when deploy, use this to visualize their relationships and get an overview of the dependencies and Functions/Resources.

The client side of this application was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

And thanks to vis.js and js-yaml that made parse the serverless.yml and graphing possible:
- http://visjs.org/
- https://github.com/nodeca/js-yaml

Three components:
- server (server/): responsible for just parse the uploaded yml files. (I suppose we just parse the files on client side without the uploading, but server is good to have) :)
- client (src/): web application that does the upload and graph plotting.
- tools (tools/): node script that scans a folder and find all serverless.yml files inside the folder and sub folders.

Install:
```
npm install
```

Start server:
```
cd server
node index.js
```

Start client:
```
export REACT_APP_API_SERVER_URL={your server url}
npm start
```

Run tools to get files:
```
cd tools
node index.js /path/to/parent/folder/of/all/serverless/projects /path/to/output 2 # This 2 means the folder scan depth.
```

