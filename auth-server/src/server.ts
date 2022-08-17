import * as fs from "fs";

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());

const port = 3000;
const TOKEN_SECRET = 'RANDOM_S3CR3T';
const PRIVATE_KEY = fs.readFileSync('../jwt_key_private.pem');
const PUBLIC_KEY = fs.readFileSync('../jwt_key_public.pem');

import { sign, verify } from "jsonwebtoken";

export const encodeToken = (data: string) => {
  const iat = Date.now();
  const payload = {
    exp: iat + 60 * 60 * 24 * 14,
    iat, //issued at
    sub: data
  };
  return sign(payload, PRIVATE_KEY, { algorithm: 'RS256'});
};

const decodeToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }, (err, payload: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
};


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/token', (req, res) => {
  const token = encodeToken('some data');
  res.status(200).json({
    status: "success",
    token,
  });
})

app.get('/decode', async (req, res) => {
  console.log('Received request');
  if (!(req.headers && req.headers.authorization)) {
    console.error("Please log in");
    return res.status(401).json({
      status: "failure",
    });
  }
  // decode the token
  const header = req.headers.authorization.split(" ");
  console.log(header);
  const token = header[1];
  let payload = null;
  try {
    payload = await decodeToken(token);
  } catch (e) {
    console.error("An error occurred while decoding jwt token.");
    return res.status(401).json({
      status: "failure",
    });
  }

  res.status(200).json({
    status: "success",
    payload,
  });
})

app.get('/cookie-token', (req, res) => {
  const token = encodeToken('some data');
  res.cookie('jwt-token', token, { expires: new Date(Date.now() + 60 * 60 * 24 * 7) })
  res.status(200).json({
    status: "success",
  });
})

app.get('/cookie-decode', async (req, res) => {
  console.log(req.cookies);
  if (!(req.cookies && req.cookies['jwt-token'])) {
    console.error("Please log in");
    return res.status(401).json({
      status: "failure",
    });
  }

  // decode the token
  const token = req.cookies['jwt-token'];
  let payload = null;
  try {
    payload = await decodeToken(token);
  } catch (e) {
    console.error("An error occurred while decoding jwt token.");
    return res.status(401).json({
      status: "failure",
    });
  }

  return res.status(200).json({
    status: "success",
    payload,
  });
})

app.listen(port, () => {
  console.log(`Authentication server listening on port ${port}`)
})
