import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import {
  productListReducer,
  productDetailReducer,
  productDetailByUserIdReducer,
  productDeleteReducer,
  productCreateReducer,
  productUpdateReducer,
  productReviewCreateReducer,
  productTopRatedReducer,
  productTopCategoryNameReducer,
} from './reducers/productReducers';
import {
  userLoginReducer,
  userRegisterReducer,
  userDetailsReducer,
  userUpdateProfileReducer,
  userListReducer,
  userDeleteReducer,
  userUpdateReducer,
  userDetailsProductCreatorReducer,
  userAddWishItemReducer,
  userWishListReducer,
  userDeleteWishItemReducer,
  userDeleteRentedItemReducer,
} from './reducers/userReducers';
import {
  faqListReducer,
  faqDetailsReducer,
  faqDeleteReducer,
  faqCreateReducer,
  faqUpdateReducer,
  faqAnswersCreateReducer,
  faqAnswerDeleteReducer,
} from './reducers/faqReducers';
import {
  chatReducer,
  recentChatReducer,
  selectedChatReducer,
} from './reducers/chatReducers';
// import { notificationReducer } from './reducers/notificationReducers';

import {
  searchCreateReducer,
  searchListReducer,
} from './reducers/MostSearchReducers';

// create constants and reducer > as soon as added here state is visible in browser inspect tool/redux
const appReducer = combineReducers({
  productList: productListReducer,
  productDetails: productDetailReducer,
  productDetailsByUserId: productDetailByUserIdReducer,
  productDelete: productDeleteReducer,
  productCreate: productCreateReducer,
  productUpdate: productUpdateReducer,
  productReviewCreate: productReviewCreateReducer,
  productTopRated: productTopRatedReducer,
  productTopCategoryName: productTopCategoryNameReducer,
  userLogin: userLoginReducer,
  userRegister: userRegisterReducer,
  userDetails: userDetailsReducer,
  userUpdateProfile: userUpdateProfileReducer,
  userList: userListReducer,
  userDelete: userDeleteReducer,
  userUpdate: userUpdateReducer,
  userDetailsProductCreator: userDetailsProductCreatorReducer,
  userAddWishItem: userAddWishItemReducer,
  userWishList: userWishListReducer,
  userDeleteWishItem: userDeleteWishItemReducer,
  userDeleteRentedItem: userDeleteRentedItemReducer,
  faqList: faqListReducer,
  faqDetails: faqDetailsReducer,
  faqDelete: faqDeleteReducer,
  faqCreate: faqCreateReducer,
  faqUpdate: faqUpdateReducer,
  faqAnswersCreate: faqAnswersCreateReducer,
  faqAnswerDelete: faqAnswerDeleteReducer,
  chat: chatReducer,
  recentChat: recentChatReducer,
  selectedChat: selectedChatReducer,
  searchCreate: searchCreateReducer,
  searchList: searchListReducer,
});

// from userActions
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const preloadedState = {
  userLogin: { userInfo: userInfoFromStorage },
};

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  blacklist: [
    'productTopCategoryName',
    'productList',
    'userDetailsProductCreator',
  ],
};

const persistedReducer = persistReducer(persistConfig, appReducer);

const store = configureStore({
  reducer: persistedReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;
