import { createStore } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import loginReducer from "./loginSlice";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'login',
  storage
}

const persistedReducer = persistReducer(persistConfig, loginReducer);

// export const store = configureStore({
//   reducer: {
//     login: loginReducer    
//   }
// });

// export default store;

export default () => {
  let store = createStore(persistedReducer);
  let persistor = persistStore(store);
  return { store, persistor }
}