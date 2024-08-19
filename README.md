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

### Home:
- Stop meals from moving position on home screen, fix them in place
- Ability to close meal menu
- Fix long food item names messing up calorie alignment 
- Display nutrients prettier

### Settings:
- Logout option
- Delete account option

### History:
- History screen shows a calendar
- When a day is clicked on, load that days meal log
- Will need to pass date around to update old logs

### Misc:
- Organize project files

### Future:
- I don't think we need to store Meal type inside any other types, investigate that
- Maybe make meal menu slide up from the bottom
- Empty daily log message
- Add a swipe feature to increment/decrement serving size by its default value
- Add FatSecret Attribution
- Switch to style sheets and touchable opacity
- Add animations and sounds
- Upload to google play or make shareable APK