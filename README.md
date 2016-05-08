# Sockets

**A showcase application displaying real-time data about the statuses of charging stations for electrical vehichles.**

Uses real-time data from the API provided by [NOBIL](http://info.nobil.no/) as the source of data, and shows users the status of all charging stations in Norway which send real-time data.

---

To get the application up and running you need an API Key from NOBIL and a `secrets.json` file containing it.

```javascript
{
  apiKey: <YOUR_KEY>
}
```

When this is set up, all you need to do is (assuming you have node and gulp installed) run:
```cmd
npm install
gulp rebuild
node www/server.js
```


