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
- Screen for no results
- Merge same foods in food list

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

### Misc:
- Had to update whitelisted IPs when internet went down?
- Add FatSecret Attribution
- ERROR  [Error: Missing metric serving unit for food item]
- Error getting autocomplete suggestions: [TypeError: Cannot read property 'suggestion' of null]