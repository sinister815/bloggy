/*
Redux store is used to maintain the global state of an application in a single centralized location so that different components can access and update shared data in a predictable and manageable way.
*/

// A Redux store is used to keep all important data of the app in one place so every component can use it.

import { configureStore } from "@reduxjs/toolkit";
// configureStore is a Redux Toolkit function used to create a Redux store with good default settings.

/*
 configureStore takes ONE OBJECT PARAMETER that contains different options to configure the Redux store.

| Parameter        | Purpose                                |
| ---------------- | -------------------------------------- |
| `reducer`        | Defines how state updates              |
| `middleware`     | Adds extra processing (API calls etc.) |
| `devTools`       | Enables Redux debugging                |
| `preloadedState` | Initial state of store                 |
| `enhancers`      | Extends store functionality            |


 */

import authReducer from "./authSlice";
 const store = configureStore({
    reducer: {
        auth: authReducer
    }
})

export default store