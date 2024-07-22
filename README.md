## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```


## TODO
### Auth:
- Delete account option
- Move proxy server to cloud

### Search:
- Search suggestions
- Load search food list into cloud storage
- Screen for no results
- Editable search food list items

### Nutrition Screen:
- Add a swipe feature to increment serving size by its default value
- IMPORTANT: The only storable values are food_id and serving_id

### Home:
- Load the daily log to display it on the home screen
- Allow edits to logged foods from main menu
- Settings screen (logout, delete account, load/export daily logs)
- Empty daily log message

### History:
- Calendar screen to load past meal logs

### Future:
- Save user's daily logs to cloud and sync when logged in
- Implement premium FatSecret API

### Misc:
- Had to update whitelisted IPs when internet went down?
- Add FatSecret Attribution
- ERROR  [Error: Missing metric serving unit for food item]