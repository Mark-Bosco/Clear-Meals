## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

3. Start the proxy server
   ```bash
   cd backend
   node proxy
   ```


## TODO
### Auth:
- Delete account option
- Move proxy server to cloud

### Search:
- Screen for no results
- Merge same foods (foodIds) in food search list (via FoodListContext add)

### Home:
- Merge same foods when home screen is loaded 
- Allow edits to logged foods from main menu
- Empty daily log message

### Settings:
- Logout option
- Delete account option

### History:
- History screen shows a calendar
- When a day is clicked on, load that days meal log

### Misc:
- Organize project files

### Future:
- Add a swipe feature to increment/decrement serving size by its default value
- Add FatSecret Attribution
- Switch to style sheets and touchable opacity
- Add animations and sounds
- Upload to google play or make shareable APK