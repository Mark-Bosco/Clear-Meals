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

### Search:
- Move nutrition facts to seperate component file

### Home:
- Stop meals from moving position on home screen, fix them in place
- Ability to close meal menu
- Fix long food item names messing up calorie alignment 

### Settings:
- Delete user's data from firebase after account deletion

### History:
- Improve frontend
   - Center, replace blue with green

### Misc:
- Remove console logging for performance
- Switch to style sheets
- Make shareable APK
- Add name and icon

### Future:
- Screen for no results
- Optimze reload logic
- I don't think we need to store Meal type inside any other types, investigate that
- Maybe make meal menu slide up from the bottom
- Empty daily log message
- Add a swipe feature to increment/decrement serving size by its default value
- Add FatSecret Attribution
- Add animations and sounds
- Upload to google play or 