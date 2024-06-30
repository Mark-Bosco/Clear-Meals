## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```


## Next Dev Steps:

- Fix config so that backend gets valid credentials 
- Integrate user accounts with fatsecret API so that each user gets their own access token
- Store user access tokens using async
- Create the search screen
- Create a function in SearchScreen to add a selected food to a meal (you'll need to manage meal state, possibly in a context or Redux).
- Use DailyLog in your main app component or a dedicated screen to display the user's daily food intake.
-  Implement AsyncStorage to save and load DailyLog data.
- Consider creating a MealContext or using Redux to manage the global state of meals and daily logs.