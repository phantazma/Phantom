{
  "version": 2,
  "builds": [{ "src": "addon.js", "use": "@vercel/node" }],
  "routes": [{ "src": "(.*)", "dest": "addon.js" }]
}
