# Sockets

**A showcase application displaying real-time data about the statuses of charging stations for electrical vehichles.**

Uses real-time data from the API provided by [NOBIL](http://info.nobil.no/) as the source of data, and shows users the status of all charging stations in Norway which send real-time data.

The status of available, occupied, errorneous and unknown connetors on the charging stations is **calculated based on the extent of the map**. If you look at a city, you will see the status for that city only. This way you can achieve a quick overview over your location of interest and get real-time updates.

---

### Todo

1. Launch website (scheduled by 11.05.2016)
2. Refactor some rough edges on server-side and order files on client (undetermined)

---

### Screenshots of the application

#### An image showing charging stations in Norway
![Charging stations Norway](/example.PNG)

#### An image showing charging stations in Trondheim
![charging stations Trondheim, Norway](/example_tr.PNG)


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
---


