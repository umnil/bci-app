Steps to build:

Note: have NPM and Yarn installed

1. run `npm install -g expo-cli eas react-native-cli` 
2. run `yarn add package.json`
3. run `npx expo-doctor` and make sure all tests pass
4. create an expo account at https://expo.dev/signup
5. run `eas login` and input account info from step 3 
6. run `eas device:create` and input device info

FOR IOS: 

7. run `eas build --profile development --platform ios` 
8. after step 7, a QR code should appear in terminal, scan this to install the development build on your iphone
9. run `npx expo start --dev-client --tunnel`
10. after step 9, a QR code should appear in terminal, scan this to connect your development app to the server 



